package com.example.hotelreservation.domain.rate.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomTypeRateRequest { @NotNull private LocalDate date; @NotNull @DecimalMin("0.01") private BigDecimal rate; }
