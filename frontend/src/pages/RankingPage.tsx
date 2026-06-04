import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import type { Game, Score } from "../types";
import { formatDate } from "../utils";

export function RankingPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [ranking, setRanking] = useState<Score[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Game[]>("/games")
      .then((items) => {
        setGames(items);
        setSelectedGameId(items[0]?.id ?? null);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedGameId) {
      return;
    }
    apiFetch<Score[]>(`/games/${selectedGameId}/ranking`)
      .then(setRanking)
      .catch((err) => setError(err.message));
  }, [selectedGameId]);

  return (
    <section className="panel wide-panel">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Top 10</p>
          <h1>Ranking</h1>
        </div>
        <select value={selectedGameId ?? ""} onChange={(event) => setSelectedGameId(Number(event.target.value))}>
          {games.map((game) => (
            <option key={game.id} value={game.id}>{game.name}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Score</th>
              <th>Original</th>
              <th>Event</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((score, index) => (
              <tr key={score.id}>
                <td>{index + 1}</td>
                <td>{score.username}</td>
                <td>{score.score}</td>
                <td>{score.originalScore}</td>
                <td>{score.eventName ?? "-"}</td>
                <td>{formatDate(score.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ranking.length === 0 && <p className="muted">No scores yet.</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
