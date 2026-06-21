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

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new IllegalArgumentException("Không tìm thấy dòng tiêu đề (Dòng 1).");
            }

            // Build dynamic header map
            java.util.Map<String, Integer> headerMap = new java.util.HashMap<>();
            for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                Cell cell = headerRow.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (cell != null && cell.getCellType() == CellType.STRING) {
                    headerMap.put(cell.getStringCellValue().trim().toLowerCase(), c);
                }
            }

            for (int rowIdx = 1; rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null || isRowEmpty(row)) continue;

                Product product = mapRowToProduct(row, headerMap);
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

    private Product mapRowToProduct(Row row, java.util.Map<String, Integer> headerMap) {
        // Find indices
        Integer idxName = getColIdx(headerMap, "name", "tên sản phẩm", "tensanpham", "tên", "shortdescription");
        Integer idxPrice = getColIdx(headerMap, "price", "giá bán", "giá", "gia");
        
        if (idxName == null || idxPrice == null) {
            return null; // required fields missing
        }

        String name = getCellString(row, idxName);
        Double price = getCellDouble(row, idxPrice);

        if (name == null || name.isBlank() || price == null || price <= 0) {
            return null;
        }

        Integer idxSku = getColIdx(headerMap, "sku", "mã sản phẩm");
        String sku = null;
        if (idxSku != null) {
            String s = getCellString(row, idxSku);
            if (s != null && !s.isBlank()) sku = s.trim();
        }

        Product product = null;
        if (sku != null) {
            product = productRepository.findBySku(sku).orElse(null);
        }

        if (product == null) {
            product = new Product();
            product.setSku(sku);
            product.setSlug(generateUniqueSlug(name, null));
        }
        
        product.setName(name.trim());
        product.setPrice(price);

        Integer idxBasePrice = getColIdx(headerMap, "baseprice", "giá gốc");
        if (idxBasePrice != null) product.setBasePrice(getCellDouble(row, idxBasePrice));

        Integer idxQuantity = getColIdx(headerMap, "quantity", "tồn kho", "số lượng");
        Double qty = idxQuantity != null ? getCellDouble(row, idxQuantity) : null;
        product.setQuantity(qty != null ? qty.intValue() : 0);

        Integer idxLowStock = getColIdx(headerMap, "lowstockthreshold", "ngưỡng sắp hết hàng");
        Double lowStock = idxLowStock != null ? getCellDouble(row, idxLowStock) : null;
        if (lowStock != null) product.setLowStockThreshold(lowStock.intValue());

        Integer idxCat = getColIdx(headerMap, "category_name", "category", "danh mục");
        if (idxCat != null) {
            String catName = getCellString(row, idxCat);
            if (catName != null && !catName.isBlank()) {
                categoryRepository.findByNameIgnoreCase(catName.trim()).ifPresent(product::setCategory);
            }
        }

        Integer idxBrand = getColIdx(headerMap, "brand_name", "brand", "thương hiệu");
        if (idxBrand != null) {
            String brandName = getCellString(row, idxBrand);
            if (brandName != null && !brandName.isBlank()) {
                brandRepository.findByNameIgnoreCase(brandName.trim()).ifPresent(product::setBrand);
            }
        }

        Integer idxDesc = getColIdx(headerMap, "description", "mô tả");
        if (idxDesc != null) {
            String desc = getCellString(row, idxDesc);
            if (desc != null && !desc.isBlank()) product.setDescription(desc.trim());
        }

        Integer idxShortDesc = getColIdx(headerMap, "shortdescription", "mô tả ngắn");
        if (idxShortDesc != null && !idxShortDesc.equals(idxName)) {
            String sDesc = getCellString(row, idxShortDesc);
            if (sDesc != null && !sDesc.isBlank()) product.setShortDescription(sDesc.trim());
        }

        Integer idxThumb = getColIdx(headerMap, "thumbnail", "hình ảnh");
        if (idxThumb != null) {
            String thumb = getCellString(row, idxThumb);
            if (thumb != null && !thumb.isBlank()) product.setThumbnail(thumb.trim());
        }

        Integer idxWarranty = getColIdx(headerMap, "warrantyperiod", "bảo hành");
        Double warranty = idxWarranty != null ? getCellDouble(row, idxWarranty) : null;
        if (warranty != null) product.setWarrantyPeriod(warranty.intValue());

        Integer idxIsNew = getColIdx(headerMap, "isnew", "hàng mới");
        if (idxIsNew != null) {
            String isNew = getCellString(row, idxIsNew);
            if (isNew != null && !isNew.isBlank()) product.setIsNew(isNew.trim());
        }

        Integer idxSpecs = getColIdx(headerMap, "fullspecifications", "thông số");
        if (idxSpecs != null) {
            String specs = getCellString(row, idxSpecs);
            if (specs != null && !specs.isBlank()) product.setFullSpecifications(specs.trim());
        }

        product.setStatus(ProductStatus.ACTIVE);
        product.setDeleted(false);

        return product;
    }

    private Integer getColIdx(java.util.Map<String, Integer> map, String... possibleNames) {
        for (String name : possibleNames) {
            if (map.containsKey(name)) return map.get(name);
        }
        return null;
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue();
            case NUMERIC -> {
                double d = cell.getNumericCellValue();
                yield (d == Math.floor(d)) ? String.valueOf((long) d) : String.valueOf(d);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

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
        String base = generateSlug(name);
        // Fallback khi tên tiếng Việt bị rỗng sau normalize
        if (base == null || base.isBlank()) {
            base = "product-" + System.currentTimeMillis();
        }
        String slug    = base;
        int    counter = 1;
        while (productRepository.findBySlug(slug)
                .filter(p -> currentId == null || !p.getId().equals(currentId)).isPresent()) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        // Bước 1: thay khoảng trắng bằng gạch ngang
        String noWhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        // Bước 2: NFD normalize để tách dấu khỏi ký tự
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        // Bước 3: xóa combining diacritical marks (chỉ xóa dấu, giữ lại chữ cái)
        String withoutDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        // Bước 4: xóa ký tự không phải chữ/số/gạch ngang, viết thường
        String slug = withoutDiacritics.replaceAll("[^a-zA-Z0-9-]", "").toLowerCase(Locale.ENGLISH);
        // Bước 5: xóa gạch ngang đầu/cuối thừa
        slug = slug.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
        return slug;
    }
}
