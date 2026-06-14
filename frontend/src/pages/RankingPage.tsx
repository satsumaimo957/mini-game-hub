import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../api";
import type { Game, RankingEntry } from "../types";
import { formatDate } from "../utils";

export function RankingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameSlug, setSelectedGameSlug] = useState("");
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [error, setError] = useState("");
  const queryGameSlug = searchParams.get("game");

  useEffect(() => {
    apiFetch<Game[]>("/games")
      .then((items) => {
        setGames(items);
        const selected = items.find((game) => game.slug === queryGameSlug || game.code === queryGameSlug) ?? items[0];
        setSelectedGameSlug(selected?.slug ?? "");
      })
      .catch((err) => setError(err.message));
  }, [queryGameSlug]);

  useEffect(() => {
    if (!selectedGameSlug) {
      return;
    }
    apiFetch<RankingEntry[]>(`/games/${selectedGameSlug}/ranking`)
      .then(setRanking)
      .catch((err) => setError(err.message));
  }, [selectedGameSlug]);

  function selectGame(gameSlug: string) {
    setSelectedGameSlug(gameSlug);
    setSearchParams({ game: gameSlug });
  }

  return (
    <section className="panel wide-panel">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">上位10件</p>
          <h1>ランキング</h1>
        </div>
        <select value={selectedGameSlug} onChange={(event) => selectGame(event.target.value)}>
          {games.map((game) => (
            <option key={game.id} value={game.slug}>{game.name}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ユーザー</th>
              <th>スコア</th>
              <th>時間</th>
              <th>ゲーム</th>
              <th>日時</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry) => (
              <tr key={`${entry.gameSlug}-${entry.rank}-${entry.username}-${entry.createdAt}`}>
                <td>{entry.rank}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
                <td>{entry.playTimeSeconds}s</td>
                <td>{entry.gameName}</td>
                <td>{formatDate(entry.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ranking.length === 0 && <p className="muted">まだスコアがありません。</p>}
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
