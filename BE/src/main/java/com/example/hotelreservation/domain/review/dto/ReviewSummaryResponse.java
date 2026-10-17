package com.example.hotelreservation.domain.review.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class ReviewSummaryResponse {
    private Long hotelId;
    private Double averageRating;
    private long totalReviews;
}
