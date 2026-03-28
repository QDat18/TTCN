package com.example.be_phela.controller;

import com.example.be_phela.dto.request.CartItemDTO;
import com.example.be_phela.dto.response.CartResponseDTO;
import com.example.be_phela.service.CartService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/cart")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    @PostMapping("/create/{customerId}")
    public ResponseEntity<CartResponseDTO> createCartForCustomer(@PathVariable String customerId) {
        cartService.createCartForCustomer(customerId);
        CartResponseDTO cartResponse = cartService.getCartByCustomerId(customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(cartResponse);
    }

    @GetMapping("/getCustomer/{customerId}")
    public ResponseEntity<CartResponseDTO> getCartByCustomerId(@PathVariable String customerId) {
        return ResponseEntity.ok(cartService.getCartByCustomerId(customerId));
    }

    @DeleteMapping("/{cartId}/clear")
    public ResponseEntity<Void> clearCartItems(@PathVariable String cartId) {
        cartService.clearCartItems(cartId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{cartId}/items")
    public ResponseEntity<CartResponseDTO> addOrUpdateCartItem(
            @PathVariable String cartId,
            @Valid @RequestBody CartItemDTO cartItemDTO) {
        cartService.addOrUpdateCartItem(cartId, cartItemDTO);
        return ResponseEntity.ok(cartService.getCartByCartId(cartId));
    }

    @DeleteMapping("/{cartId}/items/{cartItemId}")
    public ResponseEntity<Void> removeCartItem(
            @PathVariable String cartId,
            @PathVariable String cartItemId) {
        cartService.removeCartItem(cartId, cartItemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{cartId}/total")
    public ResponseEntity<CartResponseDTO> calculateCartTotal(@PathVariable String cartId) {
        return ResponseEntity.ok(cartService.getCartByCartId(cartId));
    }

    @GetMapping("/{cartId}/shipping-fee")
    public ResponseEntity<CartResponseDTO> calculateShippingFee(@PathVariable String cartId) {
        return ResponseEntity.ok(cartService.getCartByCartId(cartId));
    }

    @PostMapping("/{cartId}/apply-promotion")
    public ResponseEntity<Map<String, Object>> applyPromotionToCart(
            @PathVariable String cartId,
            @RequestBody Map<String, String> request) {
        String promotionCode = request.get("promotionCode");
        Map<String, Object> response = new HashMap<>();
        try {
            cartService.applyPromotionToCart(cartId, promotionCode);
            response.put("success", true);
            response.put("data", cartService.getCartByCartId(cartId));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/{cartId}/promotions/{promotionId}")
    public ResponseEntity<CartResponseDTO> removePromotionFromCart(
            @PathVariable String cartId,
            @PathVariable String promotionId) {
        cartService.removePromotionFromCart(cartId, promotionId);
        return ResponseEntity.ok(cartService.getCartByCartId(cartId));
    }

    @PatchMapping("/{cartId}/update-address")
    public ResponseEntity<CartResponseDTO> updateCartAddress(
            @PathVariable String cartId,
            @RequestParam String addressId) {
        cartService.updateCartAddress(cartId, addressId);
        return ResponseEntity.ok(cartService.getCartByCartId(cartId));
    }

    @PatchMapping("/{cartId}/update-branch")
    public ResponseEntity<CartResponseDTO> updateCartBranch(
            @PathVariable String cartId,
            @RequestParam String branchCode) {
        cartService.updateCartBranch(cartId, branchCode);
        return ResponseEntity.ok(cartService.getCartByCartId(cartId));
    }

    @GetMapping("/{cartId}/item-count")
    public ResponseEntity<Integer> countItemsInCart(@PathVariable String cartId) {
        return ResponseEntity.ok(cartService.countItemsInCart(cartId));
    }

    @GetMapping("/{cartId}/items")
    public ResponseEntity<List<CartItemDTO>> getCartItems(@PathVariable String cartId) {
        return ResponseEntity.ok(cartService.getCartItems(cartId));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        // Log the full stack trace for debugging
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(CartController.class);
        logger.error("Error in CartController: ", ex);

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "An unexpected error occurred: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}