package com.example.minigamehub.dto;

import com.example.minigamehub.entity.Event;
import java.math.BigDecimal;
import java.time.Instant;

public record EventResponse(
        Long id,
        String name,
        String description,
        BigDecimal multiplier,
        Instant startAt,
        Instant endAt,
        boolean active
) {
    public static EventResponse from(Event event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getMultiplier(),
                event.getStartAt(),
                event.getEndAt(),
                event.isActive()
        );
    }
}
