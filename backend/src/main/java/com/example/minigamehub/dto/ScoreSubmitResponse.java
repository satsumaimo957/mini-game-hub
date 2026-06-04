package com.example.minigamehub.dto;

import java.util.List;

public record ScoreSubmitResponse(
        ScoreResponse score,
        List<AchievementResponse> newAchievements
) {
}
