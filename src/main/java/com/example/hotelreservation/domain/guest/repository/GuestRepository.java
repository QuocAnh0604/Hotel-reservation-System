package com.example.hotelreservation.domain.guest.repository;

import com.example.hotelreservation.domain.guest.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    Optional<Guest> findByIdAndDeletedAtIsNull(Long id);

    Optional<Guest> findByEmailIgnoreCase(String email);

    Optional<Guest> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    List<Guest> findAllByDeletedAtIsNullOrderByIdAsc();
}
