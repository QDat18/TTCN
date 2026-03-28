package com.example.be_phela.service;

import com.example.be_phela.dto.request.OrderCreateDTO;
import com.example.be_phela.dto.request.OrderItemDTO;
import com.example.be_phela.dto.response.*;
import com.example.be_phela.interService.IOrderService;
import com.example.be_phela.mapper.CustomerMapper;
import com.example.be_phela.model.*;
import com.example.be_phela.model.enums.*;
import com.example.be_phela.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService implements IOrderService {

    OrderRepository orderRepository;
    CustomerRepository customerRepository;
    CartRepository cartRepository;
    BranchRepository branchRepository;
    CartService cartService;
    AddressRepository addressRepository;
    CustomerMapper customerMapper;
    AdminRepository adminRepository;
    OrderItemToppingRepository orderItemToppingRepository;
    ProductRepository productRepository;

    private String generateOrderCode() {
        String code;
        int attempts = 0;
        do {
            int numericPart = ThreadLocalRandom.current().nextInt(100000000, 1000000000);
            code = "ORD" + numericPart;
            attempts++;
        } while (orderRepository.existsByOrderCode(code) && attempts < 5);

        if (orderRepository.existsByOrderCode(code)) {
            long fallback = System.currentTimeMillis() % 1_000_000_000L;
            code = "ORD" + String.format("%09d", fallback);
        }

        return code;
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrderFromCart(OrderCreateDTO orderCreateDTO) {
        Cart cart = cartRepository.findById(orderCreateDTO.getCartId())
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + orderCreateDTO.getCartId()));

        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cannot create order from an empty cart.");
        }

        Address address = addressRepository.findById(orderCreateDTO.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + orderCreateDTO.getAddressId()));

        Branch branch = branchRepository.findById(orderCreateDTO.getBranchCode())
                .orElseThrow(() -> new RuntimeException("Branch not found with code: " + orderCreateDTO.getBranchCode()));

        if (!address.getCustomer().getCustomerId().equals(cart.getCustomer().getCustomerId())) {
            throw new RuntimeException("This address does not belong to the customer.");
        }

        double totalAmount = cartService.calculateCartTotalFromItems(cart);
        double shippingFee = cartService.calculateShippingFee(cart.getCartId());

        double totalDiscountFromPromos = 0.0;
        if (cart.getPromotionCarts() != null) {
            totalDiscountFromPromos = cart.getPromotionCarts().stream()
                .filter(pc -> pc.getDiscountAmount() != null)
                .mapToDouble(PromotionCart::getDiscountAmount)
                .sum();
        }

        double finalAmount = totalAmount + shippingFee - totalDiscountFromPromos;

        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .totalAmount(totalAmount)
                .customer(cart.getCustomer())
                .address(address)
                .branch(branch)
                .status(OrderStatus.PENDING)
                .shippingFee(shippingFee)
                .totalDiscount(totalDiscountFromPromos)
                .finalAmount(finalAmount)
                .paymentMethod(orderCreateDTO.getPaymentMethod())
                .paymentStatus(orderCreateDTO.getPaymentMethod() == PaymentMethod.COD
                        ? PaymentStatus.PENDING
                        : PaymentStatus.AWAITING_PAYMENT)
                .build();

        List<OrderItem> orderItems = cart.getCartItems().stream()
                .map(cartItem -> {
                    OrderItem orderItem = OrderItem.builder()
                            .order(order)
                            .product(cartItem.getProduct())
                            .productSize(cartItem.getProductSize())
                            .quantity(cartItem.getQuantity())
                            .amount(cartItem.getAmount())
                            .note(cartItem.getNote())
                            .build();

                    if (cartItem.getToppings() != null && !cartItem.getToppings().isEmpty()) {
                        List<OrderItemTopping> selectedToppings = cartItem.getToppings().stream()
                                .map(topping -> OrderItemTopping.builder()
                                        .orderItem(orderItem)
                                        .productId(topping.getProductId())
                                        .toppingName(topping.getProductName())
                                        .price(topping.getOriginalPrice() != null ? topping.getOriginalPrice() : 0.0)
                                        .build())
                                .collect(Collectors.toList());
                        orderItem.setSelectedToppings(selectedToppings);
                    }
                    return orderItem;
                })
                .collect(Collectors.toList());
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        if (orderCreateDTO.getPaymentMethod() == PaymentMethod.COD) {
            cartService.clearCartItems(cart.getCartId());
        }

        return convertToResponseDTO(savedOrder);
    }

    @Override
    @Transactional
    public void confirmBankTransferPayment(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        if (order.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            throw new RuntimeException("Order is not paid by bank transfer");
        }
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
             return;
        }
         if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot confirm payment for a cancelled order");
        }

        order.setPaymentStatus(PaymentStatus.COMPLETED);
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        cartRepository.findByCustomer_CustomerId(order.getCustomer().getCustomerId())
            .ifPresent(cart -> cartService.clearCartItems(cart.getCartId()));

        // Tích điểm khi chuyển khoản thành công
        Customer customer = order.getCustomer();
        customer.setPointUse(customer.getPointUse() + 1);
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public OrderResponseDTO getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return convertToResponseDTO(order);
    }

    @Override
    @Transactional
    public void cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order cannot be cancelled in current status");
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Hoàn lại điểm nếu đã tích
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            Customer customer = order.getCustomer();
            customer.setPointUse(customer.getPointUse() - 1);
            customerRepository.save(customer);
        }

        checkAndBlockCustomer(order.getCustomer());
    }

    private void checkAndBlockCustomer(Customer customer) {
        LocalDateTime threeMonthsAgo = LocalDateTime.now().minusMonths(3);

        // Đếm số đơn hàng đã hủy trong 3 tháng qua
        long cancelledCount = orderRepository.countByCustomerAndStatusSince(
                customer.getCustomerId(),
                OrderStatus.CANCELLED,
                threeMonthsAgo
        );

        // Nếu số lần hủy vượt quá 5, khóa tài khoản
        if (cancelledCount >= 5) {
            customerRepository.updateStatus(customer.getCustomerId(), Status.BLOCKED);
        }
    }

    @Override
    @Transactional
    public void updateOrderStatus(String orderId, OrderStatus newStatus, String username) {

        Admin currentAdmin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin user '" + username + "' not found"));

        Roles currentUserRole = currentAdmin.getRole();

        boolean isAllowed = switch (currentUserRole) {
            case SUPER_ADMIN, ADMIN ->
                    List.of(OrderStatus.CONFIRMED, OrderStatus.DELIVERING, OrderStatus.DELIVERED, OrderStatus.CANCELLED).contains(newStatus);
            case STAFF ->
                    List.of(OrderStatus.CONFIRMED, OrderStatus.DELIVERING).contains(newStatus);
            case DELIVERY_STAFF ->
                    newStatus == OrderStatus.DELIVERED;
            default -> false;
        };

        if (!isAllowed) {
            throw new AccessDeniedException("User " + username + " does not have permission to change the order to status: " + newStatus);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getStatus() == newStatus) {
            throw new RuntimeException("Order is already in this status.");
        }
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot change status of a completed or cancelled order.");
        }

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveryDate(LocalDateTime.now());
            if (order.getPaymentMethod() == PaymentMethod.COD) {
                order.setPaymentStatus(PaymentStatus.COMPLETED);
            }
        }
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public List<OrderResponseDTO> getOrdersByCustomerId(String customerId) {
        List<Order> orders = orderRepository.findByCustomer_CustomerIdOrderByOrderDateDesc(customerId);
        return orders.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // Helper method: Chuyển đổi từ Order entity sang OrderResponseDTO
    private OrderResponseDTO convertToResponseDTO(Order order) {
        return OrderResponseDTO.builder()
                .orderId(order.getOrderId())
                .orderCode(order.getOrderCode())
                .totalAmount(order.getTotalAmount())
                .customerId(order.getCustomer().getCustomerId())
                .addressId(order.getAddress().getAddressId())
                .address(AddressDTO.builder()
                        .addressId(order.getAddress().getAddressId())
                        .city(order.getAddress().getCity())
                        .district(order.getAddress().getDistrict())
                        .ward(order.getAddress().getWard())
                        .recipientName(order.getAddress().getRecipientName())
                        .phone(order.getAddress().getPhone())
                        .detailedAddress(order.getAddress().getDetailedAddress())
                        .latitude(order.getAddress().getLatitude())
                        .longitude(order.getAddress().getLongitude())
                        .isDefault(order.getAddress().getIsDefault())
                        .build())
                .branchCode(order.getBranch().getBranchCode())
                .branch(BranchResponseDTO.builder()
                        .branchCode(order.getBranch().getBranchCode())
                        .branchName(order.getBranch().getBranchName())
                        .latitude(order.getBranch().getLatitude())
                        .longitude(order.getBranch().getLongitude())
                        .city(order.getBranch().getCity())
                        .district(order.getBranch().getDistrict())
                        .address(order.getBranch().getAddress())
                        .status(order.getBranch().getStatus())
                        .build())
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .updatedAt(order.getUpdatedAt())
                .deliveryDate(order.getDeliveryDate())
                .shippingFee(order.getShippingFee())
                .totalDiscount(order.getTotalDiscount())
                .finalAmount(order.getFinalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderItems(order.getOrderItems().stream()
                        .map(item -> OrderItemDTO.builder()
                                .productId(item.getProduct().getProductId())
                                .productSizeId(item.getProductSize() != null ? item.getProductSize().getProductSizeId() : null)
                                .quantity(item.getQuantity())
                                .price(item.getAmount() / item.getQuantity()) // Tạm tính giá
                                .amount(item.getAmount())
                                .note(item.getNote())
                                .toppingNames(item.getSelectedToppings() != null ?
                                        item.getSelectedToppings().stream().map(OrderItemTopping::getToppingName).collect(Collectors.toList()) :
                                        new ArrayList<>())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrderByCode(String orderCode) {
        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
        orderOpt.ifPresent(order -> {
            // Force initialize lazy associations needed for payment processing
            if (order.getOrderItems() != null) {
                order.getOrderItems().forEach(item -> {
                    if (item.getProduct() != null) {
                        item.getProduct().getProductName();
                    }
                });
            }
            if (order.getCustomer() != null) {
                order.getCustomer().getEmail();
            }
            if (order.getAddress() != null) {
                order.getAddress().getRecipientName();
            }
        });
        return orderOpt;
    }

    @Transactional
    public Optional<Order> getOrderByCodeWithLock(String orderCode) {
        Optional<Order> orderOpt = orderRepository.findByOrderCodeWithLock(orderCode);
        orderOpt.ifPresent(order -> {
            // Force initialize lazy associations needed for payment processing
            if (order.getOrderItems() != null) {
                order.getOrderItems().forEach(item -> {
                    if (item.getProduct() != null) {
                        item.getProduct().getProductName();
                    }
                });
            }
            if (order.getCustomer() != null) {
                order.getCustomer().getEmail();
            }
            if (order.getAddress() != null) {
                order.getAddress().getRecipientName();
            }
        });
        return orderOpt;
    }

    @Transactional
    public void rollbackOrderDueToPaymentFailure(String orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getPaymentStatus() == PaymentStatus.AWAITING_PAYMENT) {
            restoreCartFromOrder(order);
            orderRepository.delete(order);
        }
    }

    private void restoreCartFromOrder(Order order) {
        Customer customer = order.getCustomer();
        if (customer == null) {
            return;
        }

        Cart cart = cartRepository.findByCustomer_CustomerId(customer.getCustomerId())
                .orElseGet(() -> cartService.createCartForCustomer(customer.getCustomerId()));

        if (cart.getCartItems() == null) {
            cart.setCartItems(new ArrayList<>());
        }

        if (cart.getPromotionCarts() != null) {
            cart.getPromotionCarts().clear();
        }

        cart.setAddress(order.getAddress());
        cart.setBranch(order.getBranch());

        List<OrderItem> orderItems = order.getOrderItems();
        if (orderItems == null || orderItems.isEmpty()) {
            cartRepository.save(cart);
            return;
        }

        for (OrderItem orderItem : orderItems) {
            if (orderItem.getProduct() == null) {
                continue;
            }

            CartItem existingItem = cart.getCartItems().stream()
                    .filter(item -> item.getProduct().getProductId().equals(orderItem.getProduct().getProductId()) &&
                            (orderItem.getProductSize() == null ? item.getProductSize() == null :
                                    (item.getProductSize() != null && item.getProductSize().getProductSizeId().equals(orderItem.getProductSize().getProductSizeId()))) &&
                            isSameToppingsAfterOrder(item.getToppings(), orderItem.getSelectedToppings()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                existingItem.setQuantity(existingItem.getQuantity() + orderItem.getQuantity());
                existingItem.setAmount(existingItem.getAmount() + orderItem.getAmount());
                existingItem.setNote(orderItem.getNote());
            } else {
                List<Product> toppingsToRestore = new ArrayList<>();
                if (orderItem.getSelectedToppings() != null) {
                    for (OrderItemTopping ot : orderItem.getSelectedToppings()) {
                        productRepository.findById(ot.getProductId()).ifPresent(toppingsToRestore::add);
                    }
                }

                CartItem cartItem = CartItem.builder()
                        .cart(cart)
                        .product(orderItem.getProduct())
                        .productSize(orderItem.getProductSize())
                        .quantity(orderItem.getQuantity())
                        .amount(orderItem.getAmount())
                        .note(orderItem.getNote())
                        .toppings(toppingsToRestore)
                        .build();
                cart.getCartItems().add(cartItem);
            }
        }

        cart.setTotalAmount(cartService.calculateCartTotalFromItems(cart));
        cartRepository.save(cart);
    }

    private boolean isSameToppingsAfterOrder(List<Product> cartToppings, List<OrderItemTopping> orderToppings) {
        if (cartToppings == null && orderToppings == null) return true;
        if (cartToppings == null || orderToppings == null) return false;
        if (cartToppings.size() != orderToppings.size()) return false;
        List<String> ids1 = cartToppings.stream().map(Product::getProductId).sorted().toList();
        List<String> ids2 = orderToppings.stream().map(OrderItemTopping::getProductId).sorted().toList();
        return ids1.equals(ids2);
    }

    // Lấy danh sách hóa đơn theo trạng thái
    @Override
    public List<OrderResponseDTO> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        // Chỉ áp dụng logic sắp xếp đặc biệt cho trạng thái CONFIRMED
        if (status == OrderStatus.CONFIRMED) {
            // Sắp xếp danh sách: ưu tiên các đơn hàng chỉ có 1 sản phẩm lên đầu
            orders.sort((o1, o2) -> {
                boolean o1HasOneProduct = o1.getOrderItems().size() == 1;
                boolean o2HasOneProduct = o2.getOrderItems().size() == 1;

                if (o1HasOneProduct && !o2HasOneProduct) {
                    return -1;
                } else if (!o1HasOneProduct && o2HasOneProduct) {
                    return 1;
                } else {
                    // Nếu cả hai cùng có 1 sản phẩm hoặc cùng có nhiều sản phẩm,
                    // có thể sắp xếp phụ theo ngày đặt hàng để đảm bảo tính nhất quán.
                    // Ở đây tạm giữ nguyên thứ tự tương đối.
                    return 0;
                }
            });
        }

        return orders.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    //Lấy thông tin khách hàng từ ID đơn hàng
    @Override
    public CustomerResponseDTO getCustomerByOrderId(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        Customer customer = order.getCustomer();
        // Giả sử bạn có một hàm convertToResponseDTO trong CustomerService hoặc tự map ở đây
        return customerMapper.toCustomerResponseDTO(customer);
    }

}