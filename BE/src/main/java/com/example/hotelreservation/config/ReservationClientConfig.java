package com.example.hotelreservation.config;

import com.example.hotelreservation.domain.rate.dto.RateQuoteResponse;
import com.example.hotelreservation.domain.reservation.client.GuestClient;
import com.example.hotelreservation.domain.reservation.client.HotelClient;
import com.example.hotelreservation.domain.reservation.client.RateClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Objects;

@Configuration
public class ReservationClientConfig {

    @Bean
    GuestClient guestClient(
            @Value("${services.guest-url:http://localhost:8080}") String url) {
        RestClient client = RestClient.builder().baseUrl(url).build();

        return guestId -> {
            try {
                client.get().uri("/guests/{id}", guestId).retrieve().toBodilessEntity();
            } catch (RestClientException exception) {
                throw dependencyFailure("Guest Service", exception);
            }
        };
    }

    @Bean
    HotelClient hotelClient(
            @Value("${services.hotel-url:http://localhost:8080}") String url) {
        RestClient client = RestClient.builder().baseUrl(url).build();

        return (hotelId, roomTypeId) -> {
            try {
                client.get().uri("/hotels/{id}", hotelId).retrieve().toBodilessEntity();
                Map<?, ?> rooms = client.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/hotels/{id}/rooms")
                                .queryParam("roomTypeId", roomTypeId)
                                .queryParam("size", 1)
                                .build(hotelId))
                        .retrieve()
                        .body(Map.class);
                Object content = rooms == null ? null : rooms.get("content");
                if (!(content instanceof java.util.Collection<?> collection) || collection.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room type not found for hotel");
                }
            } catch (RestClientException exception) {
                throw dependencyFailure("Hotel Service", exception);
            }
        };
    }

    @Bean
    RateClient rateClient(
            @Value("${services.rate-url:http://localhost:8080}") String url) {
        RestClient client = RestClient.builder().baseUrl(url).build();

        return (hotelId, checkin, checkout) -> {
            try {
                RateQuoteResponse response = client.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/internal/hotels/{id}/rates/quote")
                                .queryParam("checkin", checkin)
                                .queryParam("checkout", checkout)
                                .build(hotelId))
                        .retrieve()
                        .body(RateQuoteResponse.class);

                return Objects.requireNonNull(response, "Rate Service returned an empty response")
                        .getTotalRate();
            } catch (RestClientResponseException exception) {
                throw dependencyFailure("Rate Service", exception);
            } catch (RestClientException | NullPointerException exception) {
                throw serviceUnavailable("Rate Service", exception);
            }
        };
    }

    private static ResponseStatusException dependencyFailure(
            String serviceName,
            RestClientException exception) {
        if (exception instanceof RestClientResponseException responseException
                && responseException.getStatusCode().is4xxClientError()) {
            return new ResponseStatusException(
                    responseException.getStatusCode(),
                    serviceName + " rejected the request",
                    exception);
        }

        return serviceUnavailable(serviceName, exception);
    }

    private static ResponseStatusException serviceUnavailable(
            String serviceName,
            Exception exception) {
        return new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                serviceName + " unavailable",
                exception);
    }
}
