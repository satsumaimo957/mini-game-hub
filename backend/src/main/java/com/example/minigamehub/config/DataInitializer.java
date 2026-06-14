package com.example.minigamehub.config;

import com.example.minigamehub.entity.Achievement;
import com.example.minigamehub.entity.AchievementConditionType;
import com.example.minigamehub.entity.Event;
import com.example.minigamehub.entity.Game;
import com.example.minigamehub.entity.GameSetting;
import com.example.minigamehub.entity.GameType;
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
import org.springframework.jdbc.core.JdbcTemplate;
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
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate
    ) {
        return args -> {
            updateAchievementConditionConstraint(jdbcTemplate);

            createUserIfMissing(userRepository, passwordEncoder, "admin", "admin@example.com", "password", Role.ADMIN);
            createUserIfMissing(userRepository, passwordEncoder, "player", "user@example.com", "password", Role.USER);

            Game game = gameRepository.findByCode("dodge-runner")
                    .orElseGet(() -> {
                        Game created = new Game();
                        created.setCode("dodge-runner");
                        created.setName("ドッジランナー");
                        created.setDescription("アリーナ内を動き回り、落ちてくるブロックを避けるゲームです。");
                        created.setActive(true);
                        return gameRepository.save(created);
                    });
            configureGame(
                    gameRepository,
                    game,
                    "ドッジランナー",
                    "アリーナ内を動き回り、落ちてくるブロックを避けるゲームです。",
                    GameType.PHASER,
                    null
            );

            gameSettingRepository.findByGame_Id(game.getId()).orElseGet(() -> {
                GameSetting setting = new GameSetting();
                setting.setGame(game);
                setting.setEnemySpeed(220);
                setting.setSpawnRate(720);
                setting.setTimeLimitSeconds(60);
                setting.setBaseScorePerSecond(20);
                return gameSettingRepository.save(setting);
            });

            Game noStrike = gameRepository.findByCode("no-strike")
                    .orElseGet(() -> {
                        Game created = new Game();
                        created.setCode("no-strike");
                        created.setName("No Strike");
                        created.setDescription("障害物を避けながら生存時間を伸ばす3Dアクションゲーム");
                        created.setActive(true);
                        return gameRepository.save(created);
                    });
            configureGame(
                    gameRepository,
                    noStrike,
                    "No Strike",
                    "障害物を避けながら生存時間を伸ばす3Dアクションゲーム",
                    GameType.UNITY_WEBGL,
                    "/unity-games/no-strike/index.html"
            );

            gameSettingRepository.findByGame_Id(noStrike.getId()).orElseGet(() -> {
                GameSetting setting = new GameSetting();
                setting.setGame(noStrike);
                setting.setEnemySpeed(0);
                setting.setSpawnRate(0);
                setting.setTimeLimitSeconds(60);
                setting.setBaseScorePerSecond(0);
                return gameSettingRepository.save(setting);
            });

            achievementIfMissing(
                    achievementRepository,
                    "FIRST_PLAY",
                    "初プレイ",
                    "初めてスコアを登録する。",
                    null,
                    AchievementConditionType.FIRST_PLAY,
                    1
            );
            achievementIfMissing(
                    achievementRepository,
                    "PLAY_10",
                    "10回プレイ",
                    "スコアを10回登録する。",
                    null,
                    AchievementConditionType.PLAY_COUNT,
                    10
            );
            achievementIfMissing(
                    achievementRepository,
                    "SCORE_1000",
                    "スコア1000突破",
                    "スコア1000点以上を達成する。",
                    null,
                    AchievementConditionType.SCORE_AT_LEAST,
                    1000
            );
            achievementIfMissing(
                    achievementRepository,
                    "SCORE_5000",
                    "スコア5000突破",
                    "スコア5000点以上を達成する。",
                    null,
                    AchievementConditionType.SCORE_AT_LEAST,
                    5000
            );
            achievementIfMissing(
                    achievementRepository,
                    "RANKING_FIRST",
                    "ランキング1位",
                    "ゲーム別ランキングで1位を獲得する。",
                    null,
                    AchievementConditionType.RANKING_FIRST,
                    1
            );
            achievementIfMissing(
                    achievementRepository,
                    "NO_STRIKE_FIRST_PLAY",
                    "No Strike 初プレイ",
                    "No Strike のスコアを初めて登録する。",
                    noStrike,
                    AchievementConditionType.FIRST_PLAY,
                    1
            );
            achievementIfMissing(
                    achievementRepository,
                    "NO_STRIKE_SCORE_1000",
                    "No Strike スコア1000突破",
                    "No Strike でスコア1000点以上を達成する。",
                    noStrike,
                    AchievementConditionType.SCORE_AT_LEAST,
                    1000
            );
            achievementIfMissing(
                    achievementRepository,
                    "NO_STRIKE_SCORE_3000",
                    "No Strike スコア3000突破",
                    "No Strike でスコア3000点以上を達成する。",
                    noStrike,
                    AchievementConditionType.SCORE_AT_LEAST,
                    3000
            );
            achievementIfMissing(
                    achievementRepository,
                    "NO_STRIKE_SURVIVE_60",
                    "No Strike 60秒生存",
                    "No Strike で60秒以上生存する。",
                    noStrike,
                    AchievementConditionType.SURVIVE_SECONDS_AT_LEAST,
                    60
            );

            if (eventRepository.count() == 0) {
                Event event = new Event();
                event.setName("スタートダッシュ 1.5x");
                event.setDescription("登録スコアが1.5倍になるローカル用のサンプルイベントです。");
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
            Game game,
            AchievementConditionType conditionType,
            int conditionValue
    ) {
        achievementRepository.findByCode(code).map((achievement) -> {
            achievement.setCode(code);
            achievement.setName(name);
            achievement.setDescription(description);
            achievement.setGame(game);
            achievement.setConditionType(conditionType);
            achievement.setConditionValue(conditionValue);
            return achievementRepository.save(achievement);
        }).orElseGet(() -> {
            Achievement achievement = new Achievement();
            achievement.setCode(code);
            achievement.setName(name);
            achievement.setDescription(description);
            achievement.setGame(game);
            achievement.setConditionType(conditionType);
            achievement.setConditionValue(conditionValue);
            return achievementRepository.save(achievement);
        });
    }

    private void configureGame(
            GameRepository gameRepository,
            Game game,
            String name,
            String description,
            GameType gameType,
            String launchPath
    ) {
        game.setName(name);
        game.setDescription(description);
        game.setGameType(gameType);
        game.setLaunchPath(launchPath);
        game.setActive(true);
        gameRepository.save(game);
    }

    private void updateAchievementConditionConstraint(JdbcTemplate jdbcTemplate) {
        jdbcTemplate.execute("alter table achievements drop constraint if exists achievements_condition_type_check");
        jdbcTemplate.execute("""
                alter table achievements
                add constraint achievements_condition_type_check
                check (condition_type in (
                    'FIRST_PLAY',
                    'PLAY_COUNT',
                    'SCORE_AT_LEAST',
                    'SURVIVE_SECONDS_AT_LEAST',
                    'RANKING_FIRST'
                ))
                """);
    }
}
