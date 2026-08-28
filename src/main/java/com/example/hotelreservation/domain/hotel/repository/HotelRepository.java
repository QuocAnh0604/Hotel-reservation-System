package com.example.hotelreservation.domain.hotel.repository;

import com.example.hotelreservation.domain.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.*;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    Page<Hotel> findByActiveTrue(Pageable pageable);
    Page<Hotel> findByActiveTrueAndLocationContainingIgnoreCase(String location, Pageable pageable);
    java.util.Optional<Hotel> findByIdAndActiveTrue(Long id);
}
