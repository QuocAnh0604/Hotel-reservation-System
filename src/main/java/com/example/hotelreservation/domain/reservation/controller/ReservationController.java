package com.example.hotelreservation.domain.reservation.controller;

import com.example.hotelreservation.domain.reservation.dto.*;
import com.example.hotelreservation.domain.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService service;

    @PostMapping
    public ReservationResponse create(@Valid @RequestBody ReservationRequest r) {
        return service.create(r);
    }

    @GetMapping("/{id}")
    public ReservationResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public List<ReservationResponse> byGuest(@RequestParam Long guestId) {
        return service.byGuest(guestId);
    }

    @PatchMapping("/{id}/cancel")
    public ReservationResponse cancel(@PathVariable Long id) {
        return service.cancel(id);
    }

    @PatchMapping("/{id}/status")
    public ReservationResponse status(@PathVariable Long id, @Valid @RequestBody StatusRequest r) {
        return service.status(id, r.getStatus());
    }
}
