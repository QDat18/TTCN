package com.example.be_phela.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;


import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "address")
public class Address {
    @Id
    @UuidGenerator
    @Column(name = "address_id", nullable = false, unique = true)
    private String addressId;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "district", nullable = false)
    private String district;

    @Column(name = "ward", nullable = false)
    private String ward;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "detailed_address", nullable = false)
    private String detailedAddress;

    @Column(name = "latitude", nullable = true)
    private Double latitude;

    @Column(name = "longitude", nullable = true)
    private Double longitude;

    // Đánh dấu mặc định
    @Builder.Default
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;


}
