package com.example.hotelreservation.domain.auth.service;

import com.example.hotelreservation.domain.auth.dto.*;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
