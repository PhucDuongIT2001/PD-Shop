package com.example.demo.dto;

import com.example.demo.entity.Profile;

public class ProfileDto {
    private String fullName;
    private String address;
    private String phone;
    private String avatarUrl;
    private String username;
    private String email;

    public ProfileDto(Profile profile) {
        if (profile != null) {
            this.fullName = profile.getFullName();
            this.address = profile.getAddress();
            this.phone = profile.getPhone();
            this.avatarUrl = profile.getAvatarUrl();
            if (profile.getUser() != null) {
                this.username = profile.getUser().getUsername();
                this.email = profile.getUser().getEmail();
            }
        }
    }

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
