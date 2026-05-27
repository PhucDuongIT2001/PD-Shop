package com.example.demo.service;

import com.example.demo.dto.CheckoutRequest;
import com.example.demo.dto.OrderDetailDto;
import com.example.demo.dto.OrderResponse;
import com.example.demo.entity.Cart;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderDetail;
import com.example.demo.entity.enums.OrderStatus;
import com.example.demo.entity.enums.PaymentMethod;
import com.example.demo.exception.OrderStateException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final InventoryService inventoryService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final VNPAYService vnpayService;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        CartRepository cartRepository,
                        InventoryService inventoryService,
                        EmailService emailService,
                        NotificationService notificationService,
                        VNPAYService vnpayService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.inventoryService = inventoryService;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.vnpayService = vnpayService;
    }

    // -----------------------------------------------------------------------
    // Checkout: tạo đơn hàng từ giỏ hàng hiện tại của user
    // -----------------------------------------------------------------------
    @Transactional
    public OrderResponse checkout(String username, CheckoutRequest request, HttpServletRequest httpRequest) {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + username));

        // Chỉ lấy các item chưa được "save for later"
        var activeItems = cart.getItems().stream()
                .filter(item -> !item.isSaveForLater())
                .collect(Collectors.toList());

        if (activeItems.isEmpty()) {
            throw new IllegalStateException("Giỏ hàng trống, không thể đặt hàng.");
        }

        PaymentMethod pm = PaymentMethod.COD;
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            pm = PaymentMethod.VNPAY;
        }

        Order order = new Order();
        order.setUser(user);
        // COD → PENDING ngay. VNPAY → UNCONFIRMED chờ thanh toán
        order.setStatus(pm == PaymentMethod.COD ? OrderStatus.PENDING : OrderStatus.UNCONFIRMED);
        order.setShippingName(request.getShippingName());
        order.setShippingPhone(request.getShippingPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setNote(request.getNote());
        order.setPaymentMethod(pm);

        double totalAmount = 0.0;

        for (var cartItem : activeItems) {
            Long productId = cartItem.getProduct().getId();
            int qty = cartItem.getQuantity();

            // Trừ tồn kho ngay cho COD; VNPAY hoãn trừ kho đến khi thanh toán thành công qua IPN
            if (pm == PaymentMethod.COD) {
                inventoryService.exportStock(
                        productId,
                        qty,
                        "Xuất kho cho đơn hàng COD #pending của user: " + username
                );
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(cartItem.getProduct());
            detail.setQuantity(qty);
            detail.setPrice(cartItem.getProduct().getPrice()); // snapshot giá tại thời điểm đặt
            order.getOrderDetails().add(detail);

            totalAmount += cartItem.getProduct().getPrice() * qty;
        }

        order.setTotalAmount(totalAmount);
        Order saved = orderRepository.save(order);

        // Xoá các item đã checkout khỏi giỏ hàng
        cart.getItems().removeAll(activeItems);
        cartRepository.save(cart);

        OrderResponse response = toResponse(saved);

        if (pm == PaymentMethod.VNPAY) {
            // Tạo URL VNPay và trả thẳng về client để redirect ngay
            String paymentUrl = vnpayService.createPaymentUrl(saved.getId(), httpRequest);
            response.setPaymentUrl(paymentUrl);
        } else {
            // COD: Thông báo Admin có đơn mới
            try {
                notificationService.sendToAdmins(
                    "Đơn hàng mới #" + saved.getId(),
                    "Khách hàng " + username + " vừa đặt đơn COD trị giá " +
                    new java.text.DecimalFormat("#,###").format(saved.getTotalAmount()) + "đ",
                    com.example.demo.entity.enums.NotificationType.ORDER_CREATED,
                    com.example.demo.entity.enums.NotificationPriority.HIGH,
                    "/admin/orders"
                );
            } catch (Exception e) {
                System.err.println("Failed to push order notification: " + e.getMessage());
            }
        }

        return response;
    }

    // -----------------------------------------------------------------------
    // Xác nhận đơn hàng từ Email
    // -----------------------------------------------------------------------
    @Transactional
    public OrderResponse confirmOrder(String token) {
        Order order = orderRepository.findByConfirmationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Link xác nhận không hợp lệ hoặc đã hết hạn."));
        
        if (order.getStatus() != OrderStatus.UNCONFIRMED) {
            throw new IllegalStateException("Đơn hàng này đã được xác nhận trước đó.");
        }
        
        order.setStatus(OrderStatus.PENDING);
        order.setConfirmationToken(null); // Xoá token để tránh dùng lại
        Order savedOrder = orderRepository.save(order);

        // Notify Admins about new order
        try {
            notificationService.sendToAdmins(
                "Đơn hàng mới #" + savedOrder.getId(),
                "Khách hàng " + (savedOrder.getUser() != null ? savedOrder.getUser().getUsername() : "Khách") + " vừa xác nhận đặt đơn hàng trị giá " + 
                new java.text.DecimalFormat("#,###").format(savedOrder.getTotalAmount()) + "đ",
                com.example.demo.entity.enums.NotificationType.ORDER_CREATED,
                com.example.demo.entity.enums.NotificationPriority.HIGH,
                "/admin/orders"
            );
        } catch (Exception e) {
            // Log warning but don't fail transactional checkout confirmation
            System.err.println("Failed to push registration or order notification: " + e.getMessage());
        }

        return toResponse(savedOrder);
    }

    // -----------------------------------------------------------------------
    // Cập nhật trạng thái đơn hàng (Admin)
    // -----------------------------------------------------------------------
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String newStatusStr) {
        OrderStatus newStatus = parseStatus(newStatusStr);

        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        validateTransition(order.getStatus(), newStatus);

        if (newStatus == OrderStatus.CANCELLED) {
            // Hoàn trả tồn kho khi huỷ đơn
            order.getOrderDetails().forEach(detail ->
                    inventoryService.importStock(
                            detail.getProduct().getId(),
                            detail.getQuantity(),
                            "Hoàn kho từ đơn hàng bị huỷ #" + order.getId()
                    )
            );
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        // Notify Customer about status change
        try {
            notificationService.sendToUser(
                saved.getUser().getId(),
                "Cập nhật đơn hàng #" + saved.getId(),
                "Đơn hàng của bạn đã chuyển sang trạng thái: " + getStatusText(newStatus),
                getNotificationTypeForStatus(newStatus),
                com.example.demo.entity.enums.NotificationPriority.MEDIUM,
                "/orders/" + saved.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to push customer order update notification: " + e.getMessage());
        }

        return toResponse(saved);
    }

    // -----------------------------------------------------------------------
    // Cập nhật thanh toán VNPay (Dành cho Web MVC khi IPN không gọi được)
    // -----------------------------------------------------------------------
    @Transactional
    public void markOrderAsPaid(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.PAID);
            Order saved = orderRepository.save(order);
            
            // Notify Customer
            try {
                notificationService.sendToUser(
                    saved.getUser().getId(),
                    "Thanh toán thành công đơn hàng #" + saved.getId(),
                    "Đơn hàng của bạn đã được thanh toán trực tuyến thành công qua VNPay.",
                    com.example.demo.entity.enums.NotificationType.ORDER_CONFIRMED,
                    com.example.demo.entity.enums.NotificationPriority.HIGH,
                    "/orders/" + saved.getId()
                );
            } catch (Exception e) {
                System.err.println("Failed to push payment confirmation notification: " + e.getMessage());
            }
        }
    }

    private String getStatusText(OrderStatus status) {
        switch (status) {
            case PENDING: return "Chờ xử lý";
            case PAID: return "Đã thanh toán";
            case SHIPPING: return "Đang giao hàng";
            case DELIVERED: return "Đã giao hàng thành công";
            case CANCELLED: return "Đã huỷ";
            default: return status.name();
        }
    }

    private com.example.demo.entity.enums.NotificationType getNotificationTypeForStatus(OrderStatus status) {
        switch (status) {
            case PENDING: return com.example.demo.entity.enums.NotificationType.ORDER_CREATED;
            case SHIPPING: return com.example.demo.entity.enums.NotificationType.ORDER_SHIPPED;
            case DELIVERED: return com.example.demo.entity.enums.NotificationType.ORDER_DELIVERED;
            case CANCELLED: return com.example.demo.entity.enums.NotificationType.ORDER_CANCELLED;
            default: return com.example.demo.entity.enums.NotificationType.ORDER_CONFIRMED;
        }
    }

    // -----------------------------------------------------------------------
    // Queries
    // -----------------------------------------------------------------------
    public List<OrderResponse> getMyOrders(String username) {
        return orderRepository.findByUsernameWithUser(username)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdWithUser(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<Order> getAllOrders(String statusStr, String keyword, Pageable pageable) {
        OrderStatus status = (statusStr != null && !statusStr.isBlank())
                ? parseStatus(statusStr) : null;
        return orderRepository.searchOrders(status, keyword, pageable);
    }

    public OrderResponse getOrderById(Long id) {
        return toResponse(orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id)));
    }

    /** Dùng nội bộ cho AdminOrderController (Thymeleaf). */
    public Order getOrderEntityById(Long id) {
        return orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    public OrderResponse trackOrder(Long id, String phone) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + id));
        
        // Kiểm tra số điện thoại (chỉ check đuôi hoặc exact match)
        if (order.getShippingPhone() == null || !order.getShippingPhone().equals(phone)) {
            throw new ResourceNotFoundException("Số điện thoại không khớp với đơn hàng này.");
        }
        
        return toResponse(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found: " + id);
        }
        orderRepository.deleteById(id);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Máy trạng thái hợp lệ:
     *   PENDING  → SHIPPING | CANCELLED
     *   SHIPPING → DELIVERED | CANCELLED
     *   DELIVERED / CANCELLED → không thể thay đổi
     */
    private void validateTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING  -> next == OrderStatus.SHIPPING  || next == OrderStatus.CANCELLED;
            case SHIPPING -> next == OrderStatus.DELIVERED || next == OrderStatus.CANCELLED;
            default       -> false; // DELIVERED, CANCELLED là trạng thái cuối
        };
        if (!valid) {
            throw new OrderStateException(
                    "Không thể chuyển trạng thái từ " + current + " sang " + next);
        }
    }

    private OrderStatus parseStatus(String value) {
        try {
            return OrderStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new OrderStateException("Trạng thái không hợp lệ: " + value);
        }
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse res = new OrderResponse();
        res.setId(order.getId());
        res.setUsername(order.getUser().getUsername());
        res.setStatus(order.getStatus());
        res.setTotalAmount(order.getTotalAmount());
        res.setOrderDate(order.getOrderDate());
        res.setShippingName(order.getShippingName());
        res.setShippingPhone(order.getShippingPhone());
        res.setShippingAddress(order.getShippingAddress());
        res.setNote(order.getNote());
        if (order.getPaymentMethod() != null) {
            res.setPaymentMethod(order.getPaymentMethod().name());
        }

        List<OrderDetailDto> items = order.getOrderDetails().stream().map(d -> {
            OrderDetailDto dto = new OrderDetailDto();
            dto.setId(d.getId());
            dto.setProductId(d.getProduct().getId());
            dto.setProductName(d.getProduct().getName());
            dto.setProductThumbnail(d.getProduct().getThumbnail());
            dto.setQuantity(d.getQuantity());
            dto.setPrice(d.getPrice());
            dto.setLineTotal(d.getPrice() * d.getQuantity());
            return dto;
        }).collect(Collectors.toList());

        res.setItems(items);
        return res;
    }
}
