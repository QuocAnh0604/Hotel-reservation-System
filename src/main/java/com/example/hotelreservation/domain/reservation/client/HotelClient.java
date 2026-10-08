package com.example.hotelreservation.domain.reservation.client;

public interface HotelClient {
    void verify(Long hotelId, String roomTypeId);
}
