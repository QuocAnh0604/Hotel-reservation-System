package com.example.hotelreservation.config;

import com.example.hotelreservation.domain.auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/hotels/**", "/reviews/**", "/guests/*/reviews").permitAll()
                        .requestMatchers(HttpMethod.POST, "/reservations", "/hotels/*/reviews").hasRole("USER")
                        .requestMatchers(HttpMethod.PATCH, "/reservations/*/cancel").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/reservations/*/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/reviews/*").hasRole("USER")
                        .requestMatchers(HttpMethod.DELETE, "/reviews/*").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/hotels/**", "/hotels/*/rates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/hotels/**", "/hotels/*/rates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/hotels/**", "/hotels/*/rates/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}
