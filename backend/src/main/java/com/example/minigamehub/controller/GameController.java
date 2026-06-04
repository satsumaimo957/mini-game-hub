package com.example.minigamehub.controller;

import com.example.minigamehub.dto.GameResponse;
import com.example.minigamehub.dto.GameSettingResponse;
import com.example.minigamehub.dto.ScoreResponse;
import com.example.minigamehub.service.GameService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/games")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public List<GameResponse> getGames() {
        return gameService.getGames();
    }

    @GetMapping("/{gameId}/settings")
    public GameSettingResponse getSettings(@PathVariable Long gameId) {
        return gameService.getSetting(gameId);
    }

    @GetMapping("/{gameId}/ranking")
    public List<ScoreResponse> getRanking(@PathVariable Long gameId) {
        return gameService.getRanking(gameId);
    }
}
