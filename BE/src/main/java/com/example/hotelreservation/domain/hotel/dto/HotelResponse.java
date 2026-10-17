package com.example.hotelreservation.domain.hotel.dto;

import com.example.hotelreservation.domain.hotel.entity.Hotel;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelResponse {
    private Long hotelId;
    private String name;
    private String address;
    private String location;

    public static HotelResponse from(Hotel h) {
        return new HotelResponse(h.getId(), h.getName(), h.getAddress(), h.getLocation());
    }
}
