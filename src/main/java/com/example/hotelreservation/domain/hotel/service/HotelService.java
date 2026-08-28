package com.example.hotelreservation.domain.hotel.service;

import com.example.hotelreservation.domain.hotel.dto.*;
import org.springframework.data.domain.*;
public interface HotelService {
    HotelResponse create(HotelRequest request);
    HotelResponse get(Long id);
    Page<HotelResponse> list(String location, Pageable pageable);
    HotelResponse update(Long id, HotelRequest request);
    void delete(Long id);
}
