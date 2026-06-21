package com.example.demo.service;

import com.example.demo.audit.annotation.AuditAction;
import com.example.demo.dto.ProductRequestDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.Brand;
import com.example.demo.entity.Product;
import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.BrandRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.cache.annotation.CacheEvict;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Admin product service with RBAC + Audit annotations applied.
 *
 * Pattern explanation:
 *   - @PreAuthorize at the SERVICE layer (not just controller) provides
 *     defense-in-depth: even if a controller check is bypassed or a new
 *     internal caller is added, the service itself is protected.
 *
 *   - @AuditAction is placed on the same methods. The AOP aspect intercepts
 *     after @PreAuthorize succeeds (Spring applies security advice first),
 *     so we only audit successful authorized operations.
 *
 *   - The action label uses SCREAMING_SNAKE_CASE to match the audit log
 *     dashboard filter values.
 */
@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final FileStorageService fileStorageService;
    private final ProductArAssetService arAssetService;

    @Autowired
    public AdminProductService(ProductRepository productRepository,
                               CategoryRepository categoryRepository,
                               BrandRepository brandRepository,
                               FileStorageService fileStorageService,
                               ProductArAssetService arAssetService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.fileStorageService = fileStorageService;
        this.arAssetService = arAssetService;
    }

    private static final Pattern NONLATIN   = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    // ── Read — available to STAFF, MANAGER, ADMIN ────────────────────────────

    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public Page<Product> getProducts(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        if (keyword != null && !keyword.trim().isEmpty()) {
            return productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        }
        return productRepository.findAll(pageable);
    }

    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " not found!"));
    }

    // ── Create / Update — MANAGER and ADMIN only ─────────────────────────────

    /**
     * Handles both create and update.
     * The audit action differentiates based on whether dto.getId() is null.
     *
     * For price-change auditing: the AOP aspect captures the DTO (old state = dto arg,
     * new state = returned Product). For complete price history you could
     * split this into separate createProduct / updateProduct methods,
     * each with a distinct @AuditAction label.
     */
    @Transactional
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE') or hasAuthority('PRODUCT_CREATE')")
    @AuditAction(action = "SAVE_PRODUCT", entityType = "Product")
    @CacheEvict(value = "productDetails", key = "#result.id")
    public Product saveProduct(ProductRequestDTO dto, MultipartFile thumbnail) {
        Product product;
        String slug = generateUniqueSlug(dto.getName(), dto.getId());

        if (dto.getId() == null) {
            if (dto.getSku() != null && !dto.getSku().isEmpty()
                    && productRepository.existsBySku(dto.getSku())) {
                throw new DuplicateResourceException("SKU already exists!");
            }
            product = new Product();
            product.setSlug(slug);
        } else {
            product = getProductById(dto.getId());
            if (dto.getSku() != null && !dto.getSku().isEmpty()
                    && !product.getSku().equals(dto.getSku())
                    && productRepository.existsBySku(dto.getSku())) {
                throw new DuplicateResourceException("New SKU already exists!");
            }
            if (!product.getName().equals(dto.getName())) {
                product.setSlug(slug);
            }
        }

        product.setName(dto.getName());
        product.setSku(dto.getSku());
        product.setPrice(dto.getPrice());
        product.setQuantity(dto.getStockQuantity());
        product.setDescription(dto.getDescription());
        product.setStatus(dto.getStatus());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found!"));
            product.setCategory(category);
        }

        if (dto.getBrandId() != null) {
            Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found!"));
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailUrl = fileStorageService.storeFile(thumbnail, "products");
            product.setThumbnail(thumbnailUrl);
        }

        Product savedProduct = productRepository.save(product);

        // Save AR Asset
        if ((dto.getModelGlbUrl() != null && !dto.getModelGlbUrl().trim().isEmpty()) ||
            (dto.getModelUsdzUrl() != null && !dto.getModelUsdzUrl().trim().isEmpty())) {
            
            com.example.demo.dto.ar.ProductArAssetRequestDto arDto = new com.example.demo.dto.ar.ProductArAssetRequestDto();
            arDto.setModelGlbUrl(dto.getModelGlbUrl());
            arDto.setModelUsdzUrl(dto.getModelUsdzUrl());
            arDto.setArType(dto.getArType() != null && !dto.getArType().trim().isEmpty() ? dto.getArType() : "auto");
            arDto.setScaleFactor(dto.getScaleFactor() != null ? dto.getScaleFactor() : 1.0);
            
            arAssetService.upsertArAsset(savedProduct.getId(), arDto);
        }

        return savedProduct;
    }

    // ── Delete — ADMIN only ───────────────────────────────────────────────────

    @Transactional
    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
    @AuditAction(action = "DELETE_PRODUCT", entityType = "Product")
    @CacheEvict(value = "productDetails", key = "#id")
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product with id " + id + " not found!");
        }
        productRepository.deleteById(id);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private String generateUniqueSlug(String name, Long currentId) {
        String baseSlug = generateSlug(name);
        // Fallback khi tên tiếng Việt bị rỗng sau normalize
        if (baseSlug == null || baseSlug.isBlank()) {
            baseSlug = "product-" + System.currentTimeMillis();
        }
        String finalSlug = baseSlug;
        int counter = 1;
        while (productRepository.findBySlug(finalSlug)
                .filter(p -> currentId == null || !p.getId().equals(currentId)).isPresent()) {
            finalSlug = baseSlug + "-" + counter;
            counter++;
        }
        return finalSlug;
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        // Bước 1: thay khoảng trắng bằng gạch ngang
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        // Bước 2: NFD normalize để tách dấu khỏi ký tự
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        // Bước 3: xóa combining diacritical marks (giữ lại chữ cái sau khi tách dấu)
        String withoutDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        // Bước 4: xóa ký tự không phải chữ/số/gạch ngang
        String slug = withoutDiacritics.replaceAll("[^a-zA-Z0-9-]", "").toLowerCase(Locale.ENGLISH);
        // Bước 5: xóa gạch ngang đầu/cuối thừa
        slug = slug.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
        return slug;
    }
}
