package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;
import java.util.List;

@Controller
class HomeController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/")
    public String index(Model model) {
        List<Product> products = productRepository.findAll();
        model.addAttribute("productList", products);
        return "clients/index";
    }

    @GetMapping("/product-detail")
    public String viewProductDetail() {
        return "clients/product-detail";
    }

    @GetMapping("/cart")
    public String viewCart() {
        return "clients/cart";
    }

    @GetMapping("/checkout")
    public String viewCheckout() {
        return "clients/checkout";
    }

    @GetMapping("/login")
    public String viewLogin() {
        return "auth/login";
    }

    @GetMapping("/register")
    public String viewRegister() {
        return "auth/register";
    }


    @GetMapping("/forgot-password")
    public String viewForgotPassword() {
        return "auth/forgot-password";
    }
}