package com.example.be_phela.model;

import com.example.be_phela.model.enums.OrderStatus;
import com.example.be_phela.model.enums.PaymentMethod;
import com.example.be_phela.model.enums.PaymentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "orders")
public class Order {
    @Id
    @UuidGenerator
    @Column(name = "order_id", nullable = false, unique = true)
    private String orderId;

    @NotNull(message = "Order code is required")
    @Column(name = "order_code", nullable = false, unique = true)
    private String orderCode;

    @NotNull(message = "Total amount is required")
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "total_discount")
    private Double totalDiscount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_code", nullable = false)
    private Branch branch;

    @NotNull(message = "Order status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    // Thơi gian đặt hàng
    @CreationTimestamp
    @Column(name = "order_date", nullable = false, updatable = false)
    private LocalDateTime orderDate;

    // Thời gian cập nhật
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Thời gian giao hàng
    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    // Phí ship
    @Builder.Default
    @Column(name = "shipping_fee", nullable = false)
    private Double shippingFee = 0.0;

    @Column(name = "final_amount", nullable = false)
    private Double finalAmount;

    @NotNull(message = "Payment method is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @NotNull(message = "Payment status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;

}

