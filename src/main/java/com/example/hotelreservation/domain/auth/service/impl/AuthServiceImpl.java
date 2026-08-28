package com.example.hotelreservation.domain.auth.service.impl;

import com.example.hotelreservation.domain.auth.dto.*;
import com.example.hotelreservation.domain.auth.service.AuthService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    @Override
    public AuthResponse login(LoginRequest request) { return null; }

    @Override
    public AuthResponse register(RegisterRequest request) { return null; }
}
