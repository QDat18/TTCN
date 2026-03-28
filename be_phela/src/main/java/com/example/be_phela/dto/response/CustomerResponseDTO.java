package com.example.be_phela.dto.response;

import com.example.be_phela.model.enums.Roles;
import com.example.be_phela.model.enums.Status;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerResponseDTO {
    String customerId;
    String customerCode;
    String username;
    String gender;
    String email;
    Double latitude;
    Double longitude;
    Roles role;
    Status status;
    Double pointUse;
    long orderCancelCount;
    String fullname;
    String phone;
}
