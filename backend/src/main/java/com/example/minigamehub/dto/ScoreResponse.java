package com.example.minigamehub.dto;

import com.example.minigamehub.entity.Event;
import com.example.minigamehub.entity.Score;
import java.math.BigDecimal;
import java.time.Instant;

public record ScoreResponse(
        Long id,
        Long userId,
        String username,
        Long gameId,
        String gameName,
        int originalScore,
        int score,
        int playTimeSeconds,
        Long eventId,
        String eventName,
        BigDecimal eventMultiplier,
        Instant createdAt
) {
    public static ScoreResponse from(Score score) {
        Event event = score.getEvent();
        return new ScoreResponse(
                score.getId(),
                score.getUser().getId(),
                score.getUser().getUsername(),
                score.getGame().getId(),
                score.getGame().getName(),
                score.getOriginalScore(),
                score.getScore(),
                score.getPlayTimeSeconds(),
                event == null ? null : event.getId(),
                event == null ? null : event.getName(),
                score.getEventMultiplier(),
                score.getCreatedAt()
        );
    }
}
