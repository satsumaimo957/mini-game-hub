import { ArrowRight, CalendarClock, Play, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import type { EventItem, Game } from "../types";
import { formatDate } from "../utils";

export function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<Game[]>("/games"),
      apiFetch<EventItem | null>("/events/current")
    ])
      .then(([gameItems, currentEvent]) => {
        setGames(gameItems);
        setEvent(currentEvent);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="page-grid">
      <div className="intro-panel">
        <p className="eyebrow">Local mini game platform</p>
        <h1>Mini Game Hub</h1>
        <p className="lead">
          Play browser games, submit scores, track achievements, and tune game operations from the admin console.
        </p>
        <div className="action-row">
          <Link className="button primary" to="/game">
            <Play size={18} aria-hidden="true" />
            Start Game
          </Link>
          <Link className="button ghost" to="/ranking">
            <Trophy size={18} aria-hidden="true" />
            Ranking
          </Link>
        </div>
      </div>

      <div className="side-stack">
        <section className="panel">
          <div className="section-heading">
            <CalendarClock size={20} aria-hidden="true" />
            <h2>Current Event</h2>
          </div>
          {event ? (
            <div className="event-summary">
              <strong>{event.name}</strong>
              <p>{event.description}</p>
              <dl className="metric-list">
                <div>
                  <dt>Multiplier</dt>
                  <dd>{event.multiplier}x</dd>
                </div>
                <div>
                  <dt>Until</dt>
                  <dd>{formatDate(event.endAt)}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="muted">No active event right now.</p>
          )}
        </section>

        <section className="panel">
          <div className="section-heading">
            <ArrowRight size={20} aria-hidden="true" />
            <h2>Available Games</h2>
          </div>
          {games.length > 0 ? (
            <div className="list">
              {games.map((game) => (
                <div className="list-row" key={game.id}>
                  <div>
                    <strong>{game.name}</strong>
                    <p>{game.description}</p>
                  </div>
                  <Link className="button compact" to="/game">Play</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Backend data has not loaded yet.</p>
          )}
        </section>
        {error && <p className="error-text">{error}</p>}
      </div>
    </section>
  );
}
