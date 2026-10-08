package com.example.hotelreservation.domain.hotel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityRequest {
    @NotNull
    private Boolean isAvailable;
}
