package com.example.demo.service.impl;

import com.example.demo.dto.ar.RoomLayoutDto;
import com.example.demo.dto.ar.RoomLayoutItemDto;
import com.example.demo.dto.ar.RoomLayoutRequestDto;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductArAsset;
import com.example.demo.entity.RoomLayout;
import com.example.demo.entity.RoomLayoutItem;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.RoomLayoutRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ProductArAssetRepository;
import com.example.demo.security.details.CustomUserDetails;
import com.example.demo.service.RoomLayoutService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomLayoutServiceImpl implements RoomLayoutService {

    private final RoomLayoutRepository roomLayoutRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductArAssetRepository arAssetRepository;

    public RoomLayoutServiceImpl(RoomLayoutRepository roomLayoutRepository,
                                 UserRepository userRepository,
                                 ProductRepository productRepository,
                                 ProductArAssetRepository arAssetRepository) {
        this.roomLayoutRepository = roomLayoutRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.arAssetRepository = arAssetRepository;
    }

    @Override
    public RoomLayoutDto saveRoomLayout(RoomLayoutRequestDto request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại."));

        RoomLayout layout = new RoomLayout();
        layout.setName(request.getName() == null || request.getName().trim().isEmpty() 
                ? "Thiết kế phòng khách" 
                : request.getName().trim());
        layout.setUser(user);

        List<RoomLayoutItem> items = new ArrayList<>();
        if (request.getItems() != null) {
            for (RoomLayoutRequestDto.ItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy sản phẩm với id: " + itemReq.getProductId()));

                RoomLayoutItem item = new RoomLayoutItem();
                item.setRoomLayout(layout);
                item.setProduct(product);
                item.setPosX(itemReq.getPosX() != null ? itemReq.getPosX() : 0.0);
                item.setPosY(itemReq.getPosY() != null ? itemReq.getPosY() : 0.0);
                item.setPosZ(itemReq.getPosZ() != null ? itemReq.getPosZ() : 0.0);
                item.setRotY(itemReq.getRotY() != null ? itemReq.getRotY() : 0.0);
                items.add(item);
            }
        }
        layout.setItems(items);

        RoomLayout saved = roomLayoutRepository.save(layout);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomLayoutDto> getUserRoomLayouts(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<RoomLayout> layouts = roomLayoutRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return layouts.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomLayoutDto getRoomLayoutById(Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        RoomLayout layout = roomLayoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thiết kế phòng với ID: " + id));

        // Security check: Only allow layout owner or ADMIN/MANAGER to view
        boolean isAdminOrManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));

        if (!layout.getUser().getId().equals(userId) && !isAdminOrManager) {
            throw new AccessDeniedException("Bạn không có quyền truy cập bản thiết kế này.");
        }

        return toDto(layout);
    }

    @Override
    public void deleteRoomLayout(Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        RoomLayout layout = roomLayoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thiết kế phòng với ID: " + id));

        // Security check: Only allow layout owner or ADMIN to delete
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!layout.getUser().getId().equals(userId) && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền xóa bản thiết kế này.");
        }

        roomLayoutRepository.delete(layout);
    }

    // --- Helper mapping ---

    private RoomLayoutDto toDto(RoomLayout layout) {
        List<RoomLayoutItemDto> itemDtos = new ArrayList<>();
        if (layout.getItems() != null) {
            itemDtos = layout.getItems().stream().map(item -> {
                Product product = item.getProduct();
                
                // Get AR asset URL links if present
                ProductArAsset arAsset = arAssetRepository.findFirstByProductId(product.getId()).orElse(null);
                String glbUrl = arAsset != null ? arAsset.getModelGlbUrl() : null;
                String usdzUrl = arAsset != null ? arAsset.getModelUsdzUrl() : null;
                
                return new RoomLayoutItemDto(
                        item.getId(),
                        product.getId(),
                        product.getName(),
                        product.getThumbnail(),
                        product.getPrice(),
                        glbUrl,
                        usdzUrl,
                        item.getPosX(),
                        item.getPosY(),
                        item.getPosZ(),
                        item.getRotY()
                );
            }).collect(Collectors.toList());
        }

        return new RoomLayoutDto(
                layout.getId(),
                layout.getName(),
                layout.getUser().getId(),
                layout.getUser().getUsername(),
                itemDtos,
                layout.getCreatedAt(),
                layout.getUpdatedAt()
        );
    }
}
