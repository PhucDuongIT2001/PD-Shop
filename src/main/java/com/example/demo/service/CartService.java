package com.example.demo.service;

import com.example.demo.dto.CartDto;
import com.example.demo.dto.CartItemDto;
import com.example.demo.dto.CartRequest;
import com.example.demo.entity.Cart;
import com.example.demo.entity.CartItem;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.exception.InsufficientStockException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /** Lấy giỏ hàng của user (tạo mới nếu chưa có). */
    @Transactional
    public CartDto getCart(String username) {
        User user = findUser(username);
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(new Cart(user)));
        return toDto(cart);
    }

    /** Thêm sản phẩm vào giỏ. Nếu đã có thì cộng dồn số lượng. */
    @Transactional
    public CartDto addItem(String username, CartRequest request) {
        User user = findUser(username);
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(new Cart(user)));

        Product product = findProduct(request.getProductId());
        validateStock(product, request.getQuantity());

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(request.getProductId()))
                .findFirst();

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + request.getQuantity();
            validateStock(product, newQty);
            item.setQuantity(newQty);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cart.getItems().add(newItem);
        }

        return toDto(cartRepository.save(cart));
    }

    /** Cập nhật số lượng của một item trong giỏ. */
    @Transactional
    public CartDto updateQuantity(String username, Long itemId, Integer quantity) {
        if (quantity < 1) {
            throw new IllegalArgumentException("Số lượng phải ít nhất là 1");
        }
        CartItem item = findCartItem(itemId);
        assertOwner(item, username);
        validateStock(item.getProduct(), quantity);

        item.setQuantity(quantity);
        return toDto(cartRepository.save(item.getCart()));
    }

    /** Xoá một item khỏi giỏ hàng. */
    @Transactional
    public CartDto removeItem(String username, Long itemId) {
        CartItem item = findCartItem(itemId);
        assertOwner(item, username);

        Cart cart = item.getCart();
        cart.getItems().remove(item);
        return toDto(cartRepository.save(cart));
    }

    /** Chuyển đổi trạng thái "lưu để sau" của một item. */
    @Transactional
    public CartDto toggleSaveForLater(String username, Long itemId) {
        CartItem item = findCartItem(itemId);
        assertOwner(item, username);

        item.setSaveForLater(!item.isSaveForLater());
        return toDto(cartRepository.save(item.getCart()));
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
    }

    private CartItem findCartItem(Long itemId) {
        return cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));
    }

    private void assertOwner(CartItem item, String username) {
        if (!item.getCart().getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền thao tác với item này");
        }
    }

    private void validateStock(Product product, int requestedQty) {
        if (product.getQuantity() < requestedQty) {
            throw new InsufficientStockException(
                    "Sản phẩm \"" + product.getName() + "\" chỉ còn " +
                    product.getQuantity() + " trong kho, bạn yêu cầu " + requestedQty);
        }
    }

    private CartDto toDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setItems(cart.getItems().stream()
                .map(this::toItemDto)
                .collect(Collectors.toList()));

        double subtotal = cart.getItems().stream()
                .filter(i -> !i.isSaveForLater())
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        dto.setSubtotal(subtotal);
        dto.setTotal(subtotal);
        return dto;
    }

    private CartItemDto toItemDto(CartItem item) {
        CartItemDto dto = new CartItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductThumbnail(item.getProduct().getThumbnail());
        dto.setPrice(item.getProduct().getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setStockQuantity(item.getProduct().getQuantity());
        dto.setSaveForLater(item.isSaveForLater());
        dto.setItemTotal(item.getProduct().getPrice() * item.getQuantity());
        return dto;
    }
}
