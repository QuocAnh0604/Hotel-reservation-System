package com.example.hotelreservation.domain.reservation.dto;

import lombok.*;
import com.example.hotelreservation.domain.reservation.entity.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Long reservationId, hotelId, guestId;
    private String roomTypeId;
    private LocalDate startDate, endDate;
    private ReservationStatus status;
    private BigDecimal totalAmount;

    public static ReservationResponse from(Reservation r) {
        return new ReservationResponse(r.getId(), r.getHotelId(), r.getGuestId(), r.getRoomTypeId(), r.getStartDate(), r.getEndDate(), r.getStatus(), r.getTotalAmount());
    }
}
