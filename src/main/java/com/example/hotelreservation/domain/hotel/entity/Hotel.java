package com.example.hotelreservation.domain.hotel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "hotel")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hotel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "hotel_id") private Long id;
    @Column(nullable = false, length = 255) private String name;
    @Column(nullable = false, length = 500) private String address;
    @Column(length = 255) private String location;
    @Column(nullable = false) @Builder.Default private boolean active = true;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @PrePersist void onCreate() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
}
