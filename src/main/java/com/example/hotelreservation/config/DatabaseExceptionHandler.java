package com.example.hotelreservation.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class DatabaseExceptionHandler {
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handle(DataIntegrityViolationException exception) {
        String message = rootCause(exception).getMessage();
        if (message != null && message.contains("check_room_count"))
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "No rooms available"));
        throw exception;
    }

    private Throwable rootCause(Throwable exception) {
        Throwable cause = exception;
        while (cause.getCause() != null)
            cause = cause.getCause();
        return cause;
    }
}
