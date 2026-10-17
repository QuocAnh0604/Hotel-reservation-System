package com.example.hotelreservation.domain.hotel.service.impl;

import com.example.hotelreservation.domain.hotel.service.HotelService;
import com.example.hotelreservation.domain.hotel.repository.HotelRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.example.hotelreservation.domain.hotel.dto.*;
import com.example.hotelreservation.domain.hotel.entity.Hotel;
import com.example.hotelreservation.domain.hotel.repository.RoomRepository;
import org.springframework.data.domain.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {
    private final HotelRepository repository;
    private final RoomRepository roomRepository;

    public HotelResponse create(HotelRequest r) {
        return HotelResponse.from(repository.save(Hotel.builder().name(r.getName()).address(r.getAddress()).location(r.getLocation()).build()));
    }

    public HotelResponse get(Long id) {
        return HotelResponse.from(repository.findByIdAndActiveTrue(id).orElseThrow(() -> notFound("Hotel not found")));
    }

    public Page<HotelResponse> list(String location, Pageable p) {
        return (location == null ? repository.findByActiveTrue(p) : repository.findByActiveTrueAndLocationContainingIgnoreCase(location, p)).map(HotelResponse::from);
    }

    public HotelResponse update(Long id, HotelRequest r) {
        Hotel h = repository.findByIdAndActiveTrue(id).orElseThrow(() -> notFound("Hotel not found"));
        h.setName(r.getName());
        h.setAddress(r.getAddress());
        h.setLocation(r.getLocation());
        return HotelResponse.from(repository.save(h));
    }

    public void delete(Long id) {
        Hotel h = repository.findByIdAndActiveTrue(id).orElseThrow(() -> notFound("Hotel not found"));
        if (roomRepository.existsByHotelIdAndActiveTrue(id))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hotel still has active rooms");
        h.setActive(false);
        repository.save(h);
    }

    private ResponseStatusException notFound(String m) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, m);
    }
}
