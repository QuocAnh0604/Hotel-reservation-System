package com.example.hotelreservation.domain.reservation.dto;
import com.example.hotelreservation.domain.reservation.entity.ReservationStatus; import jakarta.validation.constraints.NotNull; import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor public class StatusRequest { @NotNull private ReservationStatus status; }
