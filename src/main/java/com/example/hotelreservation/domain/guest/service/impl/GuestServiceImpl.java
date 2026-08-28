package com.example.hotelreservation.domain.guest.service.impl;

import com.example.hotelreservation.domain.guest.service.GuestService;
import com.example.hotelreservation.domain.guest.repository.GuestRepository;
import com.example.hotelreservation.domain.guest.dto.*;
import com.example.hotelreservation.domain.guest.entity.Guest;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import java.time.Instant;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GuestServiceImpl implements GuestService {
    private final GuestRepository repository;
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    public GuestResponse create(GuestRequest r) { validate(r); if (repository.findByEmailIgnoreCase(r.getEmail()).isPresent()) throw conflict(); return GuestResponse.from(repository.save(Guest.builder().firstName(r.getFirstName()).lastName(r.getLastName()).email(r.getEmail()).build())); }
    public GuestResponse get(Long id) { return GuestResponse.from(find(id)); }
    public List<GuestResponse> find(String email) { return email == null ? repository.findAllByDeletedAtIsNullOrderByIdAsc().stream().map(GuestResponse::from).toList() : repository.findByEmailIgnoreCaseAndDeletedAtIsNull(email).stream().map(GuestResponse::from).toList(); }
    public GuestResponse update(Long id, GuestRequest r) { validate(r); Guest g=find(id); repository.findByEmailIgnoreCase(r.getEmail()).filter(x -> !x.getId().equals(id)).ifPresent(x -> { throw conflict(); }); g.setFirstName(r.getFirstName()); g.setLastName(r.getLastName()); g.setEmail(r.getEmail()); return GuestResponse.from(repository.save(g)); }
    public void delete(Long id) { Guest g=find(id); g.setDeletedAt(Instant.now()); repository.save(g); }
    private Guest find(Long id) { return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest not found")); }
    private void validate(GuestRequest r) { if (r == null || r.getFirstName() == null || r.getFirstName().isBlank() || r.getLastName() == null || r.getLastName().isBlank() || r.getEmail() == null || !EMAIL.matcher(r.getEmail()).matches()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid guest data"); }
    private ResponseStatusException conflict() { return new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists"); }
}
