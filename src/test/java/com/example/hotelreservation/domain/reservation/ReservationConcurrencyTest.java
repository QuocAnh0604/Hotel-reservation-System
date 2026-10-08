package com.example.hotelreservation.domain.reservation;

import com.example.hotelreservation.domain.reservation.client.*;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
@Import(ReservationConcurrencyTest.TestClients.class)
class ReservationConcurrencyTest {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("hotel_reservation")
            .withUsername("postgres")
            .withPassword("postgres");

    @Autowired MockMvc mockMvc;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("security.jwt.secret", () -> "test-secret-test-secret-test-secret");
    }

    @BeforeEach
    void setUpInventory() {
        jdbc.update("delete from reservation");
        jdbc.update("delete from room_type_inventory where hotel_id = ?", 9001L);
        LocalDate start = LocalDate.now().plusDays(1);
        for (int day = 0; day < 3; day++)
            jdbc.update("insert into room_type_inventory (hotel_id, room_type_id, date, total_inventory, total_reserved, version) values (?, ?, ?, ?, ?, ?)",
                    9001L, "STANDARD", start.plusDays(day), 1, 0, 0);
    }

    @Test
    void onlyOneConcurrentReservationCanReserveAllNights() throws Exception {
        LocalDate start = LocalDate.now().plusDays(1);
        String body = "{\"hotelId\":9001,\"roomTypeId\":\"STANDARD\",\"startDate\":\""
                + start + "\",\"endDate\":\"" + start.plusDays(3) + "\",\"guestId\":";
        ExecutorService executor = Executors.newFixedThreadPool(20);
        CountDownLatch ready = new CountDownLatch(20);
        CountDownLatch go = new CountDownLatch(1);
        try {
            List<Future<Integer>> results = new ArrayList<>();
            for (int guest = 1; guest <= 20; guest++) {
                int guestId = guest;
                results.add(executor.submit(() -> {
                    ready.countDown();
                    go.await();
                    return mockMvc.perform(post("/reservations")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(body + guestId + "}"))
                            .andReturn().getResponse().getStatus();
                }));
            }
            Assertions.assertTrue(ready.await(10, TimeUnit.SECONDS));
            go.countDown();

            List<Integer> statuses = new ArrayList<>();
            for (Future<Integer> result : results)
                statuses.add(result.get(30, TimeUnit.SECONDS));

            assertEquals(1, statuses.stream().filter(status -> status == 200).count());
            assertEquals(19, statuses.stream().filter(status -> status == 409).count());
            assertEquals(1, jdbc.queryForObject("select count(*) from reservation", Integer.class));
            assertEquals(List.of(1, 1, 1), jdbc.queryForList(
                    "select total_reserved from room_type_inventory where hotel_id = 9001 and room_type_id = 'STANDARD' order by date",
                    Integer.class));
        } finally {
            executor.shutdownNow();
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class TestClients {
        @Bean
        @Primary
        GuestClient guestClient() {
            return guestId -> { };
        }

        @Bean
        @Primary
        HotelClient hotelClient() {
            return (hotelId, roomTypeId) -> { };
        }

        @Bean
        @Primary
        RateClient rateClient() {
            return (hotelId, checkin, checkout) -> BigDecimal.ONE;
        }
    }
}
