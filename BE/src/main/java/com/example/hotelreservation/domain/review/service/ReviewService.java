package com.example.hotelreservation.domain.review.service;

import com.example.hotelreservation.domain.review.dto.*;
import com.example.hotelreservation.domain.auth.security.AuthenticatedUser;
import org.springframework.data.domain.*;

public interface ReviewService {
    ReviewResponse create(Long hotelId, ReviewRequest request);
    Page<ReviewResponse> list(Long hotelId, String roomTypeId, Pageable pageable);
    Page<ReviewResponse> byGuest(Long guestId, Pageable pageable);
    ReviewResponse get(Long id);
    ReviewResponse update(Long id, ReviewUpdateRequest request, AuthenticatedUser user);
    void delete(Long id, AuthenticatedUser user);
    ReviewSummaryResponse summary(Long hotelId);
}
