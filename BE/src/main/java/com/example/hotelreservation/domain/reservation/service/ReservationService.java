package com.example.hotelreservation.domain.reservation.service;

import com.example.hotelreservation.domain.reservation.dto.*;
import com.example.hotelreservation.domain.reservation.entity.ReservationStatus;
import com.example.hotelreservation.domain.auth.security.AuthenticatedUser;

import java.time.LocalDate;
import java.util.List;

public interface ReservationService {
    ReservationResponse create(ReservationRequest r);

    ReservationResponse get(Long id, AuthenticatedUser user);

    List<ReservationResponse> byGuest(Long guestId);

    ReservationResponse cancel(Long id, AuthenticatedUser user);

    ReservationResponse status(Long id, ReservationStatus status);

    AvailabilityResponse availability(Long hotelId, String roomTypeId, LocalDate from, LocalDate to);
}
