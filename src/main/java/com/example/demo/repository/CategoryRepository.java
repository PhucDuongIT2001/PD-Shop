package com.example.demo.repository;

import com.example.demo.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByName(String name);

    Optional<Category> findByNameIgnoreCase(String name);
    
    Optional<Category> findBySlug(String slug);
    
    boolean existsByName(String name);
    
    List<Category> findAllByActiveTrue();
    
    @Query("SELECT c FROM Category c WHERE " +
           "(:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Category> searchCategories(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.deleted = false")
    long countProductsByCategoryId(@Param("categoryId") Long categoryId);
}
