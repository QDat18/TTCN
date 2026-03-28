package com.example.be_phela.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "product_size")
public class ProductSize {
    @Id
    @UuidGenerator
    @Column(name = "product_size_id", nullable = false, unique = true)
    private String productSizeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "size_name", nullable = false)
    String sizeName; // PHÊ, LA, PLUS

    @Column(name = "size_code", nullable = false)
    String sizeCode; // PHE, LA, PLUS

    @Column(name = "additional_price")
    Double additionalPrice;

    @Column(name = "final_price", nullable = false)
    Double finalPrice;

    @Column(name = "stock_quantity")
    Integer stockQuantity;

    @Column(name = "sku", unique = true)
    String sku;

    @Column(name = "status")
    String status; // ACTIVE, INACTIVE
}
