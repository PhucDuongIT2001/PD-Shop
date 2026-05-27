package com.example.demo.service;

import com.example.demo.entity.Brand;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.entity.enums.ProductStatus;
import com.example.demo.repository.BrandRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Service for importing products from an Excel (.xlsx) file.
 *
 * Expected column order (0-indexed):
 *   0 – Tên sản phẩm  (required)
 *   1 – Giá bán       (required, numeric)
 *   2 – Tồn kho       (optional, numeric, default 0)
 *   3 – SKU           (optional)
 *   4 – Danh mục      (optional, category name)
 *   5 – Thương hiệu   (optional, brand name)
 *   6 – Mô tả         (optional)
 */
@Service
public class ExcelImportService {

    private static final Pattern NONLATIN   = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final ProductRepository  productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository    brandRepository;

    public ExcelImportService(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              BrandRepository brandRepository) {
        this.productRepository  = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository    = brandRepository;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Parse the uploaded Excel file and persist all valid rows.
     *
     * @param file the .xlsx / .xls multipart file
     * @return list of saved {@link Product} entities
     * @throws IOException              if the stream cannot be read
     * @throws IllegalArgumentException if the file is empty or has no data rows
     */
    @Transactional
    public List<Product> importFromExcel(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File Excel không được để trống.");
        }

        List<Product> saved = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new IllegalArgumentException("File Excel không có sheet nào.");
            }

            // Row 0 is the header – start from row 1
            for (int rowIdx = 1; rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null || isRowEmpty(row)) continue;

                Product product = mapRowToProduct(row, rowIdx + 1);
                if (product != null) {
                    saved.add(productRepository.save(product));
                }
            }
        }

        if (saved.isEmpty()) {
            throw new IllegalArgumentException("Không có dòng dữ liệu hợp lệ nào trong file.");
        }

        return saved;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Product mapRowToProduct(Row row, int displayRow) {
        String name = getCellString(row, 0);
        if (name == null || name.isBlank()) {
            return null; // skip rows without a product name
        }

        Double price = getCellDouble(row, 1);
        if (price == null || price <= 0) {
            return null; // skip rows without a valid price
        }

        Product product = new Product();
        product.setName(name.trim());
        product.setPrice(price);
        product.setSlug(generateUniqueSlug(name, null));

        // Tồn kho
        Double stockRaw = getCellDouble(row, 2);
        product.setQuantity(stockRaw != null ? stockRaw.intValue() : 0);

        // SKU
        String sku = getCellString(row, 3);
        if (sku != null && !sku.isBlank()) {
            product.setSku(sku.trim());
        }

        // Danh mục
        String categoryName = getCellString(row, 4);
        if (categoryName != null && !categoryName.isBlank()) {
            categoryRepository.findByNameIgnoreCase(categoryName.trim())
                    .ifPresent(product::setCategory);
        }

        // Thương hiệu
        String brandName = getCellString(row, 5);
        if (brandName != null && !brandName.isBlank()) {
            brandRepository.findByNameIgnoreCase(brandName.trim())
                    .ifPresent(product::setBrand);
        }

        // Mô tả
        String description = getCellString(row, 6);
        if (description != null && !description.isBlank()) {
            product.setDescription(description.trim());
        }

        product.setStatus(ProductStatus.ACTIVE);
        product.setDeleted(false);

        return product;
    }

    /** Returns the string value of a cell regardless of its type. */
    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue();
            case NUMERIC -> {
                double d = cell.getNumericCellValue();
                // Avoid "1.0" for whole numbers
                yield (d == Math.floor(d)) ? String.valueOf((long) d) : String.valueOf(d);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try { yield cell.getStringCellValue(); }
                catch (Exception e) { yield String.valueOf(cell.getNumericCellValue()); }
            }
            default -> null;
        };
    }

    /** Returns the numeric value of a cell, or null if not parseable. */
    private Double getCellDouble(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING  -> {
                try { yield Double.parseDouble(cell.getStringCellValue().trim()); }
                catch (NumberFormatException e) { yield null; }
            }
            default -> null;
        };
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private String generateUniqueSlug(String name, Long currentId) {
        String base    = generateSlug(name);
        String slug    = base;
        int    counter = 1;
        while (productRepository.findBySlug(slug)
                .filter(p -> !p.getId().equals(currentId)).isPresent()) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        String noWhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized   = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        return NONLATIN.matcher(normalized).replaceAll("").toLowerCase(Locale.ENGLISH);
    }
}
