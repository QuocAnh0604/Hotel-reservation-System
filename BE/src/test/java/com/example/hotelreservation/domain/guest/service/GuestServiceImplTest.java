package com.example.hotelreservation.domain.guest.service;

import com.example.hotelreservation.domain.guest.dto.GuestRequest;
import com.example.hotelreservation.domain.guest.entity.Guest;
import com.example.hotelreservation.domain.guest.repository.GuestRepository;
import com.example.hotelreservation.domain.guest.service.impl.GuestServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class GuestServiceImplTest {
    @Mock GuestRepository repository;
    @InjectMocks GuestServiceImpl service;

    @Test void duplicateEmailReturnsConflict() {
        when(repository.findByEmailIgnoreCase("an@example.com")).thenReturn(Optional.of(Guest.builder().id(1L).build()));
        GuestRequest request = new GuestRequest("An", "Nguyen", "an@example.com");
        var error = assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.create(request));
        assertEquals(409, error.getStatusCode().value());
    }

    @Test void invalidEmailReturnsBadRequest() {
        GuestRequest request = new GuestRequest("An", "Nguyen", "invalid-email");
        var error = assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.create(request));
        assertEquals(400, error.getStatusCode().value());
        verifyNoInteractions(repository);
    }

    @Test void deleteSoftDeletesRecord() {
        Guest guest = Guest.builder().id(1L).email("an@example.com").build();
        when(repository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(guest));
        service.delete(1L);
        assertNotNull(guest.getDeletedAt());
        verify(repository).save(guest);
    }
}
