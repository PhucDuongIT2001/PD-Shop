package com.example.demo.service;

import com.example.demo.dto.ProfileDto;
import com.example.demo.entity.Profile;
import com.example.demo.entity.User;
import com.example.demo.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public Profile getProfileByUser(User user) {
        // Find profile or create a new one if it doesn't exist for the user
        return profileRepository.findByUser(user).orElseGet(() -> {
            Profile newProfile = new Profile();
            newProfile.setUser(user);
            return newProfile;
        });
    }

    @Transactional
    public Profile updateProfile(User user, ProfileDto profileDto, MultipartFile avatarImage) {
        Profile profile = getProfileByUser(user);

        profile.setFullName(profileDto.getFullName());
        profile.setAddress(profileDto.getAddress());
        profile.setPhone(profileDto.getPhone());
        profile.setUpdatedAt(LocalDateTime.now());

        if (avatarImage != null && !avatarImage.isEmpty()) {
            String avatarPath = fileStorageService.storeFile(avatarImage, "avatars");
            profile.setAvatarUrl(avatarPath);
        }

        return profileRepository.save(profile);
    }
}
