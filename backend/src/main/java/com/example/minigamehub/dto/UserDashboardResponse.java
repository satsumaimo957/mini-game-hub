package com.example.minigamehub.dto;

import java.util.List;

public record UserDashboardResponse(
        UserResponse user,
        int bestScore,
        List<ScoreResponse> playHistory,
        List<AchievementResponse> achievements
) {
}
