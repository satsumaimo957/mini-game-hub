package com.example.minigamehub.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;

public record EventRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 700) String description,
        @NotNull @DecimalMin("1.00") @DecimalMax("10.00") BigDecimal multiplier,
        @NotNull Instant startAt,
        @NotNull Instant endAt,
        boolean active
) {
}
