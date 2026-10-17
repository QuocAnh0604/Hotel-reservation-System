package com.example.hotelreservation.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Database infrastructure is configured from spring.datasource.* properties.
 */
@Configuration
@EnableTransactionManagement
public class DatabaseConfig {
}
