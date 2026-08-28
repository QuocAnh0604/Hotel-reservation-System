package com.example.hotelreservation.domain.rate.dto;
import com.example.hotelreservation.domain.rate.entity.RoomTypeRate;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomTypeRateResponse { private Long hotelId; private LocalDate date; private BigDecimal rate; public static RoomTypeRateResponse from(RoomTypeRate r){return new RoomTypeRateResponse(r.getId().getHotelId(),r.getId().getDate(),r.getRate());} }
