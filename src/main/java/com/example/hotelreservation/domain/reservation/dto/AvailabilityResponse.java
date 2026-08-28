package com.example.hotelreservation.domain.reservation.dto;
import lombok.*; import java.time.LocalDate; import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor public class AvailabilityResponse { private Long hotelId; private String roomTypeId; private List<DailyAvailability> dailyAvailability; @Data @AllArgsConstructor public static class DailyAvailability { private LocalDate date; private int available; } }
