package com.example.demo.controller;

import com.example.demo.entity.Cart;
import com.example.demo.entity.CartItem;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link OrderController}.
 *
 * Tests the POST /api/orders/checkout endpoint which creates an order
 * from the authenticated user's cart.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        cartRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();

        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("password");
        testUser.setEmail("testuser@example.com");
        userRepository.save(testUser);

        testProduct = new Product();
        testProduct.setName("Test Product");
        testProduct.setSlug("test-product");
        testProduct.setPrice(100.0);
        testProduct.setQuantity(5);
        productRepository.save(testProduct);
    }

    /**
     * When the cart has items and stock is sufficient, checkout should succeed
     * with HTTP 201, return an order with PENDING status, and deduct stock.
     */
    @Test
    void checkout_whenCartHasItemsAndStockSufficient_shouldReturn201() throws Exception {
        // Arrange: add item to cart
        Cart cart = new Cart(testUser);
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(testProduct);
        item.setQuantity(2);
        cart.getItems().add(item);
        cartRepository.save(cart);

        Map<String, Object> checkoutRequest = new HashMap<>();
        checkoutRequest.put("shippingName", "Nguyen Van A");
        checkoutRequest.put("shippingPhone", "0901234567");
        checkoutRequest.put("shippingAddress", "123 Nguyen Hue, Q1, TP.HCM");

        // Act & Assert
        mockMvc.perform(post("/api/orders/checkout")
                        .with(user("testuser"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("UNCONFIRMED"))
                .andExpect(jsonPath("$.totalAmount").value(200.0));

        // Verify stock was NOT deducted yet (still 5) since it is UNCONFIRMED
        Product productAfter = productRepository.findById(testProduct.getId()).get();
        assertThat(productAfter.getQuantity()).isEqualTo(5);
    }

    /**
     * When the cart is empty, checkout should return HTTP 400.
     */
    @Test
    void checkout_whenCartIsEmpty_shouldReturnBadRequest() throws Exception {
        // Arrange: empty cart
        Cart cart = new Cart(testUser);
        cartRepository.save(cart);

        Map<String, Object> checkoutRequest = new HashMap<>();
        checkoutRequest.put("shippingName", "Nguyen Van A");
        checkoutRequest.put("shippingPhone", "0901234567");
        checkoutRequest.put("shippingAddress", "123 Nguyen Hue, Q1, TP.HCM");

        // Act & Assert
        mockMvc.perform(post("/api/orders/checkout")
                        .with(user("testuser"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutRequest)))
                .andExpect(status().isBadRequest());

        // Verify stock was NOT deducted
        Product productAfter = productRepository.findById(testProduct.getId()).get();
        assertThat(productAfter.getQuantity()).isEqualTo(5);
    }

    /**
     * When the cart requests more than available stock, checkout should return HTTP 400.
     */
    @Test
    void checkout_whenStockIsInsufficient_shouldReturnBadRequest() throws Exception {
        // Arrange: cart item requests 10 but only 5 in stock
        Cart cart = new Cart(testUser);
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(testProduct);
        item.setQuantity(10);
        cart.getItems().add(item);
        cartRepository.save(cart);

        Map<String, Object> checkoutRequest = new HashMap<>();
        checkoutRequest.put("shippingName", "Nguyen Van A");
        checkoutRequest.put("shippingPhone", "0901234567");
        checkoutRequest.put("shippingAddress", "123 Nguyen Hue, Q1, TP.HCM");

        // Act & Assert
        mockMvc.perform(post("/api/orders/checkout")
                        .with(user("testuser"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutRequest)))
                .andExpect(status().isBadRequest());

        // Verify stock was NOT deducted
        Product productAfter = productRepository.findById(testProduct.getId()).get();
        assertThat(productAfter.getQuantity()).isEqualTo(5);
    }

    /**
     * When shipping info is missing, checkout should return HTTP 400 (validation).
     */
    @Test
    void checkout_whenShippingInfoMissing_shouldReturnBadRequest() throws Exception {
        // Arrange: cart with item but no shipping info in request
        Cart cart = new Cart(testUser);
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(testProduct);
        item.setQuantity(1);
        cart.getItems().add(item);
        cartRepository.save(cart);

        Map<String, Object> checkoutRequest = new HashMap<>();
        // Missing shippingName, shippingPhone, shippingAddress

        // Act & Assert
        mockMvc.perform(post("/api/orders/checkout")
                        .with(user("testuser"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkoutRequest)))
                .andExpect(status().isBadRequest());
    }
}
