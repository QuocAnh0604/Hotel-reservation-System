package com.example.hotelreservation.domain.rate.repository;
import com.example.hotelreservation.domain.rate.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;
public interface RoomTypeRateRepository extends JpaRepository<RoomTypeRate,RoomTypeRateId> { List<RoomTypeRate> findByIdHotelIdAndIdDateBetweenOrderByIdDate(Long hotelId,LocalDate from,LocalDate to); Optional<RoomTypeRate> findByIdHotelIdAndIdDate(Long hotelId,LocalDate date); }
