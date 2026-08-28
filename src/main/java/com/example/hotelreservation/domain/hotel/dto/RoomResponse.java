package com.example.hotelreservation.domain.hotel.dto;

import com.example.hotelreservation.domain.hotel.entity.Room;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long roomId; private String roomTypeId; private Integer floor; private String number;
    private Long hotelId; private String name; private boolean isAvailable;
    public static RoomResponse from(Room r) { return new RoomResponse(r.getId(), r.getRoomTypeId(), r.getFloor(), r.getNumber(), r.getHotelId(), r.getName(), r.isAvailable()); }
}
