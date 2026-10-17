package com.example.hotelreservation.domain.rate.controller;

import com.example.hotelreservation.domain.rate.dto.RateQuoteResponse;
import com.example.hotelreservation.domain.rate.service.RoomTypeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/internal/hotels/{hotelId}/rates")
@RequiredArgsConstructor
public class RateQuoteController {
    private final RoomTypeRateService service;

    @GetMapping("/quote")
    public RateQuoteResponse quote(@PathVariable Long hotelId, @RequestParam LocalDate checkin, @RequestParam LocalDate checkout) {
        return service.quote(hotelId, checkin, checkout);
    }
}
