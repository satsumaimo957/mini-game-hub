package com.example.minigamehub.repository;

import com.example.minigamehub.entity.Game;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<Game, Long> {
    Optional<Game> findByCode(String code);

    boolean existsByCode(String code);

    List<Game> findByActiveTrueOrderByIdAsc();
}
