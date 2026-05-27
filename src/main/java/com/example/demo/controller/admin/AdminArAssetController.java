package com.example.demo.controller.admin;

import com.example.demo.dto.ar.ProductArAssetDto;
import com.example.demo.dto.ar.ProductArAssetRequestDto;
import com.example.demo.service.ProductArAssetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints for Admin to manage AR assets attached to products.
 *
 * Base path: /api/admin/products/{productId}/ar-asset
 *
 * All endpoints require ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/products/{productId}/ar-asset")
@PreAuthorize("hasRole('ADMIN')")
public class AdminArAssetController {

    private final ProductArAssetService arAssetService;

    @Autowired
    public AdminArAssetController(ProductArAssetService arAssetService) {
        this.arAssetService = arAssetService;
    }

    /**
     * GET /api/admin/products/{productId}/ar-asset
     * Retrieve the current AR asset for a product (admin view).
     */
    @GetMapping
    public ResponseEntity<ProductArAssetDto> getArAsset(@PathVariable Long productId) {
        ProductArAssetDto dto = arAssetService.getArAssetByProductId(productId);
        return ResponseEntity.ok(dto);
    }

    /**
     * PUT /api/admin/products/{productId}/ar-asset
     * Create or update (upsert) the AR asset for a product.
     *
     * Body example:
     * {
     *   "modelGlbUrl":   "https://cdn.example.com/models/chair.glb",
     *   "modelUsdzUrl":  "https://cdn.example.com/models/chair.usdz",
     *   "arType":        "auto",
     *   "scaleFactor":   1.0
     * }
     */
    @PutMapping
    public ResponseEntity<ProductArAssetDto> upsertArAsset(
            @PathVariable Long productId,
            @Valid @RequestBody ProductArAssetRequestDto requestDto) {

        ProductArAssetDto saved = arAssetService.upsertArAsset(productId, requestDto);
        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/admin/products/{productId}/ar-asset
     * Remove the AR asset for a product.
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteArAsset(@PathVariable Long productId) {
        arAssetService.deleteArAsset(productId);
        return ResponseEntity.noContent().build();
    }
}
