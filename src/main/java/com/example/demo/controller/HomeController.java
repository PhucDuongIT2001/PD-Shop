package com.example.demo.controller;

import com.example.demo.model.Category;
import com.example.demo.model.Brand;
import com.example.demo.model.Product;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;
import java.util.Arrays;
import java.util.List;

@Controller
class HomeController {

    // CHỈ GIỮ LẠI MỘT HÀM INDEX DUY NHẤT Ở ĐÂY
    @GetMapping("/")
    public String index(Model model) {
        List<Brand> brands = Arrays.asList(
                new Brand(1L, "ASUS"),
                new Brand(2L, "APPLE"),
                new Brand(3L, "DELL")
        );

        List<Category> categories = Arrays.asList(
                new Category(1L, "Laptop"),
                new Category(2L, "IPAD")
        );

        List<Product> products = Arrays.asList(
                new Product(1L, "Laptop ROG Strix G15", 25000000.0, "/images/rog.jpg", categories.get(0), brands.get(0)),
                new Product(2L, "Macbook M1 air", 15000000.0, "/images/macm1.jpg", categories.get(0), brands.get(1))
        );

        model.addAttribute("productList", products);
        return "clients/index";
    }

    // Các trang con khác
    @GetMapping("/product-detail") public String viewProductDetail() { return "clients/product-detail"; }
    @GetMapping("/cart") public String viewCart() { return "clients/cart"; }
    @GetMapping("/checkout") public String viewCheckout() { return "clients/checkout"; }
    @GetMapping("/login") public String viewLogin() { return "auth/login"; }
    @GetMapping("/register") public String viewRegister() { return "auth/register"; }
    @GetMapping("/profile") public String viewProfile() { return "clients/profile"; }
    @GetMapping("/forgot-password") public String viewForgotPassword() { return "auth/forgot-password"; }
}