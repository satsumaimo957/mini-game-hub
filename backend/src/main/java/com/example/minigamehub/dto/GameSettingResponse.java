package com.example.minigamehub.dto;

import com.example.minigamehub.entity.GameSetting;
import java.time.Instant;

public record GameSettingResponse(
        Long id,
        Long gameId,
        String gameSlug,
        String gameName,
        int enemySpeed,
        int spawnRate,
        int timeLimitSeconds,
        int baseScorePerSecond,
        Instant updatedAt
) {
    public static GameSettingResponse from(GameSetting setting) {
        return new GameSettingResponse(
                setting.getId(),
                setting.getGame().getId(),
                setting.getGame().getCode(),
                setting.getGame().getName(),
                setting.getEnemySpeed(),
                setting.getSpawnRate(),
                setting.getTimeLimitSeconds(),
                setting.getBaseScorePerSecond(),
                setting.getUpdatedAt()
        );
    }
}
