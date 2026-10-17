package com.example.hotelreservation.domain.reservation.controller;

import com.example.hotelreservation.domain.reservation.dto.*;
import com.example.hotelreservation.domain.reservation.service.ReservationService;
import com.example.hotelreservation.domain.auth.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService service;

    @PostMapping
    public ReservationResponse create(@Valid @RequestBody ReservationRequest r,
                                      @AuthenticationPrincipal AuthenticatedUser user) {
        r.setGuestId(user.userId());
        return service.create(r);
    }

    @GetMapping("/{id}")
    public ReservationResponse get(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser user) {
        return service.get(id, user);
    }

    @GetMapping
    public List<ReservationResponse> byGuest(@RequestParam(required = false) Long guestId,
                                             @AuthenticationPrincipal AuthenticatedUser user) {
        return service.byGuest(user.role().name().equals("ADMIN") && guestId != null ? guestId : user.userId());
    }

    @PatchMapping("/{id}/cancel")
    public ReservationResponse cancel(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser user) {
        return service.cancel(id, user);
    }

    @PatchMapping("/{id}/status")
    public ReservationResponse status(@PathVariable Long id, @Valid @RequestBody StatusRequest r) {
        return service.status(id, r.getStatus());
    }
}
