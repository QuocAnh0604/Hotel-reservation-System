package com.example.hotelreservation.domain.review.repository;

import com.example.hotelreservation.domain.review.entity.Review;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByHotelIdAndRoomTypeId(Long hotelId, String roomTypeId, Pageable pageable);
    Page<Review> findByHotelId(Long hotelId, Pageable pageable);
    Page<Review> findByGuestId(Long guestId, Pageable pageable);
    Optional<Review> findByReservationId(Long reservationId);

    @Query("select avg(r.rating) from Review r where r.hotelId = :hotelId")
    Double averageRating(@Param("hotelId") Long hotelId);

    long countByHotelId(Long hotelId);
}
