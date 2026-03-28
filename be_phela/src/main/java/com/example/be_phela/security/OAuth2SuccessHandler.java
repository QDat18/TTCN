package com.example.be_phela.security;

import com.example.be_phela.dto.response.AuthenticationResponse;
import com.example.be_phela.model.Customer;
import com.example.be_phela.model.enums.Roles;
import com.example.be_phela.model.enums.Status;
import com.example.be_phela.repository.CustomerRepository;
import com.example.be_phela.service.AuthenticationService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    // ĐÃ FIX: Sử dụng @Lazy và @Autowired thay vì dùng 'final' để phá vỡ Circular Dependency
    @Autowired
    @Lazy
    private AuthenticationService authenticationService;

    @Value("${frontend.customer-url:http://localhost:3001}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        log.info("Google Login Success: email={}, name={}", email, name);

        Customer customer = customerRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Creating new customer for Google user: {}", email);
                    Customer newCustomer = Customer.builder()
                            .email(email)
                            .fullname(name)
                            .username(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5))
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .role(Roles.CUSTOMER)
                            .status(Status.ACTIVE)
                            .customerCode("CUS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .gender("Khác")
                            .build();
                    return customerRepository.save(newCustomer);
                });

        AuthenticationResponse authResponse = authenticationService.createResponseFromUserDetails(customer);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", authResponse.getToken())
                .queryParam("username", authResponse.getUsername())
                .queryParam("role", authResponse.getRole())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}