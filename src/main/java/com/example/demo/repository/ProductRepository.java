package com.example.demo.repository;

import com.example.demo.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySku(String sku);
    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false " +
           "AND p.status = com.example.demo.entity.enums.ProductStatus.ACTIVE " +
           "AND (:keyword IS NULL OR (" +
           "  LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(p.brand.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "  LOWER(p.shortDescription) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
           "AND (:isNew IS NULL OR :isNew = false OR p.createdAt >= :thirtyDaysAgo) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> searchProducts(@org.springframework.data.repository.query.Param("keyword") String keyword, 
                                 @org.springframework.data.repository.query.Param("categoryId") Long categoryId, 
                                 @org.springframework.data.repository.query.Param("brandId") Long brandId, 
                                 @org.springframework.data.repository.query.Param("isNew") Boolean isNew,
                                 @org.springframework.data.repository.query.Param("thirtyDaysAgo") java.time.LocalDateTime thirtyDaysAgo,
                                 @org.springframework.data.repository.query.Param("minPrice") Double minPrice,
                                 @org.springframework.data.repository.query.Param("maxPrice") Double maxPrice,
                                 Pageable pageable);

    List<Product> findByCategoryId(Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.deleted = false " +
           "AND p.status = com.example.demo.entity.enums.ProductStatus.ACTIVE")
    List<Product> findActiveProductsForChat(Pageable pageable);

    // -----------------------------------------------------------------------
    // Analytics queries
    // -----------------------------------------------------------------------

    /**
     * Top 5 sản phẩm bán chạy nhất dựa trên trường sold_quantity trong bảng products.
     * Trả về Object[] với thứ tự: [id, name, sku, thumbnail, soldQuantity, price]
     */
    @Query("SELECT p.id, p.name, p.sku, p.thumbnail, p.soldQuantity, p.price " +
           "FROM Product p " +
           "WHERE p.deleted = false " +
           "ORDER BY p.soldQuantity DESC")
    List<Object[]> findTop5BySoldQuantity(Pageable pageable);

    /**
     * Danh sách sản phẩm sắp hết hàng: quantity <= low_stock_threshold.
     * Trả về Object[] với thứ tự: [id, name, sku, thumbnail, quantity, lowStockThreshold]
     */
    @Query("SELECT p.id, p.name, p.sku, p.thumbnail, p.quantity, p.lowStockThreshold " +
           "FROM Product p " +
           "WHERE p.deleted = false " +
           "AND p.quantity <= p.lowStockThreshold " +
           "ORDER BY p.quantity ASC")
    List<Object[]> findLowStockProducts();
}
