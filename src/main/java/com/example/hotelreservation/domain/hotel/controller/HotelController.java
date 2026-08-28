package com.example.hotelreservation.domain.hotel.controller;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.hotelreservation.domain.hotel.dto.*;
import com.example.hotelreservation.domain.hotel.service.HotelService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelController {
    private final HotelService service;
    @PostMapping public HotelResponse create(@Valid @RequestBody HotelRequest r){return service.create(r);}
    @GetMapping("/{hotelId}") public HotelResponse get(@PathVariable Long hotelId){return service.get(hotelId);}
    @GetMapping public Page<HotelResponse> list(@RequestParam(required=false) String location, Pageable pageable){return service.list(location,pageable);}
    @PutMapping("/{hotelId}") public HotelResponse update(@PathVariable Long hotelId,@Valid @RequestBody HotelRequest r){return service.update(hotelId,r);}
    @DeleteMapping("/{hotelId}") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT) public void delete(@PathVariable Long hotelId){service.delete(hotelId);}
}
