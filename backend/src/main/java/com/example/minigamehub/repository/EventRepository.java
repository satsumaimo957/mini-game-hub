package com.example.minigamehub.repository;

import com.example.minigamehub.entity.Event;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long> {
    @Query("""
            select e from Event e
            where e.active = true and e.startAt <= :now and e.endAt >= :now
            order by e.startAt desc
            """)
    List<Event> findCurrentActive(@Param("now") Instant now, Pageable pageable);

    List<Event> findAllByOrderByStartAtDesc();
}
