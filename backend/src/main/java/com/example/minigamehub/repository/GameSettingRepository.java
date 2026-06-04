package com.example.minigamehub.repository;

import com.example.minigamehub.entity.GameSetting;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameSettingRepository extends JpaRepository<GameSetting, Long> {
    Optional<GameSetting> findByGame_Id(Long gameId);
}
