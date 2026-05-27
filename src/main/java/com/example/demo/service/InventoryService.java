package com.example.demo.service;

import com.example.demo.entity.InventoryTransaction;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.entity.enums.TransactionType;
import com.example.demo.exception.InsufficientStockException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.InventoryTransactionRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public InventoryService(ProductRepository productRepository, 
                            InventoryTransactionRepository transactionRepository, 
                            UserRepository userRepository,
                            NotificationService notificationService) {
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void importStock(Long productId, int quantity, String note) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Import quantity must be positive.");
        }
        Product product = findProductById(productId);
        product.setQuantity(product.getQuantity() + quantity);
        createTransaction(product, TransactionType.IMPORT, quantity, note);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void exportStock(Long productId, int quantity, String note) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Export quantity must be positive.");
        }
        Product product = findProductById(productId);
        if (product.getQuantity() < quantity) {
            throw new InsufficientStockException("Not enough stock for product: " + product.getName() + ". Requested: " + quantity + ", Available: " + product.getQuantity());
        }
        product.setQuantity(product.getQuantity() - quantity);
        product.setSoldQuantity(product.getSoldQuantity() + quantity);
        
        // Low stock warning trigger
        if (product.getQuantity() <= product.getLowStockThreshold()) {
            try {
                notificationService.sendToAdmins(
                    "Cảnh báo hết hàng: " + product.getName(),
                    "Sản phẩm '" + product.getName() + "' (SKU: " + product.getSku() + ") hiện chỉ còn " + product.getQuantity() + " chiếc trong kho.",
                    com.example.demo.entity.enums.NotificationType.LOW_STOCK,
                    com.example.demo.entity.enums.NotificationPriority.HIGH,
                    "/admin/products"
                );
            } catch (Exception e) {
                System.err.println("Failed to push low stock notification: " + e.getMessage());
            }
        }
        
        createTransaction(product, TransactionType.EXPORT, quantity, note);
    }

    private void createTransaction(Product product, TransactionType type, int quantity, String note) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setProduct(product);
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setNote(note);
        transaction.setCreatedBy(getCurrentUser());
        transactionRepository.save(transaction);
    }

    private Product findProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElse(null);
    }
}
