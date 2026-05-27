package com.example.demo.repository;

import com.example.demo.dto.admin.UserCustomerStatsDTO;
import com.example.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.profile LEFT JOIN FETCH u.roles WHERE u.id = :id")
    Optional<User> findByIdWithDetails(@Param("id") Long id);

    /**
     * Finds and projects customer data into a DTO, including aggregated stats.
     * This single query prevents the N+1 problem by performing calculations in the database.
     *
     * @param keyword  The search keyword for username or email.
     * @param pageable Pagination information.
     * @return A page of DTOs with customer statistics.
     */
    @Query(value = "SELECT new com.example.demo.dto.admin.UserCustomerStatsDTO(" +
                   "u.id, u.username, u.email, u.enabled, u.createdAt, " +
                   "COUNT(DISTINCT o.id), COALESCE(SUM(o.totalAmount), 0.0)) " +
                   "FROM User u LEFT JOIN u.orders o " +
                   "WHERE (:keyword IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                   "GROUP BY u.id, u.username, u.email, u.enabled, u.createdAt",
           countQuery = "SELECT COUNT(u) FROM User u WHERE " +
                        "(:keyword IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<UserCustomerStatsDTO> findCustomersWithStats(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    java.util.List<User> findByRoleName(@Param("roleName") String roleName);
}
