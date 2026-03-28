package com.example.be_phela.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductSizeResponseDTO {
    private String productSizeId;
    private String sizeName;
    private Double price;
}
