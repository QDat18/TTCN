package com.example.be_phela.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "news")
public class News {
    @Id
    @UuidGenerator
    @Column(name = "news_id", nullable = false, unique = true)
    private String newsId;
    @Column(name = "title")
    private String title;
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
