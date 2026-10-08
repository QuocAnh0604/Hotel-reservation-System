package com.example.hotelreservation.domain.hotel.controller;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.hotelreservation.domain.hotel.dto.*;
import com.example.hotelreservation.domain.hotel.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;

@RestController
@RequestMapping("/hotels/{hotelId}/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService service;

    @PostMapping
    public RoomResponse create(@PathVariable Long hotelId, @Valid @RequestBody RoomRequest r) {
        return service.create(hotelId, r);
    }

    @GetMapping
    public Page<RoomResponse> list(@PathVariable Long hotelId, @RequestParam(required = false) String roomTypeId, @RequestParam(required = false) Integer floor, @RequestParam(required = false) Boolean isAvailable, Pageable p) {
        return service.list(hotelId, roomTypeId, floor, isAvailable, p);
    }

    @GetMapping("/{roomId}")
    public RoomResponse get(@PathVariable Long hotelId, @PathVariable Long roomId) {
        return service.get(hotelId, roomId);
    }

    @PutMapping("/{roomId}")
    public RoomResponse update(@PathVariable Long hotelId, @PathVariable Long roomId, @Valid @RequestBody RoomRequest r) {
        return service.update(hotelId, roomId, r);
    }

    @PatchMapping("/{roomId}/availability")
    public RoomResponse availability(@PathVariable Long hotelId, @PathVariable Long roomId, @Valid @RequestBody AvailabilityRequest r) {
        return service.availability(hotelId, roomId, r.getIsAvailable());
    }

    @DeleteMapping("/{roomId}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long hotelId, @PathVariable Long roomId) {
        service.delete(hotelId, roomId);
    }
}
