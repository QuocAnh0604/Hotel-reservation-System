package com.example.hotelreservation.domain.guest.dto;

import lombok.*;
import com.example.hotelreservation.domain.guest.entity.Guest;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestResponse {
    private Long guestId; private String firstName; private String lastName; private String email;
    public static GuestResponse from(Guest g) { return new GuestResponse(g.getId(), g.getFirstName(), g.getLastName(), g.getEmail()); }
}
