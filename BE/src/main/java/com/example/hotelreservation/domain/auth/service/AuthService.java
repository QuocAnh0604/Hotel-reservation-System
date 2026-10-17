package com.example.hotelreservation.domain.auth.service;

import com.example.hotelreservation.domain.auth.dto.*;
import com.example.hotelreservation.domain.auth.entity.AppUser;
import com.example.hotelreservation.domain.auth.repository.AppUserRepository;
import com.example.hotelreservation.domain.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (users.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email already exists"
            );
        }

        AppUser user = users.save(
                AppUser.builder()
                        .firstName(request.getFirstName().trim())
                        .lastName(request.getLastName().trim())
                        .email(email)
                        .password(passwordEncoder.encode(request.getPassword()))
                        .build()
        );

        return tokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmailIgnoreCase(request.getEmail().trim())
                .filter(AppUser::isEnabled)
                .filter(value -> passwordEncoder.matches(
                        request.getPassword(), value.getPassword()
                ))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"
                ));

        return tokens(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        try {
            var identity = jwtService.parse(request.getRefreshToken(), true);

            AppUser user = users.findById(identity.userId())
                    .filter(AppUser::isEnabled)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED, "User is disabled or missing"
                    ));

            return tokens(user);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token"
            );
        }
    }

    public UserResponse me(Long userId) {
        return UserResponse.from(
                users.findById(userId)
                        .filter(AppUser::isEnabled)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "User not found"
                        ))
        );
    }

    private AuthResponse tokens(AppUser user) {
        try {
            return AuthResponse.builder()
                    .accessToken(jwtService.accessToken(user))
                    .refreshToken(jwtService.refreshToken(user))
                    .tokenType("Bearer")
                    .user(UserResponse.from(user))
                    .build();

        } catch (Exception e) {
            throw new IllegalStateException("Cannot generate authentication tokens", e);
        }
    }
}