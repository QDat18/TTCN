package com.example.be_phela.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerUpdateDTO {

    // Password có thể để trống khi update (không bắt buộc thay đổi)
    @Size(min = 8, max = 128, message = "Mật khẩu phải có ít nhất 8 ký tự")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,128}$",
            message = "Mật khẩu phải chứa ít nhất một chữ hoa, chữ thường, số và ký tự đặc biệt")
    private String password;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Giới tính không được để trống")
    private String gender;

    private String fullname;
    private String phone;

    // Validation cho latitude và longitude
    @DecimalMin(value = "-90.0", message = "Latitude phải >= -90")
    @DecimalMax(value = "90.0", message = "Latitude phải <= 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude phải >= -180")
    @DecimalMax(value = "180.0", message = "Longitude phải <= 180")
    private Double longitude;
}