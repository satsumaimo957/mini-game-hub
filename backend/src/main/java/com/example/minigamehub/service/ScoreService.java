package com.example.minigamehub.service;

import com.example.minigamehub.dto.ScoreResponse;
import com.example.minigamehub.dto.ScoreSubmitRequest;
import com.example.minigamehub.dto.ScoreSubmitResponse;
import com.example.minigamehub.entity.Event;
import com.example.minigamehub.entity.Game;
import com.example.minigamehub.entity.Score;
import com.example.minigamehub.entity.User;
import com.example.minigamehub.repository.GameRepository;
import com.example.minigamehub.repository.ScoreRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScoreService {
    private final ScoreRepository scoreRepository;
    private final GameRepository gameRepository;
    private final CurrentUserService currentUserService;
    private final EventService eventService;
    private final AchievementService achievementService;

    public ScoreService(
            ScoreRepository scoreRepository,
            GameRepository gameRepository,
            CurrentUserService currentUserService,
            EventService eventService,
            AchievementService achievementService
    ) {
        this.scoreRepository = scoreRepository;
        this.gameRepository = gameRepository;
        this.currentUserService = currentUserService;
        this.eventService = eventService;
        this.achievementService = achievementService;
    }

    @Transactional
    public ScoreSubmitResponse submit(ScoreSubmitRequest request) {
        User user = currentUserService.getCurrentUser();
        Game game = gameRepository.findById(request.gameId())
                .orElseThrow(() -> new IllegalArgumentException("Game was not found"));
        Event event = eventService.getCurrentEventEntity().orElse(null);
        BigDecimal multiplier = event == null ? BigDecimal.ONE : event.getMultiplier();

        int finalScore = BigDecimal.valueOf(request.score())
                .multiply(multiplier)
                .setScale(0, RoundingMode.HALF_UP)
                .intValue();

        Score score = new Score();
        score.setUser(user);
        score.setGame(game);
        score.setOriginalScore(request.score());
        score.setScore(finalScore);
        score.setPlayTimeSeconds(request.playTimeSeconds());
        score.setEvent(event);
        score.setEventMultiplier(multiplier);
        scoreRepository.save(score);

        return new ScoreSubmitResponse(
                ScoreResponse.from(score),
                achievementService.evaluate(user, score)
        );
    }

    public List<ScoreResponse> getMyScores() {
        User user = currentUserService.getCurrentUser();
        return scoreRepository.findByUser_IdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 50))
                .stream()
                .map(ScoreResponse::from)
                .toList();
    }
}
