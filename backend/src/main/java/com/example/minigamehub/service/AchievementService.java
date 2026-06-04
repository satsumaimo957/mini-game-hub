package com.example.minigamehub.service;

import com.example.minigamehub.dto.AchievementResponse;
import com.example.minigamehub.entity.Achievement;
import com.example.minigamehub.entity.AchievementConditionType;
import com.example.minigamehub.entity.Score;
import com.example.minigamehub.entity.User;
import com.example.minigamehub.entity.UserAchievement;
import com.example.minigamehub.repository.AchievementRepository;
import com.example.minigamehub.repository.ScoreRepository;
import com.example.minigamehub.repository.UserAchievementRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AchievementService {
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final ScoreRepository scoreRepository;

    public AchievementService(
            AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository,
            ScoreRepository scoreRepository
    ) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.scoreRepository = scoreRepository;
    }

    @Transactional
    public List<AchievementResponse> evaluate(User user, Score latestScore) {
        long playCount = scoreRepository.countByUser_Id(user.getId());
        boolean rankingFirst = scoreRepository
                .findFirstByGame_IdOrderByScoreDescCreatedAtAsc(latestScore.getGame().getId())
                .map(score -> score.getUser().getId().equals(user.getId()))
                .orElse(false);

        List<AchievementResponse> awarded = new ArrayList<>();
        for (Achievement achievement : achievementRepository.findAll()) {
            if (userAchievementRepository.existsByUser_IdAndAchievement_Id(user.getId(), achievement.getId())) {
                continue;
            }

            if (isAchieved(achievement, latestScore, playCount, rankingFirst)) {
                UserAchievement userAchievement = new UserAchievement();
                userAchievement.setUser(user);
                userAchievement.setAchievement(achievement);
                userAchievementRepository.save(userAchievement);
                awarded.add(AchievementResponse.from(userAchievement));
            }
        }
        return awarded;
    }

    private boolean isAchieved(
            Achievement achievement,
            Score latestScore,
            long playCount,
            boolean rankingFirst
    ) {
        AchievementConditionType type = achievement.getConditionType();
        int value = achievement.getConditionValue();
        return switch (type) {
            case FIRST_PLAY -> playCount >= 1;
            case PLAY_COUNT -> playCount >= value;
            case SCORE_AT_LEAST -> latestScore.getScore() >= value;
            case RANKING_FIRST -> rankingFirst;
        };
    }
}
