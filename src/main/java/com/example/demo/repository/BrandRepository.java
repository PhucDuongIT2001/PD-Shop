package com.example.demo.repository;

import com.example.demo.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findBySlug(String slug);

    Optional<Brand> findByNameIgnoreCase(String name);
    List<Brand> findByActiveTrueOrderByNameAsc();
    boolean existsByName(String name);
    
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Brand b WHERE " +
           "(:keyword IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    org.springframework.data.domain.Page<Brand> searchBrands(@org.springframework.data.repository.query.Param("keyword") String keyword, org.springframework.data.domain.Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Product p WHERE p.brand.id = :brandId AND p.deleted = false")
    long countProductsByBrandId(@org.springframework.data.repository.query.Param("brandId") Long brandId);
}
