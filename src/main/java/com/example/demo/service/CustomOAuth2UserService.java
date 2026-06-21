package com.example.demo.service;

import com.example.demo.entity.Profile;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import com.example.demo.entity.VerificationToken;
import com.example.demo.repository.VerificationTokenRepository;
import java.time.LocalDateTime;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            System.err.println("OAUTH2 ERROR: " + ex.getMessage());
            ex.printStackTrace();
            // Throwing an instance of AuthenticationException will trigger the OAuth2AuthenticationFailureHandler
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Optional: update user details if necessary
            if (!"google".equals(user.getProvider())) {
                user.setProvider("google");
                user.setProviderId(oAuth2User.getAttribute("sub"));
                userRepository.save(user);
            }
            if (!user.isEnabled()) {
                generateAndSendOtp(user);
            }
        } else {
            user = registerNewOAuth2User(userRequest, oAuth2User);
        }

        java.util.List<org.springframework.security.core.GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        role.getName().startsWith("ROLE_") ? role.getName() : "ROLE_" + role.getName()))
                .collect(java.util.stream.Collectors.toList());

        return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
                authorities, oAuth2User.getAttributes(), "email");
    }

    private User registerNewOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        User user = new User();
        
        user.setProvider("google");
        user.setProviderId(oAuth2User.getAttribute("sub"));
        
        String name = oAuth2User.getAttribute("name");
        String email = oAuth2User.getAttribute("email");
        
        // Use email as username if username is not available, or generate one
        user.setUsername(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5));
        user.setEmail(email);
        
        // Generate random password for OAuth2 users since they don't use it to login
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setEnabled(false); // New Google login users must verify email with OTP

        Role userRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("CUSTOMER");
                    return roleRepository.save(newRole);
                });

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        Profile profile = new Profile();
        profile.setFullName(name);
        String picture = oAuth2User.getAttribute("picture");
        if (picture != null) {
            profile.setAvatarUrl(picture);
        }
        profile.setUser(user);
        user.setProfile(profile);

        User savedUser = userRepository.save(user);
        generateAndSendOtp(savedUser);
        return savedUser;
    }

    private void generateAndSendOtp(User user) {
        verificationTokenRepository.deleteByUser(user);
        verificationTokenRepository.flush();

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        VerificationToken verificationToken = new VerificationToken(otp, user, LocalDateTime.now().plusMinutes(15));
        verificationTokenRepository.save(verificationToken);

        emailService.sendOtpVerificationEmail(user.getEmail(), otp);
    }
}
