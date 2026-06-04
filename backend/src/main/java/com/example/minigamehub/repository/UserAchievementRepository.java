package com.example.minigamehub.repository;

import com.example.minigamehub.entity.UserAchievement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    boolean existsByUser_IdAndAchievement_Id(Long userId, Long achievementId);

    List<UserAchievement> findByUser_IdOrderByAchievedAtDesc(Long userId);
}
