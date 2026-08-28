package com.example.hotelreservation.domain.rate.entity;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDate;
@Embeddable @Data @NoArgsConstructor @AllArgsConstructor
public class RoomTypeRateId implements Serializable { @Column(name="hotel_id") private Long hotelId; @Column(name="rate_date") private LocalDate date; }
