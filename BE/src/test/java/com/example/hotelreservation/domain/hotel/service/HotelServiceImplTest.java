package com.example.hotelreservation.domain.hotel.service;

import com.example.hotelreservation.domain.hotel.entity.Hotel;
import com.example.hotelreservation.domain.hotel.repository.*;
import com.example.hotelreservation.domain.hotel.service.impl.HotelServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class HotelServiceImplTest {
    @Mock HotelRepository hotels; @Mock RoomRepository rooms;
    @InjectMocks HotelServiceImpl service;

    @Test void deleteHotelWithActiveRoomsReturnsConflict() {
        Hotel h = Hotel.builder().id(1L).name("H").address("A").build();
        when(hotels.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(h));
        when(rooms.existsByHotelIdAndActiveTrue(1L)).thenReturn(true);
        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.delete(1L));
        verify(hotels, never()).save(any());
    }

    @Test void deleteHotelWithoutRoomsSoftDeletes() {
        Hotel h = Hotel.builder().id(1L).name("H").address("A").build();
        when(hotels.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(h));
        when(rooms.existsByHotelIdAndActiveTrue(1L)).thenReturn(false);
        service.delete(1L);
        assertFalse(h.isActive());
        verify(hotels).save(h);
    }
}
