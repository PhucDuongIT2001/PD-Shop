package com.example.demo.service;

import com.example.demo.dto.admin.CustomerDetailDTO;
import com.example.demo.dto.admin.UserCustomerStatsDTO;
import com.example.demo.entity.Order;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminCustomerService(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Gets a paginated list of customers with their statistics.
     * This method directly calls the optimized repository method to prevent N+1 queries.
     *
     * @param keyword  The search keyword for username or email.
     * @param pageable Pagination information.
     * @return A page of DTOs with customer statistics.
     */
    public Page<UserCustomerStatsDTO> getCustomers(String keyword, Pageable pageable) {
        // The repository now does all the heavy lifting (projection, aggregation, pagination).
        // The service layer's responsibility is simply to call it.
        return userRepository.findCustomersWithStats(keyword, pageable);
    }

    /**
     * Gets detailed information for a single customer.
     *
     * @param id The ID of the customer.
     * @return A DTO with detailed customer information.
     */
    public CustomerDetailDTO getCustomerDetails(Long id) {
        User user = userRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        List<Order> recentOrders = orderRepository.findTop5ByUserIdOrderByOrderDateDesc(id);

        // Logic to create DTO is now cleanly inside the service
        CustomerDetailDTO dto = new CustomerDetailDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRoles(user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()));

        if (user.getProfile() != null) {
            dto.setFullName(user.getProfile().getFullName());
            dto.setPhone(user.getProfile().getPhone());
            dto.setAddress(user.getProfile().getAddress());
            dto.setAvatarUrl(user.getProfile().getAvatarUrl());
        }

        // These stats are calculated from the full user object, which is acceptable for a single detail view
        dto.setOrderCount(user.getOrders().size());
        dto.setTotalSpent(user.getOrders().stream().mapToDouble(Order::getTotalAmount).sum());
        dto.setRecentOrders(recentOrders);

        return dto;
    }

    /**
     * Updates the enabled/disabled status of a user account.
     *
     * @param id      The ID of the user to update.
     * @param enabled The new status.
     */
    @Transactional
    public void updateUserStatus(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        user.setEnabled(enabled);
        // The transaction will automatically commit the change, no need to call save() explicitly
    }
}
