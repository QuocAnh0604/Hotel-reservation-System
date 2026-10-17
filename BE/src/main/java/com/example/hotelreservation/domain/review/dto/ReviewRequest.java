package com.example.hotelreservation.domain.review.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    @NotNull
    private Long guestId;

    @NotNull
    private Long reservationId;

    private String roomTypeId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 2000)
    private String comment;
}
