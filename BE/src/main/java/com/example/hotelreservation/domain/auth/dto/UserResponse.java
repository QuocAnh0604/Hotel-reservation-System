package com.example.hotelreservation.domain.auth.dto;

import com.example.hotelreservation.domain.auth.entity.*;
import lombok.*;

@Data
@Builder
public class UserResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;

    public static UserResponse from(AppUser user) {
        return UserResponse.builder().userId(user.getId()).firstName(user.getFirstName())
                .lastName(user.getLastName()).email(user.getEmail()).role(user.getRole()).build();
    }
}
