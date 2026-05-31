package com.example.demo.service;

import com.example.demo.dto.ar.ProductArAssetDto;
import com.example.demo.dto.ar.ProductArAssetRequestDto;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductArAsset;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductArAssetRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for managing AR assets linked to products.
 *
 * <p>Design decision: one AR asset per product (upsert semantics).
 * If a product already has an asset, calling save will update it in-place
 * rather than creating a duplicate row.</p>
 */
@Service
public class ProductArAssetService {

    private final ProductArAssetRepository arAssetRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public ProductArAssetService(ProductArAssetRepository arAssetRepository,
                                 ProductRepository productRepository,
                                 FileStorageService fileStorageService) {
        this.arAssetRepository = arAssetRepository;
        this.productRepository = productRepository;
        this.fileStorageService = fileStorageService;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Upsert (create or update) the AR asset for the given product.
     *
     * @param productId  the product to attach the asset to
     * @param requestDto fields to set / update
     * @return the persisted asset as a DTO
     * @throws ResourceNotFoundException if the product does not exist
     * @throws IllegalArgumentException  if neither GLB nor USDZ URL is provided
     */
    @Transactional
    public ProductArAssetDto upsertArAsset(Long productId, ProductArAssetRequestDto requestDto) {
        validateAtLeastOneUrl(requestDto);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product with id " + productId + " not found"));

        // Upsert: reuse existing row if present
        ProductArAsset asset = arAssetRepository.findFirstByProductId(productId)
                .orElseGet(ProductArAsset::new);

        asset.setProduct(product);
        applyRequest(asset, requestDto);

        ProductArAsset saved = arAssetRepository.save(asset);
        return toDto(saved);
    }

    @Transactional
    public ProductArAssetDto upsertArAssetWithFiles(Long productId, ProductArAssetRequestDto requestDto, MultipartFile glbFile, MultipartFile usdzFile) {
        if (glbFile != null && !glbFile.isEmpty()) {
            String url = fileStorageService.storeFile(glbFile, "ar-models");
            requestDto.setModelGlbUrl(url);
        }
        if (usdzFile != null && !usdzFile.isEmpty()) {
            String url = fileStorageService.storeFile(usdzFile, "ar-models");
            requestDto.setModelUsdzUrl(url);
        }
        return upsertArAsset(productId, requestDto);
    }

    /**
     * Retrieve the AR asset for a product.
     *
     * @param productId the product whose AR asset is requested
     * @return the AR asset DTO
     * @throws ResourceNotFoundException if no AR asset exists for the product
     */
    @Transactional(readOnly = true)
    public ProductArAssetDto getArAssetByProductId(Long productId) {
        // Verify the product itself exists first so the error message is clear
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException(
                    "Product with id " + productId + " not found");
        }

        ProductArAsset asset = arAssetRepository.findFirstByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No AR asset found for product id " + productId));

        return toDto(asset);
    }

    /**
     * Retrieve all AR assets currently configured.
     * Used by the AR room planner.
     */
    @Transactional(readOnly = true)
    public java.util.List<ProductArAssetDto> getAllArAssets() {
        return arAssetRepository.findAll().stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Delete the AR asset for a product.
     *
     * @param productId the product whose AR asset should be removed
     * @throws ResourceNotFoundException if no AR asset exists for the product
     */
    @Transactional
    public void deleteArAsset(Long productId) {
        ProductArAsset asset = arAssetRepository.findFirstByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No AR asset found for product id " + productId));
        arAssetRepository.delete(asset);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private void applyRequest(ProductArAsset asset, ProductArAssetRequestDto dto) {
        if (dto.getModelGlbUrl() != null) {
            asset.setModelGlbUrl(dto.getModelGlbUrl().isBlank() ? null : dto.getModelGlbUrl().trim());
        }
        if (dto.getModelUsdzUrl() != null) {
            asset.setModelUsdzUrl(dto.getModelUsdzUrl().isBlank() ? null : dto.getModelUsdzUrl().trim());
        }
        // Default arType to "auto" when not supplied
        asset.setArType(dto.getArType() != null && !dto.getArType().isBlank()
                ? dto.getArType().trim()
                : (asset.getArType() != null ? asset.getArType() : "auto"));
        // Default scaleFactor to 1.0 when not supplied
        asset.setScaleFactor(dto.getScaleFactor() != null
                ? dto.getScaleFactor()
                : (asset.getScaleFactor() != null ? asset.getScaleFactor() : 1.0));
                
        if (dto.getEnvironmentMapUrl() != null) {
            asset.setEnvironmentMapUrl(dto.getEnvironmentMapUrl().isBlank() ? null : dto.getEnvironmentMapUrl().trim());
        }
        
        if (dto.getAvailableColors() != null) {
            asset.setAvailableColors(dto.getAvailableColors().isBlank() ? null : dto.getAvailableColors().trim());
        }

        if (dto.getHotspots() != null) {
            if (asset.getHotspots() == null) {
                asset.setHotspots(new java.util.ArrayList<>());
            } else {
                asset.getHotspots().clear();
            }
            
            for (com.example.demo.dto.ar.ArHotspotDto hotspotDto : dto.getHotspots()) {
                com.example.demo.entity.ArHotspot hotspot = new com.example.demo.entity.ArHotspot();
                hotspot.setArAsset(asset);
                hotspot.setName(hotspotDto.getName());
                hotspot.setPosition(hotspotDto.getPosition());
                hotspot.setNormal(hotspotDto.getNormal());
                hotspot.setLabelText(hotspotDto.getLabelText());
                asset.getHotspots().add(hotspot);
            }
        }
    }

    private void validateAtLeastOneUrl(ProductArAssetRequestDto dto) {
        boolean hasGlb = dto.getModelGlbUrl() != null && !dto.getModelGlbUrl().isBlank();
        boolean hasUsdz = dto.getModelUsdzUrl() != null && !dto.getModelUsdzUrl().isBlank();
        if (!hasGlb && !hasUsdz) {
            throw new IllegalArgumentException(
                    "At least one of modelGlbUrl (Android) or modelUsdzUrl (iOS) must be provided");
        }
    }

    private ProductArAssetDto toDto(ProductArAsset asset) {
        java.util.List<com.example.demo.dto.ar.ArHotspotDto> hotspotDtos = null;
        if (asset.getHotspots() != null) {
            hotspotDtos = asset.getHotspots().stream()
                    .map(h -> new com.example.demo.dto.ar.ArHotspotDto(h.getId(), h.getName(), h.getPosition(), h.getNormal(), h.getLabelText()))
                    .collect(java.util.stream.Collectors.toList());
        }
        return new ProductArAssetDto(
                asset.getId(),
                asset.getProduct().getId(),
                asset.getProduct().getName(),
                asset.getProduct().getPrice(),
                asset.getProduct().getThumbnail(),
                asset.getModelGlbUrl(),
                asset.getModelUsdzUrl(),
                asset.getArType(),
                asset.getScaleFactor(),
                asset.getEnvironmentMapUrl(),
                asset.getAvailableColors(),
                hotspotDtos
        );
    }
}
