package com.example.hotelreservation.domain.review.controller;

import com.example.hotelreservation.domain.review.dto.*;
import com.example.hotelreservation.domain.review.service.ReviewService;
import com.example.hotelreservation.domain.auth.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @PostMapping("/hotels/{hotelId}/reviews")
    public ReviewResponse create(@PathVariable Long hotelId, @Valid @RequestBody ReviewRequest request,
                                 @AuthenticationPrincipal AuthenticatedUser user) {
        request.setGuestId(user.userId());
        return service.create(hotelId, request);
    }

    @GetMapping("/hotels/{hotelId}/reviews")
    public Page<ReviewResponse> list(@PathVariable Long hotelId,
                                    @RequestParam(required = false) String roomTypeId,
                                    Pageable pageable) {
        return service.list(hotelId, roomTypeId, pageable);
    }

    @GetMapping("/hotels/{hotelId}/reviews/summary")
    public ReviewSummaryResponse summary(@PathVariable Long hotelId) {
        return service.summary(hotelId);
    }

    @GetMapping("/guests/{guestId}/reviews")
    public Page<ReviewResponse> byGuest(@PathVariable Long guestId, Pageable pageable) {
        return service.byGuest(guestId, pageable);
    }

    @GetMapping("/reviews/{reviewId}")
    public ReviewResponse get(@PathVariable Long reviewId) {
        return service.get(reviewId);
    }

    @PutMapping("/reviews/{reviewId}")
    public ReviewResponse update(@PathVariable Long reviewId, @Valid @RequestBody ReviewUpdateRequest request,
                                 @AuthenticationPrincipal AuthenticatedUser user) {
        return service.update(reviewId, request, user);
    }

    @DeleteMapping("/reviews/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long reviewId, @AuthenticationPrincipal AuthenticatedUser user) {
        service.delete(reviewId, user);
    }
}
