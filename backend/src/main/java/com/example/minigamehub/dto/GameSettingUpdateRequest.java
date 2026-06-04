package com.example.minigamehub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record GameSettingUpdateRequest(
        @Min(80) @Max(900) int enemySpeed,
        @Min(150) @Max(3000) int spawnRate,
        @Min(10) @Max(300) int timeLimitSeconds,
        @Min(1) @Max(200) int baseScorePerSecond
) {
}
