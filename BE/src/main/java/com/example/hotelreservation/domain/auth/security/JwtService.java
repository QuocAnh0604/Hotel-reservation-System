package com.example.hotelreservation.domain.auth.security;

import com.example.hotelreservation.domain.auth.entity.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;

@Service
public class JwtService {
    private final byte[] secret;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.access-expiration-ms}") long accessExpiration,
                      @Value("${app.jwt.refresh-expiration-ms}") long refreshExpiration) {
        if (secret.length() < 32) throw new IllegalArgumentException("JWT secret must have at least 32 characters");
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    public String accessToken(AppUser user) throws Exception { return create(user, accessExpiration, "access"); }
    public String refreshToken(AppUser user) throws Exception { return create(user, refreshExpiration, "refresh"); }

    public AuthenticatedUser parse(String token, boolean refreshOnly) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3 || !MessageDigest.isEqual(sign(parts[0] + "." + parts[1]), parts[2].getBytes(StandardCharsets.UTF_8)))
                throw new IllegalArgumentException("Invalid token");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Map<String, String> claims = parseJson(payload);
            if (Instant.now().getEpochSecond() >= Long.parseLong(claims.get("exp"))) throw new IllegalArgumentException("Expired token");
            if (refreshOnly && !"refresh".equals(claims.get("typ"))) throw new IllegalArgumentException("Refresh token required");
            return new AuthenticatedUser(Long.valueOf(claims.get("sub")), claims.get("email"), UserRole.valueOf(claims.get("role")));
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid token", exception);
        }
    }

    private String create(AppUser user, long expiration, String type) throws Exception {
        long now = Instant.now().getEpochSecond();
        String header = encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = encode(String.format(Locale.ROOT, "{\"sub\":\"%d\",\"email\":\"%s\",\"role\":\"%s\",\"typ\":\"%s\",\"exp\":%d}",
                user.getId(), escape(user.getEmail()), user.getRole(), type, now + expiration / 1000));
        String unsigned = header + "." + payload;
        return unsigned + "." + new String(sign(unsigned), StandardCharsets.UTF_8);
    }

    private byte[] sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return Base64.getUrlEncoder().withoutPadding().encode(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    private String encode(String value) { return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8)); }
    private String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }

    private Map<String, String> parseJson(String json) {
        Map<String, String> result = new HashMap<>();
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\\"([^\\\"]+)\\\":(?:\\\"([^\\\"]*)\\\"|(\\d+))").matcher(json);
        while (matcher.find()) result.put(matcher.group(1), matcher.group(2) != null ? matcher.group(2) : matcher.group(3));
        return result;
    }
}
