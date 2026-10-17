package com.example.hotelreservation.domain.review.dto;

import com.example.hotelreservation.domain.review.entity.Review;
import lombok.*;

import java.time.Instant;

@Data
@Builder
public class ReviewResponse {
    private Long reviewId;
    private Long hotelId;
    private String roomTypeId;
    private Long guestId;
    private Long reservationId;
    private Integer rating;
    private String comment;
    private Instant createdAt;
    private Instant updatedAt;

    public static ReviewResponse from(Review r) {
        return ReviewResponse.builder()
                .reviewId(r.getId())
                .hotelId(r.getHotelId())
                .roomTypeId(r.getRoomTypeId())
                .guestId(r.getGuestId())
                .reservationId(r.getReservationId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
