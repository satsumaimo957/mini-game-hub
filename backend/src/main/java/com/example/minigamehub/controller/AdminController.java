package com.example.minigamehub.controller;

import com.example.minigamehub.dto.AchievementResponse;
import com.example.minigamehub.dto.EventRequest;
import com.example.minigamehub.dto.EventResponse;
import com.example.minigamehub.dto.GameResponse;
import com.example.minigamehub.dto.GameSettingResponse;
import com.example.minigamehub.dto.GameSettingUpdateRequest;
import com.example.minigamehub.dto.ScoreResponse;
import com.example.minigamehub.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/game-settings")
    public List<GameSettingResponse> getGameSettings() {
        return adminService.getGameSettings();
    }

    @GetMapping("/games")
    public List<GameResponse> getGames() {
        return adminService.getGames();
    }

    @PutMapping("/game-settings/{id}")
    public GameSettingResponse updateGameSetting(
            @PathVariable Long id,
            @Valid @RequestBody GameSettingUpdateRequest request
    ) {
        return adminService.updateGameSetting(id, request);
    }

    @GetMapping("/events")
    public List<EventResponse> getEvents() {
        return adminService.getEvents();
    }

    @PostMapping("/events")
    public EventResponse createEvent(@Valid @RequestBody EventRequest request) {
        return adminService.createEvent(request);
    }

    @PutMapping("/events/{id}")
    public EventResponse updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return adminService.updateEvent(id, request);
    }

    @GetMapping("/scores")
    public List<ScoreResponse> getRecentScores() {
        return adminService.getRecentScores();
    }

    @GetMapping("/achievements")
    public List<AchievementResponse> getAchievements() {
        return adminService.getAchievements();
    }
}
