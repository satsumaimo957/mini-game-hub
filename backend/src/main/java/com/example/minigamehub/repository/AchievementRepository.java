package com.example.minigamehub.repository;

import com.example.minigamehub.entity.Achievement;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Optional<Achievement> findByCode(String code);

    List<Achievement> findByGame_IdOrGameIsNull(Long gameId);
}
