package com.example.hotelreservation.domain.rate.controller;

import com.example.hotelreservation.domain.rate.dto.*;
import com.example.hotelreservation.domain.rate.service.RoomTypeRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/hotels/{hotelId}/rates")
@RequiredArgsConstructor
public class RoomTypeRateController {
    private final RoomTypeRateService service;

    @PostMapping
    public RoomTypeRateResponse create(@PathVariable Long hotelId, @Valid @RequestBody RoomTypeRateRequest r) {
        return service.create(hotelId, r);
    }

    @GetMapping
    public List<RoomTypeRateResponse> find(@PathVariable Long hotelId, @RequestParam LocalDate from, @RequestParam LocalDate to) {
        return service.find(hotelId, from, to);
    }

    @GetMapping("/{date}")
    public RoomTypeRateResponse get(@PathVariable Long hotelId, @PathVariable LocalDate date) {
        return service.get(hotelId, date);
    }

    @PutMapping("/{date}")
    public RoomTypeRateResponse update(@PathVariable Long hotelId, @PathVariable LocalDate date, @Valid @RequestBody RoomTypeRateRequest r) {
        return service.update(hotelId, date, r);
    }

    @PostMapping("/bulk")
    public List<RoomTypeRateResponse> bulk(@PathVariable Long hotelId, @Valid @RequestBody BulkRateRequest r) {
        return service.bulk(hotelId, r);
    }

    @DeleteMapping("/{date}")
    public void delete(@PathVariable Long hotelId, @PathVariable LocalDate date) {
        service.delete(hotelId, date);
    }
}
