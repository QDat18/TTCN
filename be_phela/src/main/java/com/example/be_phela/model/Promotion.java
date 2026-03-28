package com.example.be_phela.model;

import com.example.be_phela.model.enums.DiscountType;
import com.example.be_phela.model.enums.PromotionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.List;

@ToString(exclude = {"promotionCarts"})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "promotion")
public class Promotion {
    @Id
    @UuidGenerator
    @Column(name = "promotion_id", nullable = false, unique = true)
    private String promotionId;

    @NotBlank(message = "Promotion code is required")
    @Column(name = "promotion_code", nullable = false, unique = true)
    private String promotionCode;

    @NotBlank(message = "Promotion name is required")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @NotNull(message = "Discount type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    // Giá trị đơn hàng tối thiểu
    @Column(name = "minimum_order_amount")
    private Double minimumOrderAmount;

    //Giá trị giảm giá tối đa
    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PromotionStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = true)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PromotionCart> promotionCarts;

}
