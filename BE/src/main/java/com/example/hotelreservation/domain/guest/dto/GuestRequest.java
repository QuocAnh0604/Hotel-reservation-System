package com.example.hotelreservation.domain.guest.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestRequest {
    @NotBlank
    @Size(max = 100)
    private String firstName;
    @NotBlank
    @Size(max = 100)
    private String lastName;
    @NotBlank
    @Email
    @Size(max = 255)
    private String email;
}
