package com.example.hotelreservation.domain.auth.security;

import com.example.hotelreservation.domain.auth.entity.UserRole;

public record AuthenticatedUser(Long userId, String email, UserRole role) {}
