package com.example.hotelreservation.domain.reservation.repository;

import com.example.hotelreservation.domain.reservation.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.*;

public interface RoomTypeInventoryRepository extends JpaRepository<RoomTypeInventory, RoomTypeInventoryId> {
    @Modifying
    @Query("update RoomTypeInventory i set i.totalReserved = i.totalReserved + 1 where i.id.hotelId=:hotel and i.id.roomTypeId=:type and i.id.date=:date")
    int reserveNight(@Param("hotel") Long hotel, @Param("type") String type, @Param("date") LocalDate date);

    @Modifying
    @Query("update RoomTypeInventory i set i.totalReserved = i.totalReserved - 1 where i.id.hotelId=:hotel and i.id.roomTypeId=:type and i.id.date=:date and i.totalReserved > 0")
    int releaseNight(@Param("hotel") Long hotel, @Param("type") String type, @Param("date") LocalDate date);

    List<RoomTypeInventory> findByIdHotelIdAndIdRoomTypeIdAndIdDateBetweenOrderByIdDate(Long hotel, String type, LocalDate from, LocalDate to);
}
