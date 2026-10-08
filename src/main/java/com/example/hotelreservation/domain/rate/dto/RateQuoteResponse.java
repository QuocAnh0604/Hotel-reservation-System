package com.example.hotelreservation.domain.rate.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateQuoteResponse {
    private Long hotelId;
    private LocalDate checkin;
    private LocalDate checkout;
    private long nights;
    private BigDecimal totalRate;
    private List<RoomTypeRateResponse> dailyBreakdown;
}
