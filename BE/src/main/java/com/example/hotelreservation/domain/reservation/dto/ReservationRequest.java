package com.example.hotelreservation.domain.reservation.dto;

import lombok.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {
    @NotNull
    private Long hotelId;
    @NotBlank
    private String roomTypeId;
    @NotNull
    @Min(1)
    private Integer roomCount = 1;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
    @NotNull
    private Long guestId;
}
