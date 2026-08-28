package com.example.hotelreservation.domain.guest.controller;

import com.example.hotelreservation.domain.guest.dto.*;
import com.example.hotelreservation.domain.guest.service.GuestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/guests")
@RequiredArgsConstructor
public class GuestController {
    private final GuestService service;
    @PostMapping public GuestResponse create(@Valid @RequestBody GuestRequest r){return service.create(r);}
    @GetMapping("/{guestId}") public GuestResponse get(@PathVariable Long guestId){return service.get(guestId);}
    @GetMapping public List<GuestResponse> find(@RequestParam(required=false) String email){return service.find(email);}
    @PutMapping("/{guestId}") public GuestResponse update(@PathVariable Long guestId,@Valid @RequestBody GuestRequest r){return service.update(guestId,r);}
    @DeleteMapping("/{guestId}") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT) public void delete(@PathVariable Long guestId){service.delete(guestId);}
}
