package com.example.hotelreservation.domain.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room", indexes = {
        @Index(name = "idx_room_hotel_id", columnList = "hotel_id"),
        @Index(name = "idx_room_type_id", columnList = "room_type_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "room_id") private Long id;
    @Column(name = "room_type_id", nullable = false, length = 100) private String roomTypeId;
    private Integer floor;
    @Column(nullable = false, length = 20) private String number;
    @Column(name = "hotel_id", nullable = false) private Long hotelId;
    @Column(nullable = false, length = 100) private String name;
    @Column(name = "is_available", nullable = false) @Builder.Default private boolean available = true;
    @Column(nullable = false) @Builder.Default private boolean active = true;
}
