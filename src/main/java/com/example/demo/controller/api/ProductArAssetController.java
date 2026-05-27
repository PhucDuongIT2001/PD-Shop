package com.example.demo.controller.api;

import com.example.demo.dto.ar.ProductArAssetDto;
import com.example.demo.service.ProductArAssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public REST endpoint for clients (mobile apps, web AR viewers) to fetch
 * the AR asset associated with a product.
 *
 * Base path: /api/products/{productId}/ar-asset
 *
 * No authentication required — permitted in SecurityConfig for GET requests.
 */
@RestController
@RequestMapping("/api/products/{productId}/ar-asset")
public class ProductArAssetController {

    private final ProductArAssetService arAssetService;

    public ProductArAssetController(ProductArAssetService arAssetService) {
        this.arAssetService = arAssetService;
    }

    /**
     * GET /api/products/{productId}/ar-asset
     *
     * Returns the AR asset for the given product so that the client can:
     * - Load the .glb model via Android Scene Viewer or &lt;model-viewer&gt;
     * - Load the .usdz model via iOS / iPadOS AR Quick Look
     *
     * Response example:
     * {
     *   "id": 1,
     *   "productId": 42,
     *   "productName": "Ergonomic Chair",
     *   "modelGlbUrl": "https://cdn.example.com/models/chair.glb",
     *   "modelUsdzUrl": "https://cdn.example.com/models/chair.usdz",
     *   "arType": "auto",
     *   "scaleFactor": 1.0
     * }
     *
     * Returns 404 if the product does not exist or has no AR asset.
     */
    @GetMapping
    public ResponseEntity<ProductArAssetDto> getArAsset(@PathVariable Long productId) {
        ProductArAssetDto dto = arAssetService.getArAssetByProductId(productId);
        return ResponseEntity.ok(dto);
    }
}
