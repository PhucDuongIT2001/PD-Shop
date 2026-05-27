package com.example.demo.repository;

import com.example.demo.entity.PaymentTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);

    Optional<PaymentTransaction> findByVnpTxnRef(String vnpTxnRef);

    @Query("SELECT t FROM PaymentTransaction t WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    Page<PaymentTransaction> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM PaymentTransaction t ORDER BY t.createdAt DESC")
    Page<PaymentTransaction> findAllTransactions(Pageable pageable);
}
