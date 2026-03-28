package com.example.be_phela.repository;

import com.example.be_phela.model.Product;
import com.example.be_phela.model.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductSizeRepository extends JpaRepository<ProductSize, String> {
    boolean existsByProduct(Product product);
}
