package com.example.demo.service.impl;

import com.example.demo.entity.Category;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.service.CategoryService;
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
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
        category.setSlug(generateSlug(category.getName()));
        return categoryRepository.save(category);
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(Long id, Category category) {
        Category existing = getCategoryById(id);
        
        // Check if name changed and new name already exists
        if (!existing.getName().equals(category.getName()) && 
            categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Tên danh mục mới đã tồn tại");
        }
        
        existing.setName(category.getName());
        existing.setSlug(generateSlug(category.getName()));
        existing.setDescription(category.getDescription());
        existing.setImage(category.getImage());
        existing.setActive(category.isActive());
        
        return categoryRepository.save(existing);
    }

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        long productCount = categoryRepository.countProductsByCategoryId(id);
        if (productCount > 0) {
            throw new RuntimeException("Không thể xóa danh mục này vì vẫn còn " + productCount + " sản phẩm đang liên kết");
        }
        categoryRepository.delete(category);
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
    }

    @Override
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với Slug: " + slug));
    }

    @Override
    public Page<Category> getAllCategories(String keyword, Pageable pageable) {
        return categoryRepository.searchCategories(keyword, pageable);
    }

    @Override
    @Cacheable("categories")
    public List<Category> getActiveCategories() {
        return categoryRepository.findAllByActiveTrue();
    }

    @Override
    public long countProducts(Long categoryId) {
        return categoryRepository.countProductsByCategoryId(categoryId);
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
