package com.example.hotelreservation.domain.reservation.service;

import com.example.hotelreservation.domain.reservation.dto.*;
import com.example.hotelreservation.domain.reservation.entity.ReservationStatus;

import java.time.LocalDate;
import java.util.List;

public interface ReservationService {
    ReservationResponse create(ReservationRequest r);

    ReservationResponse get(Long id);

    List<ReservationResponse> byGuest(Long guestId);

    ReservationResponse cancel(Long id);

    ReservationResponse status(Long id, ReservationStatus status);

    AvailabilityResponse availability(Long hotelId, String roomTypeId, LocalDate from, LocalDate to);
}
