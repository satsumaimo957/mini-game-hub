package com.example.minigamehub.controller;

import com.example.minigamehub.dto.ScoreResponse;
import com.example.minigamehub.dto.ScoreSubmitRequest;
import com.example.minigamehub.dto.ScoreSubmitResponse;
import com.example.minigamehub.service.ScoreService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {
    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @PostMapping
    public ScoreSubmitResponse submit(@Valid @RequestBody ScoreSubmitRequest request) {
        return scoreService.submit(request);
    }

    @GetMapping("/me")
    public List<ScoreResponse> mine() {
        return scoreService.getMyScores();
    }
}
