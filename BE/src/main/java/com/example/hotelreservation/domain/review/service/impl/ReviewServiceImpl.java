package com.example.hotelreservation.domain.review.service.impl;

import com.example.hotelreservation.domain.hotel.repository.HotelRepository;
import com.example.hotelreservation.domain.guest.repository.GuestRepository;
import com.example.hotelreservation.domain.reservation.entity.*;
import com.example.hotelreservation.domain.reservation.repository.ReservationRepository;
import com.example.hotelreservation.domain.review.dto.*;
import com.example.hotelreservation.domain.review.entity.Review;
import com.example.hotelreservation.domain.review.repository.ReviewRepository;
import com.example.hotelreservation.domain.review.service.ReviewService;
import com.example.hotelreservation.domain.auth.entity.UserRole;
import com.example.hotelreservation.domain.auth.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviews;
    private final ReservationRepository reservations;
    private final HotelRepository hotels;
    private final GuestRepository guests;

    @Override
    @Transactional
    public ReviewResponse create(Long hotelId, ReviewRequest request) {
        requireHotel(hotelId);
        guests.findByIdAndDeletedAtIsNull(request.getGuestId()).orElseThrow(() -> notFound("Guest not found"));
        if (reviews.findByReservationId(request.getReservationId()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Reservation already has a review");

        Reservation reservation = reservations.findById(request.getReservationId())
                .orElseThrow(() -> notFound("Reservation not found"));
        if (!hotelId.equals(reservation.getHotelId()) || !request.getGuestId().equals(reservation.getGuestId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation does not belong to this guest or hotel");
        if (reservation.getStatus() != ReservationStatus.CHECKED_OUT)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only checked-out reservations can be reviewed");
        if (request.getRoomTypeId() != null && !request.getRoomTypeId().equals(reservation.getRoomTypeId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room type does not match reservation");

        Review review = Review.builder()
                .hotelId(hotelId)
                .roomTypeId(request.getRoomTypeId() == null ? reservation.getRoomTypeId() : request.getRoomTypeId())
                .guestId(request.getGuestId())
                .reservationId(request.getReservationId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        return ReviewResponse.from(reviews.save(review));
    }

    @Override
    public Page<ReviewResponse> list(Long hotelId, String roomTypeId, Pageable pageable) {
        requireHotel(hotelId);
        Page<Review> result = roomTypeId == null
                ? reviews.findByHotelId(hotelId, pageable)
                : reviews.findByHotelIdAndRoomTypeId(hotelId, roomTypeId, pageable);
        return result.map(ReviewResponse::from);
    }

    @Override
    public Page<ReviewResponse> byGuest(Long guestId, Pageable pageable) {
        guests.findByIdAndDeletedAtIsNull(guestId).orElseThrow(() -> notFound("Guest not found"));
        return reviews.findByGuestId(guestId, pageable).map(ReviewResponse::from);
    }

    @Override
    public ReviewResponse get(Long id) {
        return ReviewResponse.from(find(id));
    }

    @Override
    @Transactional
    public ReviewResponse update(Long id, ReviewUpdateRequest request, AuthenticatedUser user) {
        Review review = find(id);
        requireOwnerOrAdmin(review, user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return ReviewResponse.from(reviews.save(review));
    }

    @Override
    @Transactional
    public void delete(Long id, AuthenticatedUser user) {
        Review review = find(id);
        requireOwnerOrAdmin(review, user);
        reviews.delete(review);
    }

    @Override
    public ReviewSummaryResponse summary(Long hotelId) {
        requireHotel(hotelId);
        return new ReviewSummaryResponse(hotelId, reviews.averageRating(hotelId), reviews.countByHotelId(hotelId));
    }

    private Review find(Long id) {
        return reviews.findById(id).orElseThrow(() -> notFound("Review not found"));
    }

    private void requireHotel(Long id) {
        hotels.findByIdAndActiveTrue(id).orElseThrow(() -> notFound("Hotel not found"));
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private void requireOwnerOrAdmin(Review review, AuthenticatedUser user) {
        if (user == null || (user.role() != UserRole.ADMIN && !user.userId().equals(review.getGuestId())))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot modify this review");
    }
}
