package com.example.minigamehub.service;

import com.example.minigamehub.dto.GameResponse;
import com.example.minigamehub.dto.GameSettingResponse;
import com.example.minigamehub.dto.RankingResponse;
import com.example.minigamehub.entity.Game;
import com.example.minigamehub.repository.GameRepository;
import com.example.minigamehub.repository.GameSettingRepository;
import com.example.minigamehub.repository.ScoreRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class GameService {
    private final GameRepository gameRepository;
    private final GameSettingRepository gameSettingRepository;
    private final ScoreRepository scoreRepository;

    public GameService(
            GameRepository gameRepository,
            GameSettingRepository gameSettingRepository,
            ScoreRepository scoreRepository
    ) {
        this.gameRepository = gameRepository;
        this.gameSettingRepository = gameSettingRepository;
        this.scoreRepository = scoreRepository;
    }

    public List<GameResponse> getGames() {
        return gameRepository.findByActiveTrueOrderByIdAsc()
                .stream()
                .map(GameResponse::from)
                .toList();
    }

    public GameSettingResponse getSetting(Long gameId) {
        return gameSettingRepository.findByGame_Id(gameId)
                .map(GameSettingResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("ゲーム設定が見つかりません。"));
    }

    public List<RankingResponse> getRanking(String gameRef) {
        Game game = resolveGame(gameRef);
        List<com.example.minigamehub.entity.Score> scores = scoreRepository.findRanking(
                game.getId(),
                PageRequest.of(0, 10)
        );
        return toRankingResponses(scores);
    }

    private Game resolveGame(String gameRef) {
        if (gameRef.matches("\\d+")) {
            return gameRepository.findById(Long.valueOf(gameRef))
                    .orElseThrow(() -> new IllegalArgumentException("ゲームが見つかりません。"));
        }
        return gameRepository.findByCode(gameRef)
                .orElseThrow(() -> new IllegalArgumentException("ゲームが見つかりません。"));
    }

    private List<RankingResponse> toRankingResponses(List<com.example.minigamehub.entity.Score> scores) {
        java.util.concurrent.atomic.AtomicInteger rank = new java.util.concurrent.atomic.AtomicInteger(1);
        return scores.stream()
                .map(score -> RankingResponse.from(score, rank.getAndIncrement()))
                .toList();
    }
}
