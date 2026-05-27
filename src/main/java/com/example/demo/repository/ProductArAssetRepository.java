package com.example.demo.repository;

import com.example.demo.entity.ProductArAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductArAssetRepository extends JpaRepository<ProductArAsset, Long> {

    /** Find the first AR asset for a given product (most common use-case: one asset per product). */
    Optional<ProductArAsset> findFirstByProductId(Long productId);

    /** Find all AR assets for a given product (supports multiple assets per product). */
    List<ProductArAsset> findAllByProductId(Long productId);

    /** Check whether an AR asset already exists for a product. */
    boolean existsByProductId(Long productId);
}
