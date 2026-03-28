package com.example.be_phela.dto.response;

import com.example.be_phela.model.Category;
import com.example.be_phela.model.enums.ProductStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponseDTO {
    private String productId;
    private String productCode;
    private String productName;
    private String description;
    private Double originalPrice;
    private String imageUrl;
    private String categoryCode;
    private ProductStatus status;
    private List<ProductSizeResponseDTO> sizes;
}
