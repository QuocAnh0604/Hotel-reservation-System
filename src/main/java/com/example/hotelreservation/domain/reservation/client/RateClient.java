package com.example.hotelreservation.domain.reservation.client;
import java.math.BigDecimal; import java.time.LocalDate;
public interface RateClient { BigDecimal quote(Long hotelId,LocalDate checkin,LocalDate checkout); }
