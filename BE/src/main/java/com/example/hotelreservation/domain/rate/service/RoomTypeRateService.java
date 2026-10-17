package com.example.hotelreservation.domain.rate.service;

import com.example.hotelreservation.domain.rate.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface RoomTypeRateService {
    RoomTypeRateResponse create(Long h, RoomTypeRateRequest r);

    List<RoomTypeRateResponse> find(Long h, LocalDate from, LocalDate to);

    RoomTypeRateResponse get(Long h, LocalDate d);

    RoomTypeRateResponse update(Long h, LocalDate d, RoomTypeRateRequest r);

    List<RoomTypeRateResponse> bulk(Long h, BulkRateRequest r);

    void delete(Long h, LocalDate d);

    RateQuoteResponse quote(Long h, LocalDate in, LocalDate out);
}
