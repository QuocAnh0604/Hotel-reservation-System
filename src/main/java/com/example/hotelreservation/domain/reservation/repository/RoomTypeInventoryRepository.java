package com.example.hotelreservation.domain.reservation.repository;
import com.example.hotelreservation.domain.reservation.entity.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.time.LocalDate; import java.util.*;
public interface RoomTypeInventoryRepository extends JpaRepository<RoomTypeInventory,RoomTypeInventoryId> {
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select i from RoomTypeInventory i where i.id.hotelId=:hotel and i.id.roomTypeId=:type and i.id.date between :from and :to order by i.id.date") List<RoomTypeInventory> lockRange(@Param("hotel")Long hotel,@Param("type")String type,@Param("from")LocalDate from,@Param("to")LocalDate to);
 List<RoomTypeInventory> findByIdHotelIdAndIdRoomTypeIdAndIdDateBetweenOrderByIdDate(Long hotel,String type,LocalDate from,LocalDate to);
}
