package com.example.demo.service;

import com.example.demo.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);
    Category getCategoryById(Long id);
    Category getCategoryBySlug(String slug);
    Page<Category> getAllCategories(String keyword, Pageable pageable);
    List<Category> getActiveCategories();
    long countProducts(Long categoryId);
}
