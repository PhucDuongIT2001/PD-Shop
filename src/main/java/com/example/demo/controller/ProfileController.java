package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import com.example.demo.entity.Profile;
import com.example.demo.entity.User;
import com.example.demo.service.ProfileService;
import com.example.demo.service.UserService;

import java.security.Principal;

@Controller
@RequestMapping("/profile")
public class ProfileController {
    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserService userService;

    @GetMapping
    public String showProfilePage(Model model, Principal principal) {
        if (principal == null) {
            return "redirect:/login"; // Redirect to login if unauthenticated
        }
        String username = principal.getName();
        User user = userService.findByUsername(username); 
        Profile profile = profileService.getProfileByUser(user);
        model.addAttribute("profile", profile);
        return "profile/profile"; // Trả về giao diện Thymeleaf
    }

    @PostMapping("/update")
    public String updateProfile(
        @ModelAttribute("profile") Profile profile, 
        @RequestParam(value = "avatarImage", required = false) org.springframework.web.multipart.MultipartFile avatarImage,
        Principal principal
    ) {
        if (principal == null) return "redirect:/login";
        
        String username = principal.getName();
        User user = userService.findByUsername(username);
        
        // Find existing profile to preserve id and existing avatar if not updated
        Profile existingProfile = profileService.getProfileByUser(user);
        if (existingProfile.getId() != null) {
            profile.setId(existingProfile.getId());
        }
        if (avatarImage == null || avatarImage.isEmpty()) {
             profile.setAvatarUrl(existingProfile.getAvatarUrl());
        }

        // Handle Avatar File Upload
        if (avatarImage != null && !avatarImage.isEmpty()) {
            try {
                String uploadDir = "uploads/avatars/";
                java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                
                String originalFilename = avatarImage.getOriginalFilename();
                String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
                String fileName = user.getUsername() + "_" + System.currentTimeMillis() + fileExtension;
                
                java.nio.file.Path filePath = uploadPath.resolve(fileName);
                java.nio.file.Files.copy(avatarImage.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                
                // Set the URL path for the frontend (Mapped via WebConfig)
                profile.setAvatarUrl("/" + uploadDir + fileName);
            } catch (java.io.IOException e) {
                e.printStackTrace();
            }
        }
        
        profile.setUser(user);
        profile.setUpdatedAt(java.time.LocalDateTime.now());
        profileService.updateProfile(profile);
        return "redirect:/profile";
    }
}
