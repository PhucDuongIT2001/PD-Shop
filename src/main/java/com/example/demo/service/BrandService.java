package com.example.demo.service;

import com.example.demo.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BrandService {
    Brand createBrand(Brand brand, MultipartFile image);
    Brand updateBrand(Long id, Brand brand, MultipartFile image);
    void deleteBrand(Long id);
    Brand getBrandById(Long id);
    Brand getBrandBySlug(String slug);
    Page<Brand> getAllBrands(String keyword, Pageable pageable);
    List<Brand> getActiveBrands();
    long countProducts(Long brandId);
}
