package com.example.demo.service;

import com.example.demo.dto.ProductDto;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.ProductMapper;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Autowired
    public ProductService(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    /**
     * Finds a paginated list of products for the public-facing site.
     * Always returns DTOs.
     */
    public Page<ProductDto> getProducts(int page, int size, String keyword, Long categoryId, Long brandId, Boolean isNew, Double minPrice, Double maxPrice, String sortBy) {
        Sort sort = Sort.by("createdAt").descending();
        if (sortBy != null) {
            if (sortBy.equalsIgnoreCase("priceAsc")) {
                sort = Sort.by("price").ascending();
            } else if (sortBy.equalsIgnoreCase("priceDesc")) {
                sort = Sort.by("price").descending();
            } else if (sortBy.equalsIgnoreCase("newest")) {
                sort = Sort.by("createdAt").descending();
            } else if (sortBy.equalsIgnoreCase("soldDesc") || sortBy.equalsIgnoreCase("bestSeller")) {
                sort = Sort.by("soldQuantity").descending();
            }
        }
        
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);

        // Use the new searchProducts query which handles nulls for all optional parameters
        return productRepository.searchProducts(
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                categoryId,
                brandId,
                isNew,
                thirtyDaysAgo,
                minPrice,
                maxPrice,
                pageable
        ).map(productMapper::toProductDto);
    }

    /**
     * Finds a single product by its ID for the public-facing site.
     * Returns a DTO and is cacheable.
     */
    @Cacheable(value = "productDetails", key = "#id")
    public ProductDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::toProductDto)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
}
