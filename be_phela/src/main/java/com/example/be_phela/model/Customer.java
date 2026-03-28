package com.example.be_phela.model;

import com.example.be_phela.model.enums.Roles;
import com.example.be_phela.model.enums.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "customer")
public class Customer implements UserDetails {
    @Id
    @UuidGenerator
    @Column(name = "id", nullable = false,length = 36)
    private String customerId;

    @Column(name = "customer_code", nullable = false, unique = true)
    private String customerCode;

    @Column(name = "username",nullable = false,length = 100, unique = true)
    private String username;

    @Column(name = "gender",nullable = false)
    private String gender;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "phone")
    private String phone;

    @Column(name = "password",nullable = false)
    private String password;

    @Column(name = "email",nullable = false)
    private String email;

    @Column(name = "role",nullable = false)
    @NotNull
    @Enumerated(EnumType.STRING)
    private Roles role;

    @CreationTimestamp
    @Column(name = "created_at",nullable = false,updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false, updatable = true)
    private LocalDateTime updatedAt;

    @Column(name = "status",nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Builder.Default
    @Column(name = "point_use", nullable = false)
    private Double pointUse = 0.0;

    @Builder.Default
    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "latitude")
    Double latitude;

    @Column(name = "longitude")
    Double longitude;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.status != Status.BLOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.status == Status.ACTIVE;
    }

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Address> addresses;
}
