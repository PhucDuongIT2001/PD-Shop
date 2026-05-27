package com.example.demo.service;

import com.example.demo.entity.PaymentTransaction;
import com.example.demo.repository.PaymentTransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PaymentTransactionService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    public PaymentTransactionService(PaymentTransactionRepository paymentTransactionRepository) {
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    public Page<PaymentTransaction> getMyTransactions(Long userId, Pageable pageable) {
        return paymentTransactionRepository.findByUserId(userId, pageable);
    }

    public Page<PaymentTransaction> getAllTransactions(Pageable pageable) {
        return paymentTransactionRepository.findAllTransactions(pageable);
    }
}
