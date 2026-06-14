package com.example.minigamehub.dto;

import com.example.minigamehub.entity.Game;

public record GameResponse(
        Long id,
        String code,
        String slug,
        String name,
        String description,
        String gameType,
        String launchPath,
        boolean active
) {
    public static GameResponse from(Game game) {
        return new GameResponse(
                game.getId(),
                game.getCode(),
                game.getCode(),
                game.getName(),
                game.getDescription(),
                game.getGameType() == null ? "PHASER" : game.getGameType().name(),
                game.getLaunchPath(),
                game.isActive()
        );
    }
}
