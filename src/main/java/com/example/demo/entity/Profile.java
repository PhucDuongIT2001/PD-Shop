package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "full_name")
    private String fullName;

    private String gender;

    private LocalDate dob;
    
    private String address;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "phone_contact")
    private String phoneContact;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
