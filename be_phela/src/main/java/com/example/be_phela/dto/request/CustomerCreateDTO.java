package com.example.be_phela.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerCreateDTO {
    @NotNull(message = "Tên khách hàng không được để trống")
    @NotBlank(message = "Tên khách hàng không được chứa toàn khoảng trắng")
    @Size(min = 6, max = 50, message = "Tên người dùng phải từ 6 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 128, message = "Mật khẩu phải có ít nhất 8 ký tự")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,128}$",
            message = "Mật khẩu phải chứa ít nhất một chữ hoa, chữ thường, số và ký tự đặc biệt")
    private String password;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Giới tính không được để trống")
    private String gender;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullname;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    private Double latitude;

    private Double longitude;
}
