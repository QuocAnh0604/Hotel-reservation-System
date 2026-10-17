package com.example.hotelreservation.domain.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class LoginRequest {
    @NotBlank @Email private String email;
    @NotBlank private String password;
}
