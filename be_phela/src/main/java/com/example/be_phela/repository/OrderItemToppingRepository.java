package com.example.be_phela.repository;

import com.example.be_phela.model.OrderItemTopping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemToppingRepository extends JpaRepository<OrderItemTopping, Long> {
}
