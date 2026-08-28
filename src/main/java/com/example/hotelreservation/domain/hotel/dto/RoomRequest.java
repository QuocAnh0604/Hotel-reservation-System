package com.example.hotelreservation.domain.hotel.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    @NotBlank @Size(max = 100) private String roomTypeId;
    private Integer floor;
    @NotBlank @Size(max = 20) private String number;
    @NotBlank @Size(max = 100) private String name;
    private Boolean isAvailable;
}
