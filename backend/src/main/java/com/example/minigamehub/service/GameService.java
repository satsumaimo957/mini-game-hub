package com.example.minigamehub.service;

import com.example.minigamehub.dto.GameResponse;
import com.example.minigamehub.dto.GameSettingResponse;
import com.example.minigamehub.dto.ScoreResponse;
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
                .orElseThrow(() -> new IllegalArgumentException("Game setting was not found"));
    }

    public List<ScoreResponse> getRanking(Long gameId) {
        return scoreRepository.findRanking(gameId, PageRequest.of(0, 10))
                .stream()
                .map(ScoreResponse::from)
                .toList();
    }
}
