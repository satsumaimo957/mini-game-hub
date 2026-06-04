package com.example.minigamehub.dto;

import com.example.minigamehub.entity.Achievement;
import com.example.minigamehub.entity.UserAchievement;
import java.time.Instant;

public record AchievementResponse(
        Long id,
        String code,
        String name,
        String description,
        String conditionType,
        int conditionValue,
        Instant achievedAt
) {
    public static AchievementResponse from(Achievement achievement, Instant achievedAt) {
        return new AchievementResponse(
                achievement.getId(),
                achievement.getCode(),
                achievement.getName(),
                achievement.getDescription(),
                achievement.getConditionType().name(),
                achievement.getConditionValue(),
                achievedAt
        );
    }

    public static AchievementResponse from(UserAchievement userAchievement) {
        return from(userAchievement.getAchievement(), userAchievement.getAchievedAt());
    }
}
