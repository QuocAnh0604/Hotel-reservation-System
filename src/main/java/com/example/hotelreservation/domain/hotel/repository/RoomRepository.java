package com.example.hotelreservation.domain.hotel.repository;

import com.example.hotelreservation.domain.hotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.*;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {
    Page<Room> findByHotelIdAndActiveTrue(Long hotelId, Pageable pageable);
    Page<Room> findByHotelIdAndActiveTrueAndRoomTypeId(Long hotelId, String roomTypeId, Pageable pageable);
    Page<Room> findByHotelIdAndActiveTrueAndFloor(Long hotelId, Integer floor, Pageable pageable);
    Page<Room> findByHotelIdAndActiveTrueAndAvailable(Long hotelId, boolean available, Pageable pageable);
    Optional<Room> findByIdAndHotelIdAndActiveTrue(Long id, Long hotelId);
    boolean existsByHotelIdAndActiveTrue(Long hotelId);
}
