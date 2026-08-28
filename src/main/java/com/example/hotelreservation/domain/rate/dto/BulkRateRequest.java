package com.example.hotelreservation.domain.rate.dto;
import jakarta.validation.constraints.*; import lombok.*; import java.math.BigDecimal; import java.time.LocalDate; import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor public class BulkRateRequest { @NotEmpty private List<@NotNull LocalDate> dates; @NotNull @DecimalMin("0.01") private BigDecimal rate; }
