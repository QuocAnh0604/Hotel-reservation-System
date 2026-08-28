package com.example.hotelreservation.domain.reservation.entity;
import jakarta.persistence.*; import lombok.*; import java.io.Serializable; import java.time.LocalDate;
@Embeddable @Data @NoArgsConstructor @AllArgsConstructor public class RoomTypeInventoryId implements Serializable { private Long hotelId; private String roomTypeId; private LocalDate date; }
