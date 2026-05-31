package com.example.demo.controller.api;

import com.example.demo.dto.ar.ProductArAssetDto;
import com.example.demo.service.ProductArAssetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/products/ar-assets")
public class ArAssetsListController {

    private final ProductArAssetService arAssetService;

    public ArAssetsListController(ProductArAssetService arAssetService) {
        this.arAssetService = arAssetService;
    }

    @GetMapping
    public ResponseEntity<List<ProductArAssetDto>> getAllArAssets() {
        return ResponseEntity.ok(arAssetService.getAllArAssets());
    }
}
