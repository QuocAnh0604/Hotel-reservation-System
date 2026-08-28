package com.example.hotelreservation.domain.reservation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal; import java.time.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="reservation_id") private Long id;
    @Column(nullable=false) private Long hotelId; @Column(nullable=false) private String roomTypeId;
    @Column(nullable=false) private LocalDate startDate; @Column(nullable=false) private LocalDate endDate;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ReservationStatus status;
    @Column(nullable=false) private Long guestId; @Column(nullable=false,precision=10,scale=2) private BigDecimal totalAmount;
    @Column(nullable=false,updatable=false) private Instant createdAt; @Column(nullable=false) private Instant updatedAt;
    @PrePersist void create(){createdAt=updatedAt=Instant.now();} @PreUpdate void update(){updatedAt=Instant.now();}
}
