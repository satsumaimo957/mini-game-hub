package com.example.minigamehub.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ScoreSubmitRequest(
        @NotNull Long gameId,
        @Min(0) int score,
        @Min(0) int playTimeSeconds
) {
}
