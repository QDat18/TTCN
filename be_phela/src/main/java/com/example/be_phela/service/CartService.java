package com.example.be_phela.service;

import com.example.be_phela.dto.request.CartItemDTO;
import com.example.be_phela.dto.response.AddressDTO;
import com.example.be_phela.dto.response.BranchResponseDTO;
import com.example.be_phela.dto.response.CartResponseDTO;
import com.example.be_phela.dto.response.PromotionResponseDTO;
import com.example.be_phela.interService.ICartService;
import com.example.be_phela.model.*;
import com.example.be_phela.model.enums.DiscountType;
import com.example.be_phela.model.enums.PromotionStatus;
import com.example.be_phela.repository.*; 
import com.example.be_phela.utils.DistanceCalculator;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService implements ICartService {

    private static final double BASE_SHIPPING_FEE = 10000.0;
    private static final double FEE_PER_KM = 2000.0;
    private static final double FREE_SHIPPING_THRESHOLD = 500000.0;

    CartRepository cartRepository;
    PromotionRepository promotionRepository;
    CustomerRepository customerRepository;
    ProductRepository productRepository;
    CartItemRepository cartItemRepository;
    AddressRepository addressRepository;
    BranchRepository branchRepository;
    ProductSizeRepository productSizeRepository;
    BranchService branchService;
    com.example.be_phela.mapper.ProductMapper productMapper;

    @Transactional
    public Cart createCartForCustomer(String customerId) {
        Optional<Cart> existingCart = cartRepository.findByCustomer_CustomerId(customerId);
        if (existingCart.isPresent()) {
            log.warn("Cart already exists for customer: {}. Returning existing cart.", customerId);
            return existingCart.get(); 
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        Address defaultAddress = addressRepository.findByCustomer_CustomerIdAndIsDefaultTrue(customerId)
                .orElse(null);

        Optional<Branch> nearestBranch = Optional.empty();
        if (defaultAddress != null) {
            nearestBranch = branchService.findNearestBranch(defaultAddress, branchService.getAllBranches());
        }

        Cart cart = Cart.builder()
                .customer(customer)
                .address(defaultAddress)
                .branch(nearestBranch.orElse(null))
                .totalAmount(0.0)
                .cartItems(new ArrayList<>()) // Đã fix: Tránh lỗi NullPointerException
                .promotionCarts(new ArrayList<>()) // Đã fix: Tránh lỗi NullPointerException
                .build();

        log.info("Creating cart for customer: {}", customerId);
        return cartRepository.save(cart); 
    }

    @Transactional
    public void synchronizeCartAddressAndBranch(String customerId) {
        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Cart not found for customer: " + customerId));

        Address defaultAddress = addressRepository.findByCustomer_CustomerIdAndIsDefaultTrue(customerId)
                .orElse(null);

        if (defaultAddress != null) {
            cart.setAddress(defaultAddress);
            try {
                Optional<Branch> nearestBranch = branchService.findNearestBranch(defaultAddress, branchService.getAllBranches());
                cart.setBranch(nearestBranch.orElse(null));
            } catch (IllegalStateException e) {
                log.warn("No valid branch found for address: {}", defaultAddress.getAddressId());
                cart.setBranch(null);
            }
        } else {
            cart.setAddress(null);
            cart.setBranch(null);
        }

        log.info("Synchronizing address and branch for cart of customer: {}", customerId);
        cartRepository.save(cart); 
    }

    @Transactional
    @Override
    public CartResponseDTO getCartByCustomerId(String customerId) {
        Cart cart = cartRepository.findByCustomer_CustomerId(customerId)
                .orElseGet(() -> {
                    log.info("Cart not found for customer {}. Creating a new one.", customerId);
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .totalAmount(0.0)
                            .cartItems(new ArrayList<>()) // Đã fix: Tránh lỗi NullPointerException
                            .promotionCarts(new ArrayList<>()) // Đã fix: Tránh lỗi NullPointerException
                            .build();
                    return cartRepository.save(newCart);
                });

        Address defaultAddress = addressRepository.findByCustomer_CustomerIdAndIsDefaultTrue(customerId)
                .orElse(null);
        if (defaultAddress != null && (cart.getAddress() == null || !cart.getAddress().getAddressId().equals(defaultAddress.getAddressId()))) {
            cart.setAddress(defaultAddress);
            try {
                Optional<Branch> nearestBranch = branchService.findNearestBranch(defaultAddress, branchService.getAllBranches());
                cart.setBranch(nearestBranch.orElse(null));
            } catch (Exception e) {
                log.warn("Could not find nearest branch for customer {}: {}", customerId, e.getMessage());
                cart.setBranch(null);
            }
            cartRepository.save(cart);
        } else if (defaultAddress == null && cart.getAddress() != null) {
            cart.setAddress(null);
            cart.setBranch(null);
            cartRepository.save(cart); 
        }

        return buildCartResponseDTO(cart);
    }

    @Override
    @Transactional
    public void clearCartItems(String cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));
        if (cart.getCartItems() != null) cart.getCartItems().clear();
        if (cart.getPromotionCarts() != null) cart.getPromotionCarts().clear();
        cart.setTotalAmount(0.0);
        log.info("Cleared items and promotions from cart: {}", cartId);
        cartRepository.save(cart); 
    }

    @Override
    @Transactional
    public CartItem addOrUpdateCartItem(String cartId, CartItemDTO cartItemDTO) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));
        Product product = productRepository.findById(cartItemDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + cartItemDTO.getProductId()));

        ProductSize productSize = null;
        if (cartItemDTO.getProductSizeId() != null && !cartItemDTO.getProductSizeId().isEmpty()) {
            productSize = productSizeRepository.findById(cartItemDTO.getProductSizeId())
                    .orElseThrow(() -> new RuntimeException("Product size not found with id: " + cartItemDTO.getProductSizeId()));
        }

        // Load toppings
        List<Product> toppings = new ArrayList<>();
        if (cartItemDTO.getToppingIds() != null) {
            for (String tid : cartItemDTO.getToppingIds()) {
                toppings.add(productRepository.findById(tid)
                        .orElseThrow(() -> new RuntimeException("Topping not found with id: " + tid)));
            }
        }

        final ProductSize finalProductSize = productSize;
        final List<Product> finalToppings = toppings;
        
        if (cart.getCartItems() == null) {
            cart.setCartItems(new ArrayList<>());
        }

        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(cartItemDTO.getProductId()) &&
                        (finalProductSize == null ? item.getProductSize() == null :
                                (item.getProductSize() != null && item.getProductSize().getProductSizeId().equals(finalProductSize.getProductSizeId()))) &&
                        isSameToppings(item.getToppings(), finalToppings))
                .findFirst();

        double baseUnitPrice = (productSize != null) ? productSize.getFinalPrice() : product.getOriginalPrice();
        double totalToppingPrice = toppings.stream().mapToDouble(Product::getOriginalPrice).sum();
        double unitPrice = baseUnitPrice + totalToppingPrice;

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            if (cartItemDTO.getQuantity() <= 0) {
                cart.getCartItems().remove(cartItem);
            } else {
                cartItem.setQuantity(cartItemDTO.getQuantity());
                cartItem.setAmount(unitPrice * cartItemDTO.getQuantity());
                cartItem.setNote(cartItemDTO.getNote());
                cartItem.setToppings(toppings); 
            }
        } else {
            if (cartItemDTO.getQuantity() <= 0) {
                throw new IllegalArgumentException("Cannot add an item with quantity 0 or less.");
            }
            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .productSize(productSize)
                    .quantity(cartItemDTO.getQuantity())
                    .amount(unitPrice * cartItemDTO.getQuantity())
                    .note(cartItemDTO.getNote())
                    .toppings(toppings)
                    .build();
            cart.getCartItems().add(cartItem);
        }

        cart.setTotalAmount(calculateCartTotalFromItems(cart));
        reapplyAllPromotions(cart);
        log.info("Added/Updated item in cart: {}. Product: {}, Size: {}, Quantity: {}",
                cartId, cartItemDTO.getProductId(), cartItemDTO.getProductSizeId(), cartItemDTO.getQuantity());
        cartRepository.save(cart);
        return cartItem;
    }

    @Override
    @Transactional
    public void removeCartItem(String cartId, String cartItemId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));

        CartItem itemToRemove = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartItemId));

        if (!itemToRemove.getCart().getCartId().equals(cartId)) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }

        if (cart.getCartItems() != null) {
            cart.getCartItems().remove(itemToRemove);
        }
        cart.setTotalAmount(calculateCartTotalFromItems(cart));
        reapplyAllPromotions(cart); 
        log.info("Removed item from cart: {}. Cart item: {}", cartId, cartItemId);
        cartRepository.save(cart); 
    }

    private double calculateShippingFee(Cart cart, double distance) {
        double totalAmount = calculateCartTotalFromItems(cart);
        if (totalAmount >= FREE_SHIPPING_THRESHOLD) { 
            return 0.0;
        }

        Address address = cart.getAddress();
        Branch branch = cart.getBranch();

        if (address == null || branch == null ||
                address.getLatitude() == null || address.getLongitude() == null ||
                branch.getLatitude() == null || branch.getLongitude() == null) {
            return BASE_SHIPPING_FEE; 
        }

        return Math.floor(BASE_SHIPPING_FEE + (distance * FEE_PER_KM)); 
    }

    @Override
    @Transactional
    public void applyPromotionToCart(String cartId, String promotionCode) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));
        Promotion promotion = promotionRepository.findByPromotionCode(promotionCode)
                .orElseThrow(() -> new RuntimeException("Promotion not found with code: " + promotionCode));

        log.info("Applying promotion {} to cart {}", promotionCode, cartId);

        if (promotion.getStatus() != PromotionStatus.ACTIVE ||
                LocalDateTime.now().isBefore(promotion.getStartDate()) ||
                LocalDateTime.now().isAfter(promotion.getEndDate())) {
            log.warn("Promotion {} is not valid. Status: {}, Start: {}, End: {}",
                    promotionCode, promotion.getStatus(), promotion.getStartDate(), promotion.getEndDate());
            throw new RuntimeException("Khuyến mãi không có hiệu lực hoặc đã hết hạn");
        }
        
        if (cart.getPromotionCarts() == null) {
            cart.setPromotionCarts(new ArrayList<>());
        }

        if (cart.getPromotionCarts().stream()
                .anyMatch(pc -> pc.getPromotion().getPromotionId().equals(promotion.getPromotionId()))) {
            log.warn("Promotion {} already applied to cart {}", promotionCode, cartId);
            throw new RuntimeException("Khuyến mãi đã được áp dụng vào giỏ hàng");
        }

        double cartTotal = calculateCartTotalFromItems(cart);

        if (promotion.getMinimumOrderAmount() != null && cartTotal < promotion.getMinimumOrderAmount()) {
            log.warn("Cart total {} does not meet minimum order {} for promotion {}",
                    cartTotal, promotion.getMinimumOrderAmount(), promotionCode);
            throw new RuntimeException("Tổng số tiền trong giỏ hàng không đáp ứng yêu cầu đặt hàng tối thiểu");
        }

        double discount = calculateDiscountAmount(promotion, cartTotal);

        PromotionCart promotionCart = PromotionCart.builder()
                .promotion(promotion)
                .cart(cart)
                .discountAmount(discount)
                .build();
        cart.getPromotionCarts().add(promotionCart);

        cartRepository.save(cart); 
        log.info("Promotion {} applied to cart {} with discount {}", promotionCode, cartId, discount);
    }

    @Override
    @Transactional
    public void removePromotionFromCart(String cartId, String promotionId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));

        if (cart.getPromotionCarts() != null) {
            PromotionCart itemToRemove = cart.getPromotionCarts().stream()
                    .filter(pc -> pc.getPromotion().getPromotionId().equals(promotionId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Promotion with id " + promotionId + " not found in cart"));

            cart.getPromotionCarts().remove(itemToRemove);
        }
        cartRepository.save(cart); 
    }

    private double calculateDiscountAmount(Promotion promotion, double cartTotal) {
        if (promotion.getDiscountType() == DiscountType.PERCENTAGE) { 
            double discount = cartTotal * (promotion.getDiscountValue() / 100);
            if (promotion.getMaxDiscountAmount() != null) {
                return Math.min(discount, promotion.getMaxDiscountAmount());
            }
            return discount;
        }
        return promotion.getDiscountValue(); 
    }

    // Helper method to re-evaluate all applied promotions
    private void reapplyAllPromotions(Cart cart) {
        // Đã fix: Bắt null để tránh lỗi sập
        if (cart.getPromotionCarts() == null) {
            cart.setPromotionCarts(new ArrayList<>());
            return;
        }

        double cartTotal = calculateCartTotalFromItems(cart);
        List<PromotionCart> promotionsToRemove = new ArrayList<>();

        for (PromotionCart pc : cart.getPromotionCarts()) {
            Promotion promotion = pc.getPromotion();
            if (promotion.getMinimumOrderAmount() != null && cartTotal < promotion.getMinimumOrderAmount()) {
                promotionsToRemove.add(pc);
            } else {
                pc.setDiscountAmount(calculateDiscountAmount(promotion, cartTotal));
            }
        }
        cart.getPromotionCarts().removeAll(promotionsToRemove);
    }

    public double calculateCartTotalFromItems(Cart cart) {
        if (cart.getCartItems() == null) return 0.0;
        return cart.getCartItems().stream()
                .mapToDouble(CartItem::getAmount)
                .sum();
    }

    private boolean isSameToppings(List<Product> list1, List<Product> list2) {
        if (list1 == null && list2 == null) return true;
        if (list1 == null || list2 == null) return false;
        if (list1.size() != list2.size()) return false;
        List<String> ids1 = list1.stream().map(Product::getProductId).sorted().toList();
        List<String> ids2 = list2.stream().map(Product::getProductId).sorted().toList();
        return ids1.equals(ids2);
    }

    @Transactional(readOnly = true)
    @Override
    public Integer countItemsInCart(String cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));
        if (cart.getCartItems() == null) return 0;
        return cart.getCartItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    @Override
    @Transactional
    public Double calculateShippingFee(String cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));

        double distance = 0.0;
        Address address = cart.getAddress();
        Branch branch = cart.getBranch();

        if (address != null && branch != null &&
                address.getLatitude() != null && address.getLongitude() != null &&
                branch.getLatitude() != null && branch.getLongitude() != null) {
            distance = DistanceCalculator.calculateDistance(
                    address.getLatitude(), address.getLongitude(),
                    branch.getLatitude(), branch.getLongitude()
            );
        }
        return calculateShippingFee(cart, distance);
    }

    @Transactional
    @Override
    public List<CartItemDTO> getCartItems(String cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));
        if (cart.getCartItems() == null) return new ArrayList<>();
        return cart.getCartItems().stream()
                .map(item -> CartItemDTO.builder()
                        .cartItemId(item.getCartItemId())
                        .productId(item.getProduct().getProductId())
                        .productSizeId(item.getProductSize() != null ? item.getProductSize().getProductSizeId() : null)
                        .productSizeName(item.getProductSize() != null ? item.getProductSize().getSizeName() : "PHÊ")
                        .quantity(item.getQuantity())
                        .amount(item.getAmount())
                        .note(item.getNote())
                        .selectedToppings(item.getToppings() != null ?
                                item.getToppings().stream().map(productMapper::toProductResponseDTO).toList() :
                                new ArrayList<>())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void updateCartAddress(String cartId, String addressId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        if (!address.getCustomer().getCustomerId().equals(cart.getCustomer().getCustomerId())) {
            throw new RuntimeException("Address does not belong to this customer");
        }

        cart.setAddress(address);

        try {
            Optional<Branch> nearestBranch = branchService.findNearestBranch(address, branchService.getAllBranches());
            cart.setBranch(nearestBranch.orElse(null));
        } catch (IllegalStateException e) {
            throw new RuntimeException("No valid branch found for the address", e);
        }

        log.info("Updated address {} for cart {}", addressId, cartId);
        cartRepository.save(cart); 
    }

    @Override
    @Transactional
    public void updateCartBranch(String cartId, String branchCode) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId));
        Branch branch = branchRepository.findById(branchCode)
                .orElseThrow(() -> new RuntimeException("Branch not found with code: " + branchCode));

        cart.setBranch(branch);
        log.info("Updated branch {} for cart {}", branchCode, cartId);
        cartRepository.save(cart); 
    }

    @Override
    public CartResponseDTO getCartByCartId(String cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng với ID: " + cartId));

        return buildCartResponseDTO(cart);
    }

    private CartResponseDTO buildCartResponseDTO(Cart cart) {
        double totalAmount = calculateCartTotalFromItems(cart);

        reapplyAllPromotions(cart); 
        cartRepository.save(cart); 

        double distance = 0.0;
        if (cart.getAddress() != null && cart.getBranch() != null &&
                cart.getAddress().getLatitude() != null && cart.getAddress().getLongitude() != null &&
                cart.getBranch().getLatitude() != null && cart.getBranch().getLongitude() != null) {
            distance = DistanceCalculator.calculateDistance(
                    cart.getAddress().getLatitude(), cart.getAddress().getLongitude(),
                    cart.getBranch().getLatitude(), cart.getBranch().getLongitude()
            );
        }

        double shippingFee = calculateShippingFee(cart, distance); 
        // Đã fix: bắt null cho phần tính discount
        double discount = (cart.getPromotionCarts() != null) ? 
                cart.getPromotionCarts().stream()
                        .mapToDouble(PromotionCart::getDiscountAmount)
                        .sum() : 0.0;
        double finalAmount = totalAmount + shippingFee - discount;

        AddressDTO addressDTO = cart.getAddress() != null ? AddressDTO.builder()
                .addressId(cart.getAddress().getAddressId())
                .city(cart.getAddress().getCity())
                .district(cart.getAddress().getDistrict())
                .ward(cart.getAddress().getWard())
                .recipientName(cart.getAddress().getRecipientName())
                .phone(cart.getAddress().getPhone())
                .detailedAddress(cart.getAddress().getDetailedAddress())
                .latitude(cart.getAddress().getLatitude())
                .longitude(cart.getAddress().getLongitude())
                .isDefault(cart.getAddress().getIsDefault())
                .build() : null;

        BranchResponseDTO branchDTO = cart.getBranch() != null ? BranchResponseDTO.builder()
                .branchCode(cart.getBranch().getBranchCode())
                .branchName(cart.getBranch().getBranchName())
                .latitude(cart.getBranch().getLatitude())
                .longitude(cart.getBranch().getLongitude())
                .city(cart.getBranch().getCity())
                .district(cart.getBranch().getDistrict())
                .address(cart.getBranch().getAddress())
                .status(cart.getBranch().getStatus())
                .build() : null;

        log.info("Fetching cart: {}. Distance: {} km. Total: {}, Shipping: {}, Discount: {}, Final: {}",
                cart.getCartId(), String.format("%.2f", distance), totalAmount, shippingFee, discount, finalAmount);

        return CartResponseDTO.builder()
                .cartId(cart.getCartId())
                .customerId(cart.getCustomer().getCustomerId())
                .addressId(cart.getAddress() != null ? cart.getAddress().getAddressId() : null)
                .address(addressDTO)
                .branchCode(cart.getBranch() != null ? cart.getBranch().getBranchCode() : null)
                .branch(branchDTO)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .cartItems(cart.getCartItems() != null ? cart.getCartItems().stream()
                        .map(item -> CartItemDTO.builder()
                                .cartItemId(item.getCartItemId())
                                .productId(item.getProduct() != null ? item.getProduct().getProductId() : "UNKNOWN")
                                .productSizeId(item.getProductSize() != null ? item.getProductSize().getProductSizeId() : null)
                                .productSizeName(item.getProductSize() != null ? item.getProductSize().getSizeName() : "PHÊ")
                                .quantity(item.getQuantity())
                                .amount(item.getAmount())
                                .note(item.getNote())
                                .selectedToppings(item.getToppings() != null ?
                                        item.getToppings().stream().map(productMapper::toProductResponseDTO).toList() :
                                        new ArrayList<>())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>())
                .promotionCarts(cart.getPromotionCarts() != null ? cart.getPromotionCarts().stream()
                        .map(pc -> {
                            if (pc.getPromotion() == null) return null;
                            return PromotionResponseDTO.builder()
                                .promotionId(pc.getPromotion().getPromotionId())
                                .promotionCode(pc.getPromotion().getPromotionCode())
                                .name(pc.getPromotion().getName())
                                .description(pc.getPromotion().getDescription())
                                .discountType(pc.getPromotion().getDiscountType())
                                .discountValue(pc.getPromotion().getDiscountValue())
                                .minimumOrderAmount(pc.getPromotion().getMinimumOrderAmount())
                                .maxDiscountAmount(pc.getPromotion().getMaxDiscountAmount())
                                .discountAmount(pc.getDiscountAmount())
                                .startDate(pc.getPromotion().getStartDate())
                                .endDate(pc.getPromotion().getEndDate())
                                .status(pc.getPromotion().getStatus())
                                .build();
                        })
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .distance(distance)
                .totalAmount(totalAmount)
                .shippingFee(shippingFee)
                .finalAmount(finalAmount)
                .build();
    }
}