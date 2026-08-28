package com.example.hotelreservation.domain.rate.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomTypeRate {
    @EmbeddedId private RoomTypeRateId id;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal rate;
    public RoomTypeRate(Long hotelId, LocalDate date, BigDecimal rate) { this.id=new RoomTypeRateId(hotelId,date); this.rate=rate; }
}
