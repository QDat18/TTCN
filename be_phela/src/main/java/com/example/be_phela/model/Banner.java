package com.example.be_phela.model;

import com.example.be_phela.model.enums.BannerStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "banner")
public class Banner {
    @Id
    @UuidGenerator
    @Column(name = "banner_id", nullable = false, unique = true)
    private String bannerId;
    @Column(name = "image_url")
    private String imageUrl;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BannerStatus status;
}
