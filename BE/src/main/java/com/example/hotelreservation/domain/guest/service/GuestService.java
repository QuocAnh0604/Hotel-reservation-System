package com.example.hotelreservation.domain.guest.service;

import com.example.hotelreservation.domain.guest.dto.*;

import java.util.List;

public interface GuestService {
    GuestResponse create(GuestRequest request);

    GuestResponse get(Long id);

    List<GuestResponse> find(String email);

    GuestResponse update(Long id, GuestRequest request);

    void delete(Long id);
}
