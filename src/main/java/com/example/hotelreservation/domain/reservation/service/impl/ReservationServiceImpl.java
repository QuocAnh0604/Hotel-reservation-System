package com.example.hotelreservation.domain.reservation.service.impl;

import com.example.hotelreservation.domain.reservation.service.*;
import com.example.hotelreservation.domain.reservation.repository.*;
import com.example.hotelreservation.domain.reservation.entity.*;
import com.example.hotelreservation.domain.reservation.dto.*;
import com.example.hotelreservation.domain.reservation.client.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;

import java.time.*;
import java.util.*;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservations;
    private final RoomTypeInventoryRepository inventory;
    private final GuestClient guestClient;
    private final HotelClient hotelClient;
    private final RateClient rateClient;

    @Transactional
    public ReservationResponse create(ReservationRequest r) {
        validate(r);
        guestClient.verify(r.getGuestId());
        hotelClient.verify(r.getHotelId(), r.getRoomTypeId());
        BigDecimal amountPerRoom = rateClient.quote(r.getHotelId(), r.getStartDate(), r.getEndDate());
        for (LocalDate date = r.getStartDate(); date.isBefore(r.getEndDate()); date = date.plusDays(1)) {
            for (int room = 0; room < r.getRoomCount(); room++) {
                if (inventory.reserveNight(r.getHotelId(), r.getRoomTypeId(), date) == 0)
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "No rooms available");
            }
        }
        BigDecimal amount = amountPerRoom.multiply(BigDecimal.valueOf(r.getRoomCount()));
        Reservation x = Reservation.builder().hotelId(r.getHotelId()).roomTypeId(r.getRoomTypeId()).roomCount(r.getRoomCount()).startDate(r.getStartDate()).endDate(r.getEndDate()).guestId(r.getGuestId()).totalAmount(amount).status(ReservationStatus.PENDING).build();
        return ReservationResponse.from(reservations.save(x));
    }

    public ReservationResponse get(Long id) {
        return reservations.findById(id).map(ReservationResponse::from).orElseThrow(this::notFound);
    }

    public List<ReservationResponse> byGuest(Long id) {
        return reservations.findByGuestIdOrderByStartDateDesc(id).stream().map(ReservationResponse::from).toList();
    }

    @Transactional
    public ReservationResponse cancel(Long id) {
        Reservation r = raw(id);
        if (r.getStatus() == ReservationStatus.CHECKED_OUT || r.getStatus() == ReservationStatus.CANCELLED)
            throw bad("Reservation cannot be cancelled");
        release(r);
        r.setStatus(ReservationStatus.CANCELLED);
        return ReservationResponse.from(reservations.save(r));
    }

    @Transactional
    public ReservationResponse status(Long id, ReservationStatus s) {
        Reservation r = raw(id);
        if (s == null || r.getStatus() == ReservationStatus.CANCELLED || r.getStatus() == ReservationStatus.CHECKED_OUT)
            throw bad("Invalid status transition");

        if (s == ReservationStatus.CANCELLED) {
            release(r);
        } else if (!isAllowedTransition(r.getStatus(), s)) {
            throw bad("Invalid status transition");
        }

        r.setStatus(s);
        return ReservationResponse.from(reservations.save(r));
    }

    public AvailabilityResponse availability(Long h, String type, LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) throw bad("Invalid date range");
        List<RoomTypeInventory> rows = inventory.findByIdHotelIdAndIdRoomTypeIdAndIdDateBetweenOrderByIdDate(h, type, from, to);
        return AvailabilityResponse.builder().hotelId(h).roomTypeId(type).dailyAvailability(rows.stream().map(x -> new AvailabilityResponse.DailyAvailability(x.getId().getDate(), x.available())).toList()).build();
    }

    private void release(Reservation r) {
        for (LocalDate date = r.getStartDate(); date.isBefore(r.getEndDate()); date = date.plusDays(1))
            for (int room = 0; room < r.getRoomCount(); room++)
                inventory.releaseNight(r.getHotelId(), r.getRoomTypeId(), date);
    }

    private Reservation raw(Long id) {
        return reservations.findById(id).orElseThrow(this::notFound);
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found");
    }

    private ResponseStatusException bad(String m) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
    }

    private boolean isAllowedTransition(ReservationStatus current, ReservationStatus next) {
        return current == next
                || (current == ReservationStatus.PENDING && next == ReservationStatus.CONFIRMED)
                || (current == ReservationStatus.CONFIRMED && next == ReservationStatus.CHECKED_IN)
                || (current == ReservationStatus.CHECKED_IN && next == ReservationStatus.CHECKED_OUT);
    }

    private void validate(ReservationRequest r) {
        if (r == null || r.getRoomCount() == null || r.getRoomCount() < 1 || r.getStartDate() == null || r.getEndDate() == null || r.getStartDate().isBefore(LocalDate.now()) || !r.getStartDate().isBefore(r.getEndDate()))
            throw bad("Invalid reservation dates");
    }
}
