package com.example.be_phela.repository;

import com.example.be_phela.model.Admin;
import com.example.be_phela.model.enums.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface AdminRepository extends JpaRepository<Admin, String> {
    Optional<Admin> findByUsername(String username);
    Boolean existsByUsername(String name);
    Optional<Admin> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<Admin> findByRole(Roles role);
    Optional<Admin> findById(String id);
}
