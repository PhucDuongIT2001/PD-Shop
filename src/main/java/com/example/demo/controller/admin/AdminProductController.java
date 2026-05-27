package com.example.demo.controller.admin;

import com.example.demo.dto.ProductRequestDTO;
import com.example.demo.entity.Product;
import com.example.demo.service.AdminProductService;
import com.example.demo.service.ExcelImportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Controller for handling product CRUD operations in the Admin panel.
 */
@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;
    private final ExcelImportService  excelImportService;

    public AdminProductController(AdminProductService adminProductService,
                                  ExcelImportService excelImportService) {
        this.adminProductService = adminProductService;
        this.excelImportService  = excelImportService;
    }

    @GetMapping
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int size, // Use large size for admin list
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(adminProductService.getProducts(page, size, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(adminProductService.getProductById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProduct(
            @Valid @ModelAttribute ProductRequestDTO dto,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminProductService.saveProduct(dto, thumbnail));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @ModelAttribute ProductRequestDTO dto,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        dto.setId(id);
        return ResponseEntity.ok(adminProductService.saveProduct(dto, thumbnail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/admin/products/import
     * Accepts a multipart .xlsx file and bulk-imports products.
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importProducts(
            @RequestPart("file") MultipartFile file) {
        try {
            List<Product> imported = excelImportService.importFromExcel(file);
            return ResponseEntity.ok(Map.of(
                    "message", "Import thành công " + imported.size() + " sản phẩm.",
                    "count", imported.size()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Không thể đọc file Excel: " + e.getMessage()));
        }
    }
}
