package com.example.minigamehub.dto;

import com.example.minigamehub.entity.Score;
import java.time.Instant;

public record RankingResponse(
        int rank,
        String username,
        int score,
        int playTimeSeconds,
        Instant createdAt,
        String gameName,
        String gameSlug
) {
    public static RankingResponse from(Score score, int rank) {
        return new RankingResponse(
                rank,
                score.getUser().getUsername(),
                score.getScore(),
                score.getPlayTimeSeconds(),
                score.getCreatedAt(),
                score.getGame().getName(),
                score.getGame().getCode()
        );
    }
}
