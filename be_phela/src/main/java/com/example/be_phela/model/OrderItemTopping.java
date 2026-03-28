package com.example.be_phela.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "order_item_topping")
public class OrderItemTopping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    OrderItem orderItem;

    @Column(name = "product_id")
    String productId;

    @Column(name = "topping_name")
    String toppingName;

    @Column(name = "price")
    Double price;
}
