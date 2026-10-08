package com.example.hotelreservation.domain.hotel.service.impl;

import com.example.hotelreservation.domain.hotel.service.RoomService;
import com.example.hotelreservation.domain.hotel.repository.RoomRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.example.hotelreservation.domain.hotel.dto.*;
import com.example.hotelreservation.domain.hotel.entity.*;
import com.example.hotelreservation.domain.hotel.repository.HotelRepository;
import org.springframework.data.domain.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.data.jpa.domain.Specification;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    private final RoomRepository repository;
    private final HotelRepository hotelRepository;

    public RoomResponse create(Long hid, RoomRequest r) {
        requireHotel(hid);
        Room x = Room.builder().hotelId(hid).roomTypeId(r.getRoomTypeId()).floor(r.getFloor()).number(r.getNumber()).name(r.getName()).available(r.getIsAvailable() == null || r.getIsAvailable()).build();
        return RoomResponse.from(repository.save(x));
    }

    public RoomResponse get(Long h, Long id) {
        return RoomResponse.from(find(h, id));
    }

    public Page<RoomResponse> list(Long h, String type, Integer floor, Boolean av, Pageable p) {
        requireHotel(h);
        Specification<Room> s = (root, q, cb) -> cb.and(cb.equal(root.get("hotelId"), h), cb.isTrue(root.get("active")));
        if (type != null) s = s.and((root, q, cb) -> cb.equal(root.get("roomTypeId"), type));
        if (floor != null) s = s.and((root, q, cb) -> cb.equal(root.get("floor"), floor));
        if (av != null) s = s.and((root, q, cb) -> cb.equal(root.get("available"), av));
        return repository.findAll(s, p).map(RoomResponse::from);
    }

    public RoomResponse update(Long h, Long id, RoomRequest r) {
        Room x = find(h, id);
        x.setRoomTypeId(r.getRoomTypeId());
        x.setFloor(r.getFloor());
        x.setNumber(r.getNumber());
        x.setName(r.getName());
        if (r.getIsAvailable() != null) x.setAvailable(r.getIsAvailable());
        return RoomResponse.from(repository.save(x));
    }

    public RoomResponse availability(Long h, Long id, boolean a) {
        Room x = find(h, id);
        x.setAvailable(a);
        return RoomResponse.from(repository.save(x));
    }

    public void delete(Long h, Long id) {
        Room x = find(h, id);
        x.setActive(false);
        repository.save(x);
    }

    private Room find(Long h, Long id) {
        return repository.findByIdAndHotelIdAndActiveTrue(id, h).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    private void requireHotel(Long id) {
        if (!hotelRepository.findByIdAndActiveTrue(id).isPresent())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found");
    }
}
