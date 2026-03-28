package com.example.be_phela.dto.request;

import com.example.be_phela.dto.response.ProductResponseDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemDTO {
    String cartItemId;
    String productId;
    String productSizeId;
    String productSizeName;
    Integer quantity;
    Double amount;
    String note;
    java.util.List<String> toppingIds;
    java.util.List<ProductResponseDTO> selectedToppings;
}
