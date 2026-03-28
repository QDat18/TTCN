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
@Entity(name = "cart_item")
public class CartItem {
    @Id
    @UuidGenerator
    @Column(name = "cart_item_id", nullable = false, unique = true)
    private String cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_size_id")
    private ProductSize productSize;

    @NotNull(message = "Quantity is required")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "note")
    private String note;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "cart_item_toppings",
            joinColumns = @JoinColumn(name = "cart_item_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private java.util.List<Product> toppings;
}
