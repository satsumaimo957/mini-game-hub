package com.example.minigamehub.repository;

import com.example.minigamehub.entity.Score;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    @Query("""
            select s from Score s
            where s.game.id = :gameId
            order by s.score desc, s.createdAt asc
            """)
    List<Score> findRanking(@Param("gameId") Long gameId, Pageable pageable);

    @Query("""
            select s from Score s
            where s.game.code = :gameSlug
            order by s.score desc, s.createdAt asc
            """)
    List<Score> findRankingByGameSlug(@Param("gameSlug") String gameSlug, Pageable pageable);

    List<Score> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Score> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByUser_Id(Long userId);

    long countByUser_IdAndGame_Id(Long userId, Long gameId);

    Optional<Score> findFirstByGame_IdOrderByScoreDescCreatedAtAsc(Long gameId);

    @Query("select coalesce(max(s.score), 0) from Score s where s.user.id = :userId")
    int findBestScoreByUserId(@Param("userId") Long userId);
}
