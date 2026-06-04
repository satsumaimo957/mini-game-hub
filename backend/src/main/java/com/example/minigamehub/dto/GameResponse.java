package com.example.minigamehub.dto;

import com.example.minigamehub.entity.Game;

public record GameResponse(
        Long id,
        String code,
        String name,
        String description,
        boolean active
) {
    public static GameResponse from(Game game) {
        return new GameResponse(
                game.getId(),
                game.getCode(),
                game.getName(),
                game.getDescription(),
                game.isActive()
        );
    }
}
