package com.example.demo.service.impl;

import com.example.demo.entity.Brand;
import com.example.demo.repository.BrandRepository;
import com.example.demo.service.BrandService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    public BrandServiceImpl(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @Override
    @CacheEvict(value = "brands", allEntries = true)
    public Brand createBrand(Brand brand) {
        if (brandRepository.existsByName(brand.getName())) {
            throw new RuntimeException("Tên thương hiệu đã tồn tại");
        }
        brand.setSlug(generateSlug(brand.getName()));
        return brandRepository.save(brand);
    }

    @Override
    @CacheEvict(value = "brands", allEntries = true)
    public Brand updateBrand(Long id, Brand brand) {
        Brand existing = getBrandById(id);
        
        if (!existing.getName().equals(brand.getName()) && 
            brandRepository.existsByName(brand.getName())) {
            throw new RuntimeException("Tên thương hiệu mới đã tồn tại");
        }
        
        existing.setName(brand.getName());
        existing.setSlug(generateSlug(brand.getName()));
        existing.setDescription(brand.getDescription());
        existing.setImage(brand.getImage());
        existing.setActive(brand.isActive());
        
        return brandRepository.save(existing);
    }

    @Override
    @CacheEvict(value = "brands", allEntries = true)
    public void deleteBrand(Long id) {
        Brand brand = getBrandById(id);
        long productCount = brandRepository.countProductsByBrandId(id);
        if (productCount > 0) {
            throw new RuntimeException("Không thể xóa thương hiệu này vì vẫn còn " + productCount + " sản phẩm đang liên kết");
        }
        brandRepository.delete(brand);
    }

    @Override
    public Brand getBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với ID: " + id));
    }

    @Override
    public Brand getBrandBySlug(String slug) {
        return brandRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với Slug: " + slug));
    }

    @Override
    public Page<Brand> getAllBrands(String keyword, Pageable pageable) {
        return brandRepository.searchBrands(keyword, pageable);
    }

    @Override
    @Cacheable("brands")
    public List<Brand> getActiveBrands() {
        return brandRepository.findByActiveTrueOrderByNameAsc();
    }

    @Override
    public long countProducts(Long brandId) {
        return brandRepository.countProductsByBrandId(brandId);
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
