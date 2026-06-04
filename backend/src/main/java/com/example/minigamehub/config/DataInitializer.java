package com.example.minigamehub.config;

import com.example.minigamehub.entity.Achievement;
import com.example.minigamehub.entity.AchievementConditionType;
import com.example.minigamehub.entity.Event;
import com.example.minigamehub.entity.Game;
import com.example.minigamehub.entity.GameSetting;
import com.example.minigamehub.entity.Role;
import com.example.minigamehub.entity.User;
import com.example.minigamehub.repository.AchievementRepository;
import com.example.minigamehub.repository.EventRepository;
import com.example.minigamehub.repository.GameRepository;
import com.example.minigamehub.repository.GameSettingRepository;
import com.example.minigamehub.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            GameRepository gameRepository,
            GameSettingRepository gameSettingRepository,
            AchievementRepository achievementRepository,
            EventRepository eventRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            createUserIfMissing(userRepository, passwordEncoder, "admin", "admin@example.com", "password", Role.ADMIN);
            createUserIfMissing(userRepository, passwordEncoder, "player", "user@example.com", "password", Role.USER);

            Game game = gameRepository.findByCode("dodge-runner")
                    .orElseGet(() -> {
                        Game created = new Game();
                        created.setCode("dodge-runner");
                        created.setName("Dodge Runner");
                        created.setDescription("Move around the arena and avoid incoming blocks.");
                        created.setActive(true);
                        return gameRepository.save(created);
                    });

            gameSettingRepository.findByGame_Id(game.getId()).orElseGet(() -> {
                GameSetting setting = new GameSetting();
                setting.setGame(game);
                setting.setEnemySpeed(220);
                setting.setSpawnRate(720);
                setting.setTimeLimitSeconds(60);
                setting.setBaseScorePerSecond(20);
                return gameSettingRepository.save(setting);
            });

            achievementIfMissing(
                    achievementRepository,
                    "FIRST_PLAY",
                    "First Play",
                    "Submit your first score.",
                    AchievementConditionType.FIRST_PLAY,
                    1
            );
            achievementIfMissing(
                    achievementRepository,
                    "PLAY_10",
                    "10 Plays",
                    "Submit scores 10 times.",
                    AchievementConditionType.PLAY_COUNT,
                    10
            );
            achievementIfMissing(
                    achievementRepository,
                    "SCORE_1000",
                    "Score 1000",
                    "Reach a score of at least 1000.",
                    AchievementConditionType.SCORE_AT_LEAST,
                    1000
            );
            achievementIfMissing(
                    achievementRepository,
                    "SCORE_5000",
                    "Score 5000",
                    "Reach a score of at least 5000.",
                    AchievementConditionType.SCORE_AT_LEAST,
                    5000
            );
            achievementIfMissing(
                    achievementRepository,
                    "RANKING_FIRST",
                    "Top Rank",
                    "Hold first place on a game ranking.",
                    AchievementConditionType.RANKING_FIRST,
                    1
            );

            if (eventRepository.count() == 0) {
                Event event = new Event();
                event.setName("Starter Boost 1.5x");
                event.setDescription("A local sample event that multiplies submitted scores by 1.5.");
                event.setMultiplier(new BigDecimal("1.50"));
                event.setStartAt(Instant.now().minus(1, ChronoUnit.DAYS));
                event.setEndAt(Instant.now().plus(30, ChronoUnit.DAYS));
                event.setActive(true);
                eventRepository.save(event);
            }
        };
    }

    private void createUserIfMissing(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String username,
            String email,
            String password,
            Role role
    ) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);
    }

    private void achievementIfMissing(
            AchievementRepository achievementRepository,
            String code,
            String name,
            String description,
            AchievementConditionType conditionType,
            int conditionValue
    ) {
        achievementRepository.findByCode(code).orElseGet(() -> {
            Achievement achievement = new Achievement();
            achievement.setCode(code);
            achievement.setName(name);
            achievement.setDescription(description);
            achievement.setConditionType(conditionType);
            achievement.setConditionValue(conditionValue);
            return achievementRepository.save(achievement);
        });
    }
}
