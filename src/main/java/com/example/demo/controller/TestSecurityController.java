package com.example.demo.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
@RestController
public class TestSecurityController {
    @GetMapping("/test-sec")
    public String test() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return "No auth";
        return auth.getName() + " - " + auth.getAuthorities();
    }
}
