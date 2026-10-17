package com.example.hotelreservation.domain.rate.service.impl;

import com.example.hotelreservation.domain.rate.service.*;
import com.example.hotelreservation.domain.rate.repository.*;
import com.example.hotelreservation.domain.rate.entity.*;
import com.example.hotelreservation.domain.rate.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RoomTypeRateServiceImpl implements RoomTypeRateService {
    private final RoomTypeRateRepository repository;

    public RoomTypeRateResponse create(Long h, RoomTypeRateRequest r) {
        validateDate(r.getDate());
        if (repository.findByIdHotelIdAndIdDate(h, r.getDate()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Rate already exists");
        return RoomTypeRateResponse.from(repository.save(new RoomTypeRate(h, r.getDate(), r.getRate())));
    }

    public List<RoomTypeRateResponse> find(Long h, LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) throw bad("Invalid date range");
        return repository.findByIdHotelIdAndIdDateBetweenOrderByIdDate(h, from, to).stream().map(RoomTypeRateResponse::from).toList();
    }

    public RoomTypeRateResponse get(Long h, LocalDate d) {
        return repository.findByIdHotelIdAndIdDate(h, d).map(RoomTypeRateResponse::from).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rate not found"));
    }

    public RoomTypeRateResponse update(Long h, LocalDate d, RoomTypeRateRequest r) {
        validateDate(d);
        if (!d.equals(r.getDate())) throw bad("Date cannot be changed");
        RoomTypeRate x = repository.findByIdHotelIdAndIdDate(h, d).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rate not found"));
        x.setRate(r.getRate());
        return RoomTypeRateResponse.from(repository.save(x));
    }

    @Transactional
    public List<RoomTypeRateResponse> bulk(Long h, BulkRateRequest r) {
        r.getDates().forEach(this::validateDate);
        return r.getDates().stream().map(d -> repository.save(new RoomTypeRate(h, d, r.getRate()))).map(RoomTypeRateResponse::from).toList();
    }

    public void delete(Long h, LocalDate d) {
        RoomTypeRate x = repository.findByIdHotelIdAndIdDate(h, d).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rate not found"));
        repository.delete(x);
    }

    public RateQuoteResponse quote(Long h, LocalDate in, LocalDate out) {
        if (in == null || out == null || !in.isBefore(out)) throw bad("Checkout must be after checkin");
        List<RoomTypeRateResponse> days = find(h, in, out.minusDays(1));
        long nights = java.time.temporal.ChronoUnit.DAYS.between(in, out);
        if (days.size() != nights)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rate not found for one or more dates");
        BigDecimal total = days.stream().map(RoomTypeRateResponse::getRate).reduce(BigDecimal.ZERO, BigDecimal::add);
        return RateQuoteResponse.builder().hotelId(h).checkin(in).checkout(out).nights(nights).totalRate(total).dailyBreakdown(days).build();
    }

    private void validateDate(LocalDate d) {
        if (d == null || d.isBefore(LocalDate.now())) throw bad("cannot set rate for past date");
    }

    private ResponseStatusException bad(String m) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, m);
    }
}
