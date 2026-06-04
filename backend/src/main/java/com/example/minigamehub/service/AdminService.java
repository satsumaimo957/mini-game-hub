package com.example.minigamehub.service;

import com.example.minigamehub.dto.EventRequest;
import com.example.minigamehub.dto.EventResponse;
import com.example.minigamehub.dto.GameSettingResponse;
import com.example.minigamehub.dto.GameSettingUpdateRequest;
import com.example.minigamehub.dto.ScoreResponse;
import com.example.minigamehub.entity.Event;
import com.example.minigamehub.entity.GameSetting;
import com.example.minigamehub.repository.EventRepository;
import com.example.minigamehub.repository.GameSettingRepository;
import com.example.minigamehub.repository.ScoreRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
    private final GameSettingRepository gameSettingRepository;
    private final EventRepository eventRepository;
    private final ScoreRepository scoreRepository;

    public AdminService(
            GameSettingRepository gameSettingRepository,
            EventRepository eventRepository,
            ScoreRepository scoreRepository
    ) {
        this.gameSettingRepository = gameSettingRepository;
        this.eventRepository = eventRepository;
        this.scoreRepository = scoreRepository;
    }

    public List<GameSettingResponse> getGameSettings() {
        return gameSettingRepository.findAll()
                .stream()
                .map(GameSettingResponse::from)
                .toList();
    }

    @Transactional
    public GameSettingResponse updateGameSetting(Long id, GameSettingUpdateRequest request) {
        GameSetting setting = gameSettingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Game setting was not found"));
        setting.setEnemySpeed(request.enemySpeed());
        setting.setSpawnRate(request.spawnRate());
        setting.setTimeLimitSeconds(request.timeLimitSeconds());
        setting.setBaseScorePerSecond(request.baseScorePerSecond());
        return GameSettingResponse.from(setting);
    }

    public List<EventResponse> getEvents() {
        return eventRepository.findAllByOrderByStartAtDesc()
                .stream()
                .map(EventResponse::from)
                .toList();
    }

    @Transactional
    public EventResponse createEvent(EventRequest request) {
        validateEventWindow(request.startAt(), request.endAt());
        Event event = new Event();
        applyEventRequest(event, request);
        eventRepository.save(event);
        return EventResponse.from(event);
    }

    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        validateEventWindow(request.startAt(), request.endAt());
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event was not found"));
        applyEventRequest(event, request);
        return EventResponse.from(event);
    }

    public List<ScoreResponse> getRecentScores() {
        return scoreRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 50))
                .stream()
                .map(ScoreResponse::from)
                .toList();
    }

    private void applyEventRequest(Event event, EventRequest request) {
        event.setName(request.name());
        event.setDescription(request.description());
        event.setMultiplier(request.multiplier());
        event.setStartAt(request.startAt());
        event.setEndAt(request.endAt());
        event.setActive(request.active());
    }

    private void validateEventWindow(Instant startAt, Instant endAt) {
        if (!endAt.isAfter(startAt)) {
            throw new IllegalArgumentException("Event endAt must be after startAt");
        }
    }
}
