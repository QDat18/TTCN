package com.example.be_phela.service;

import com.example.be_phela.dto.request.CustomerCreateDTO;
import com.example.be_phela.dto.request.CustomerLocationUpdateDTO;
import com.example.be_phela.dto.request.CustomerPasswordUpdateDTO;
import com.example.be_phela.dto.request.CustomerUpdateDTO;
import com.example.be_phela.dto.response.CustomerResponseDTO;
import com.example.be_phela.exception.DuplicateResourceException;
import com.example.be_phela.exception.ResourceNotFoundException;
import com.example.be_phela.interService.ICustomerService;
import com.example.be_phela.mapper.CustomerMapper;
import com.example.be_phela.model.Customer;
import com.example.be_phela.model.enums.OrderStatus;
import com.example.be_phela.model.enums.Roles;
import com.example.be_phela.model.enums.Status;
import com.example.be_phela.repository.CustomerRepository;
import com.example.be_phela.repository.OrderRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomerService implements ICustomerService {
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    CustomerMapper customerMapper;
    BCryptPasswordEncoder passwordEncoder;
    CartService cartService;

    public String generateCustomerCode() {
        long count = customerRepository.count();
        return String.format("KH%06d", count + 1);
    }

    @Override
    public Customer buildCustomer(@Valid CustomerCreateDTO customerCreateDTO) {
        if (customerRepository.existsByUsername(customerCreateDTO.getUsername())) {
            throw new DuplicateResourceException("Tên người dùng đã tồn tại");
        }
        if (customerRepository.existsByEmail(customerCreateDTO.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại");
        }
        Customer customer = customerMapper.toCustomer(customerCreateDTO);
        customer.setCustomerCode(generateCustomerCode());
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        customer.setStatus(Status.PENDING);
        customer.setRole(Roles.CUSTOMER);
        return customer;
    }

    @Transactional
    public Customer saveCustomer(Customer customer) {
        try {

            Customer savedCustomer = customerRepository.save(customer);
            cartService.createCartForCustomer(savedCustomer.getCustomerId());

            return savedCustomer;

        } catch (Exception e) {
            throw new RuntimeException("Failed to create customer and cart: " + e.getMessage(), e);
        }
    }

    @Override
    public Page<CustomerResponseDTO> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable)
                .map(this::mapCustomerToDtoWithCancelCount);
    }

    @Override
    public CustomerResponseDTO findCustomerByUsername(String username) {
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with username: " + username));
        return mapCustomerToDtoWithCancelCount(customer);
    }

    // Cập nhật thông tin chung (email, gender)
    @Transactional
    public CustomerResponseDTO updateCustomerInfo(String username, CustomerUpdateDTO customerUpdateDTO) {
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with username: " + username));

        // Kiểm tra email trùng lặp
        if (!customer.getEmail().equals(customerUpdateDTO.getEmail()) &&
                customerRepository.existsByEmail(customerUpdateDTO.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        customer.setEmail(customerUpdateDTO.getEmail());
        customer.setGender(customerUpdateDTO.getGender());
        customer.setFullname(customerUpdateDTO.getFullname());
        customer.setPhone(customerUpdateDTO.getPhone());
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponseDTO(updatedCustomer);
    }

    // Cập nhật vị trí (latitude, longitude)
    @Transactional
    public CustomerResponseDTO updateLocation(String username, CustomerLocationUpdateDTO locationUpdateDTO) {
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with username: " + username));

        customer.setLatitude(locationUpdateDTO.getLatitude());
        customer.setLongitude(locationUpdateDTO.getLongitude());
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponseDTO(updatedCustomer);
    }

    // Cập nhật mật khẩu
    @Transactional
    public CustomerResponseDTO updatePassword(String username, CustomerPasswordUpdateDTO passwordUpdateDTO) {
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with username: " + username));

        customer.setPassword(passwordEncoder.encode(passwordUpdateDTO.getPassword()));
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toCustomerResponseDTO(updatedCustomer);
    }

    private CustomerResponseDTO mapCustomerToDtoWithCancelCount(Customer customer) {
        CustomerResponseDTO dto = customerMapper.toCustomerResponseDTO(customer);
        long cancelCount = orderRepository.countByCustomer_CustomerIdAndStatus(customer.getCustomerId(), OrderStatus.CANCELLED);
        dto.setOrderCancelCount(cancelCount);
        return dto;
    }

    @Override
    public Optional<Customer> findByEmail(String email) {
        return customerRepository.findByEmail(email);
    }
}
