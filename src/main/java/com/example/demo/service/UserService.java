package com.example.demo.service;

import com.example.demo.dto.UserRegistrationDto;
import com.example.demo.entity.Profile;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.entity.VerificationToken;
import com.example.demo.entity.PasswordResetToken;
import com.example.demo.repository.PasswordResetTokenRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.VerificationTokenRepository;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.ReviewRepository;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public User registerNewUser(UserRegistrationDto registrationDto) {
        if (userRepository.findByUsername(registrationDto.getUsername()).isPresent()) {
            throw new IllegalStateException("Username already exists");
        }
        if (userRepository.findByEmail(registrationDto.getEmail()).isPresent()) {
            throw new IllegalStateException("Email already exists");
        }

        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));

        Role userRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> {
                    logger.info("Role 'CUSTOMER' not found, creating it.");
                    Role newRole = new Role();
                    newRole.setName("CUSTOMER");
                    return roleRepository.save(newRole);
                });

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        // Khởi tạo Profile và lưu số điện thoại
        Profile profile = new Profile();
        profile.setPhone(registrationDto.getPhone());
        profile.setUser(user);
        user.setProfile(profile);

        logger.info("Registering new user: {}", user.getUsername());
        User savedUser = userRepository.save(user);

        // Generate and save OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        VerificationToken verificationToken = new VerificationToken(otp, savedUser, LocalDateTime.now().plusMinutes(15));
        verificationTokenRepository.save(verificationToken);

        // Send OTP email
        emailService.sendOtpVerificationEmail(savedUser.getEmail(), otp);

        // Notify Admins about new user registration
        try {
            notificationService.sendToAdmins(
                "Người dùng mới đăng ký",
                "Tài khoản " + savedUser.getUsername() + " (" + savedUser.getEmail() + ") vừa đăng ký thành viên mới.",
                com.example.demo.entity.enums.NotificationType.NEW_USER_REGISTERED,
                com.example.demo.entity.enums.NotificationPriority.LOW,
                "/admin/customers"
            );
        } catch (Exception e) {
            logger.error("Failed to send new user notification: {}", e.getMessage());
        }

        return savedUser;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public void deleteById(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            logger.info("Admin deleting user: {}", user.getUsername());
            // Delete reviews
            reviewRepository.deleteByUserId(user.getId());
            // Delete cart
            cartRepository.findByUser(user).ifPresent(cart -> cartRepository.delete(cart));
            // Delete verification tokens
            verificationTokenRepository.deleteByUser(user);
            // Delete password reset tokens
            tokenRepository.deleteByUser(user);
            // Delete user
            userRepository.delete(user);
        });
    }

    @Transactional
    public void toggleUserStatus(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setEnabled(!user.getEnabled());
            userRepository.save(user);
        });
    }

    @Transactional
    public String createPasswordResetTokenForUser(User user) {
        tokenRepository.deleteByUser(user); // Xóa token cũ nếu có
        tokenRepository.flush();
        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken(token, user, LocalDateTime.now().plusMinutes(10));
        tokenRepository.save(myToken);
        return token;
    }

    public String validatePasswordResetToken(String token) {
        Optional<PasswordResetToken> passToken = tokenRepository.findByToken(token);
        if (!passToken.isPresent()) {
            return "invalidToken";
        }

        PasswordResetToken resetToken = passToken.get();
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return "expired";
        }
        return null;
    }

    @Transactional
    public void changeUserPassword(String token, String newPassword) {
        Optional<PasswordResetToken> passToken = tokenRepository.findByToken(token);
        if (passToken.isPresent()) {
            User user = passToken.get().getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            tokenRepository.deleteByUser(user);
        }
    }

    @Transactional
    public void updateUserProfile(String username, String phone, String address, String fullName) {
        userRepository.findByUsername(username).ifPresent(user -> {
            Profile profile = user.getProfile();
            if (profile == null) {
                profile = new Profile();
                profile.setUser(user);
                user.setProfile(profile);
            }
            profile.setPhone(phone);
            profile.setAddress(address);
            profile.setFullName(fullName);
            userRepository.save(user);
        });
    }

    @Transactional
    public void changeUserPasswordWithOldPassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public boolean verifyAccount(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEnabled()) {
            return true; // Already verified
        }

        VerificationToken token = verificationTokenRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        if (!token.getToken().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        user.setEnabled(true);
        userRepository.save(user);
        verificationTokenRepository.deleteByUser(user);
        return true;
    }

    @Transactional
    public void resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEnabled()) {
            throw new RuntimeException("Account is already verified");
        }

        verificationTokenRepository.deleteByUser(user);
        verificationTokenRepository.flush();

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        VerificationToken verificationToken = new VerificationToken(otp, user, LocalDateTime.now().plusMinutes(15));
        verificationTokenRepository.save(verificationToken);

        emailService.sendOtpVerificationEmail(user.getEmail(), otp);
    }

    @Transactional
    public User createUserByAdmin(String username, String email, String password, String phone, String fullName, Set<String> roleNames) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalStateException("Tên tài khoản đã tồn tại");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("Email đã tồn tại");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setEnabled(true); // Admin-created accounts are enabled by default

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(roleName);
                        return roleRepository.save(newRole);
                    });
            roles.add(role);
        }
        user.setRoles(roles);

        Profile profile = new Profile();
        profile.setPhone(phone);
        profile.setFullName(fullName);
        profile.setUser(user);
        user.setProfile(profile);

        return userRepository.save(user);
    }

    @Transactional
    public void adminUpdateUser(Long id, String email, String phone, String fullName, Set<String> roleNames) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (!user.getEmail().equalsIgnoreCase(email) && userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("Email đã tồn tại");
        }

        user.setEmail(email);

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(roleName);
                        return roleRepository.save(newRole);
                    });
            roles.add(role);
        }
        user.setRoles(roles);

        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile();
            profile.setUser(user);
            user.setProfile(profile);
        }
        profile.setPhone(phone);
        profile.setFullName(fullName);

        userRepository.save(user);
    }
}

