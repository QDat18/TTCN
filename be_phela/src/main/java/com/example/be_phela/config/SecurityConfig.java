package com.example.be_phela.config;

import com.example.be_phela.filter.JwtAuthenticationFilter;
import com.example.be_phela.security.OAuth2SuccessHandler;
import com.example.be_phela.service.AdminUserDetailsService;
import com.example.be_phela.service.CustomerUserDetailsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SecurityConfig {
    final AdminUserDetailsService adminUserDetailsService;
    final CustomerUserDetailsService customerUserDetailsService;
    final OAuth2SuccessHandler oAuth2SuccessHandler;
    final BCryptPasswordEncoder passwordEncoder;

    @Value("${jwt.signer-key}")
    private String signerKey;

    @Bean
    @Primary
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider adminProvider = new DaoAuthenticationProvider();
        adminProvider.setUserDetailsService(adminUserDetailsService);
        adminProvider.setPasswordEncoder(passwordEncoder);
        adminProvider.setHideUserNotFoundExceptions(false);

        DaoAuthenticationProvider customerProvider = new DaoAuthenticationProvider();
        customerProvider.setUserDetailsService(customerUserDetailsService);
        customerProvider.setPasswordEncoder(passwordEncoder);
        customerProvider.setHideUserNotFoundExceptions(false);

        return new ProviderManager(adminProvider, customerProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable()) // Đảm bảo CSRF đã tắt
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // ĐÃ FIX: Comment dòng này lại để không ghi đè mất Provider của OAuth2
                // .authenticationManager(authenticationManager())
                .authorizeHttpRequests(registry -> {
                    // Allow CORS preflight requests (OPTIONS method)
                    registry.requestMatchers(request -> "OPTIONS".equals(request.getMethod())).permitAll();

                    // Public endpoints - no authentication required
                    registry.requestMatchers(
                            "/healthz",
                            "/auth/admin/register",
                            "/auth/customer/register",
                            "/auth/admin/login",
                            "/auth/customer/login",
                            "/auth/forgot-password/**",
                            "/auth/admin/forgot-password/**",
                            "/verify",
                            "/api/product/**",
                            "/api/categories/**",
                            "/api/banner/**",
                            "/api/banners/**",
                            "/api/contacts/**",
                            "/api/applications/**",
                            "/api/news/**",
                            "/api/job-postings/**",
                            "/api/branch/**",
                            "/api/payment/payment-return",
                            "/api/payment/payment-cancel",
                            "/api/payment/payos-webhook",
                            "/ws/**",
                            "/login/oauth2/**",
                            "/oauth2/**",
                            "/error"
                    ).permitAll();

                    // Admin endpoints - require admin roles
                    registry.requestMatchers("/api/admin/**")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_STAFF");

                    // Customer endpoints - require customer role
                    registry.requestMatchers("/api/customer/**")
                            .hasAnyAuthority("ROLE_CUSTOMER", "ROLE_ADMIN");

                    // All other requests require authentication
                    registry.anyRequest().authenticated();
                })
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler)
                )
                .addFilterBefore(new JwtAuthenticationFilter(signerKey), UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}