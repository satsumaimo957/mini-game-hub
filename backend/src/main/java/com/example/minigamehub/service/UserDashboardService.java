package com.example.minigamehub.service;

import com.example.minigamehub.dto.AchievementResponse;
import com.example.minigamehub.dto.ScoreResponse;
import com.example.minigamehub.dto.UserDashboardResponse;
import com.example.minigamehub.dto.UserResponse;
import com.example.minigamehub.entity.User;
import com.example.minigamehub.repository.ScoreRepository;
import com.example.minigamehub.repository.UserAchievementRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class UserDashboardService {
    private final CurrentUserService currentUserService;
    private final ScoreRepository scoreRepository;
    private final UserAchievementRepository userAchievementRepository;

    public UserDashboardService(
            CurrentUserService currentUserService,
            ScoreRepository scoreRepository,
            UserAchievementRepository userAchievementRepository
    ) {
        this.currentUserService = currentUserService;
        this.scoreRepository = scoreRepository;
        this.userAchievementRepository = userAchievementRepository;
    }

    public UserDashboardResponse getDashboard() {
        User user = currentUserService.getCurrentUser();
        return new UserDashboardResponse(
                UserResponse.from(user),
                scoreRepository.findBestScoreByUserId(user.getId()),
                scoreRepository.findByUser_IdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 20))
                        .stream()
                        .map(ScoreResponse::from)
                        .toList(),
                userAchievementRepository.findByUser_IdOrderByAchievedAtDesc(user.getId())
                        .stream()
                        .map(AchievementResponse::from)
                        .toList()
        );
    }
}
