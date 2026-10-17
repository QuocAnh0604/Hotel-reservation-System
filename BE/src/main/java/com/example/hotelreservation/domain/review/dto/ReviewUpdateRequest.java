package com.example.hotelreservation.domain.review.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewUpdateRequest {
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 2000)
    private String comment;
}
