package com.example.be_phela.service;

import com.example.be_phela.dto.request.AuthenticationRequest;
import com.example.be_phela.dto.request.AdminCreateDTO;
import com.example.be_phela.dto.request.CustomerCreateDTO;
import com.example.be_phela.dto.response.AuthenticationResponse;
import com.example.be_phela.model.Admin;
import com.example.be_phela.model.Customer;
import com.example.be_phela.model.PasswordResetToken;
import com.example.be_phela.model.VerificationToken;
import com.example.be_phela.model.enums.Roles;
import com.example.be_phela.repository.PasswordResetTokenRepository;
import com.example.be_phela.repository.VerificationTokenRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    final AdminService adminService;
    final CustomerService customerService;
    @org.springframework.context.annotation.Lazy
    final AuthenticationManager authenticationManager;
    final VerificationTokenRepository verificationTokenRepository;
    final EmailService emailService;
    final PasswordResetTokenRepository passwordResetTokenRepository;
    final PasswordEncoder passwordEncoder;

    @Value("${jwt.signer-key}")
    @NonFinal
    String signerKey;

    @Value("${jwt.expiration-hours:18}")
    @NonFinal
    long jwtExpirationHours;

    // Đăng ký admin
    @Transactional(rollbackFor = Exception.class)
    public AuthenticationResponse registerAdmin(AdminCreateDTO request, String clientIp){
        // Tạo Admin
        Admin admin = adminService.buildAdmin(request, clientIp);

        // Tạo và lưu token xác thực
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .admin(admin)
                .customer(null)
                .expiryDate(LocalDateTime.now().plusHours(24)) // Hết hạn sau 24 giờ
                .build();

        emailService.sendVerificationEmail(admin.getEmail(), verificationToken.getToken());

//        // Gửi email xác nhận
//        try {
//            emailService.sendVerificationEmail(admin.getEmail(), token);
//        } catch (MessagingException e) {
//            log.error("Failed to send verification email to {}: {}", admin.getEmail(), e.getMessage());
//            throw new MessagingException("Không thể gửi email xác nhận: " + e.getMessage(), e);
//        }

        // Nếu gửi email thành công, lưu admin và token vào database
        adminService.saveAdmin(admin);
        verificationTokenRepository.save(verificationToken);

        return buildRegistrationResponse(admin.getUsername(), admin.getRole().name());
    }

    // Đăng ký customer
    @Transactional(rollbackFor = Exception.class)
    public AuthenticationResponse registerCustomer(CustomerCreateDTO request){
        // Tạo Customer (lưu vào database)
        Customer customer = customerService.buildCustomer(request);

        // Tạo và lưu token xác thực
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .admin(null)
                .customer(customer)
                .expiryDate(LocalDateTime.now().plusHours(24)) // Hết hạn sau 24 giờ
                .build();

        emailService.sendVerificationEmail(customer.getEmail(), verificationToken.getToken());

        // Gửi email xác nhận
//        try {
//            emailService.sendVerificationEmail(customer.getEmail(), token);
//        } catch (MessagingException e) {
//            log.error("Failed to send verification email to {}: {}", customer.getEmail(), e.getMessage());
//            throw new MessagingException("Không thể gửi email xác nhận: " + e.getMessage(), e);
//        }

        customerService.saveCustomer(customer);
        verificationTokenRepository.save(verificationToken);

        return buildRegistrationResponse(customer.getUsername(), customer.getRole().name());
    }

    // Đăng nhập Admin
    public AuthenticationResponse loginAdmin(AuthenticationRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Kiểm tra role: Cho phép ADMIN, SUPER_ADMIN, STAFF đăng nhập portal quản trị
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                               a.getAuthority().equals("ROLE_SUPER_ADMIN") ||
                               a.getAuthority().equals("ROLE_STAFF"));

        if (!isAdmin) {
            log.warn("Login attempt for non-admin user on admin portal: {}", request.getUsername());
            throw new org.springframework.security.authentication.BadCredentialsException("Tài khoản này không có quyền truy cập trang quản trị");
        }

        return createResponseFromUserDetails(userDetails);
    }

    // Đăng nhập Customer
    public AuthenticationResponse loginCustomer(AuthenticationRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Kiểm tra role: Chỉ cho phép ROLE_CUSTOMER đăng nhập portal khách hàng
        boolean isCustomer = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));

        if (!isCustomer) {
            log.warn("Login attempt for non-customer user on customer portal: {}", request.getUsername());
            throw new org.springframework.security.authentication.BadCredentialsException("Tài khoản này không phải là tài khoản khách hàng");
        }

        return createResponseFromUserDetails(userDetails);
    }

    // Tạo response từ UserDetails (dùng cho mục đích xác thực chung)
    public AuthenticationResponse createResponseFromUserDetails(UserDetails userDetails) {
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(jwtExpirationHours);
        String jwtToken = generateToken(userDetails.getUsername(), extractRole(userDetails));
        String username = userDetails.getUsername();

        if (userDetails instanceof Customer customer) {
            String role = extractRoleFromEntity(customer, extractRole(userDetails));
            return new AuthenticationResponse(jwtToken, username, role, expiresAt);
        } else if (userDetails instanceof Admin admin) {
            String role = extractRoleFromEntity(admin, extractRole(userDetails));
            return new AuthenticationResponse(jwtToken, username, role, expiresAt);
        }

        throw new RuntimeException("UserDetails không hợp lệ để tạo AuthenticationResponse.");
    }

    // Hàm sinh token và build AuthenticationResponse
        private AuthenticationResponse buildRegistrationResponse(String username, String role) {
        log.info("Tạo tài khoản mới: username={}, role={} (chờ xác thực email)", username, role);
        return AuthenticationResponse.builder()
            .token(null)
            .username(username)
            .role(role)
            .expiresAt(null)
            .build();
    }

    // Sinh JWT token
    private String generateToken(String username, String role) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        Instant expiryInstant = Instant.now().plus(jwtExpirationHours, ChronoUnit.HOURS);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .issuer("/")
                .issueTime(new Date())
            .expirationTime(Date.from(expiryInstant))
                .claim("role", role)
                .build();

        JWSObject jwsObject = new JWSObject(header, new Payload(jwtClaimsSet.toJSONObject()));

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Không thể tạo token", e);
            throw new RuntimeException("Không thể tạo token", e);
        }
    }

    // Lấy role từ UserDetails (nếu cần dùng thêm)
    private String extractRole(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .orElse("UNKNOWN");
    }

    private String extractRoleFromEntity(Customer customer, String fallback) {
        return customer.getRole() != null ? customer.getRole().name() : fallback;
    }

    private String extractRoleFromEntity(Admin admin, String fallback) {
        return admin.getRole() != null ? admin.getRole().name() : fallback;
    }

    @Transactional
    public void sendPasswordResetOtp(String email){
        // Find customer by email
        Customer customer = customerService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email: " + email));

        // Generate OTP
        String otp = generateOtp();
        log.info("Generated OTP for {}: {}", email, otp);

        // Delete any existing token for this email
        passwordResetTokenRepository.deleteByEmail(email);

        // Create and save new PasswordResetToken
        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .token(otp)
                .expiryDate(LocalDateTime.now().plusMinutes(10)) // OTP expires in 10 minutes
                .build();
        passwordResetTokenRepository.save(token);

        // Send OTP email
        emailService.sendOtpEmail(email, otp);
    }

    @Transactional
    public void verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        PasswordResetToken token = passwordResetTokenRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn."));

        if (!token.getToken().equals(otp)) {
            throw new RuntimeException("Mã OTP không đúng.");
        }
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(token); // Clean up expired token
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        // Find customer by email and update password
        Customer customer = customerService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email: " + email));

        customer.setPassword(passwordEncoder.encode(newPassword));
        customerService.saveCustomer(customer); // This save will trigger the update

        // Delete the token after successful password reset
        passwordResetTokenRepository.delete(token);
    }

    // Phương thức gửi OTP cho Admin
    @Transactional
    public void sendPasswordResetOtpAdmin(String email){
        Admin admin = adminService.findByEmail(email) // Sử dụng adminService
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản quản trị viên với email: " + email));

        String otp = generateOtp();
        log.info("Generated OTP for admin {}: {}", email, otp);

        passwordResetTokenRepository.deleteByEmail(email); // Delete any existing token for this email
        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .token(otp)
                .expiryDate(LocalDateTime.now().plusMinutes(10)) // OTP expires in 10 minutes
                .build();
        passwordResetTokenRepository.save(token);

        emailService.sendOtpEmail(email, otp);
    }

    // Phương thức xác nhận OTP và đặt lại mật khẩu cho Admin
    @Transactional
    public void verifyOtpAndResetPasswordAdmin(String email, String otp, String newPassword) {
        PasswordResetToken token = passwordResetTokenRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn."));

        if (!token.getToken().equals(otp)) {
            throw new RuntimeException("Mã OTP không đúng.");
        }
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(token);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        Admin admin = adminService.findByEmail(email) // Sử dụng adminService
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản quản trị viên với email: " + email));

        admin.setPassword(passwordEncoder.encode(newPassword));
        adminService.saveAdmin(admin); // Sử dụng saveAdmin từ adminService

        passwordResetTokenRepository.delete(token);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // Generates a 6-digit OTP
        return String.valueOf(otp);
    }
}