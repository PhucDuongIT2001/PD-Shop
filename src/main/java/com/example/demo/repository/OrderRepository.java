package com.example.demo.repository;

import com.example.demo.entity.Order;
import com.example.demo.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.user u WHERE u.id = :userId ORDER BY o.orderDate DESC")
    List<Order> findByUserIdWithUser(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.user u WHERE u.username = :username ORDER BY o.orderDate DESC")
    List<Order> findByUsernameWithUser(@Param("username") String username);

    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(o.user.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "   OR STR(o.id) LIKE CONCAT('%', :keyword, '%'))")
    Page<Order> searchOrders(@Param("status") OrderStatus status,
                             @Param("keyword") String keyword,
                             Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :#{T(com.example.demo.entity.enums.OrderStatus).PENDING}")
    long countPendingOrders();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :#{T(com.example.demo.entity.enums.OrderStatus).DELIVERED}")
    Optional<Double> sumTotalRevenue();

    List<Order> findTop5ByUserIdOrderByOrderDateDesc(Long userId);

    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.orderDetails od " +
           "LEFT JOIN FETCH od.product " +
           "WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Long id);

    Optional<Order> findByConfirmationToken(String confirmationToken);

    // -----------------------------------------------------------------------
    // Analytics queries
    // -----------------------------------------------------------------------

    /**
     * Tính tổng doanh thu từ các đơn hàng có trạng thái DELIVERED hoặc PAID
     * trong khoảng thời gian [from, to].
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o " +
           "WHERE o.status IN (com.example.demo.entity.enums.OrderStatus.DELIVERED, " +
           "                   com.example.demo.entity.enums.OrderStatus.PAID) " +
           "AND o.orderDate >= :from AND o.orderDate <= :to")
    Double sumRevenueByDateRange(@Param("from") LocalDateTime from,
                                 @Param("to") LocalDateTime to);

    /**
     * Đếm số đơn hàng đã thanh toán thành công trong khoảng thời gian [from, to].
     */
    @Query("SELECT COUNT(o) FROM Order o " +
           "WHERE o.status IN (com.example.demo.entity.enums.OrderStatus.DELIVERED, " +
           "                   com.example.demo.entity.enums.OrderStatus.PAID) " +
           "AND o.orderDate >= :from AND o.orderDate <= :to")
    Long countPaidOrdersByDateRange(@Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to);
}
