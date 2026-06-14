package com.example.minigamehub.dto;

import jakarta.validation.constraints.Min;

public record ScoreSubmitRequest(
        Long gameId,
        String gameSlug,
        @Min(0) int score,
        @Min(0) int playTimeSeconds
) {
}
