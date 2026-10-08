package com.example.hotelreservation.domain.reservation.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_type_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomTypeInventory {
    @EmbeddedId
    private RoomTypeInventoryId id;
    @Column(nullable = false)
    private int totalInventory;
    @Column(nullable = false)
    private int totalReserved;
    @Version
    private long version;

    public int available() {
        return totalInventory - totalReserved;
    }
}
