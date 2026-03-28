package com.example.be_phela.dto.request;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemDTO {
    String productId;
    String productSizeId;
    String productSizeName;
    Integer quantity;
    Double price;
    Double amount;
    String note;
    List<String> toppingNames;
}
