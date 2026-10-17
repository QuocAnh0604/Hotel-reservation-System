package com.example.hotelreservation.domain.hotel.service;

import com.example.hotelreservation.domain.hotel.dto.*;
import org.springframework.data.domain.*;

public interface RoomService {
    RoomResponse create(Long hotelId, RoomRequest request);

    RoomResponse get(Long hotelId, Long roomId);

    Page<RoomResponse> list(Long hotelId, String roomTypeId, Integer floor, Boolean available, Pageable pageable);

    RoomResponse update(Long hotelId, Long roomId, RoomRequest request);

    RoomResponse availability(Long hotelId, Long roomId, boolean available);

    void delete(Long hotelId, Long roomId);
}
