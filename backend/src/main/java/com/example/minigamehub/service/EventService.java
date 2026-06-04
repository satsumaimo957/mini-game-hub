package com.example.minigamehub.service;

import com.example.minigamehub.dto.EventResponse;
import com.example.minigamehub.entity.Event;
import com.example.minigamehub.repository.EventRepository;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class EventService {
    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Optional<Event> getCurrentEventEntity() {
        return eventRepository.findCurrentActive(Instant.now(), PageRequest.of(0, 1))
                .stream()
                .findFirst();
    }

    public Optional<EventResponse> getCurrentEvent() {
        return getCurrentEventEntity().map(EventResponse::from);
    }
}
