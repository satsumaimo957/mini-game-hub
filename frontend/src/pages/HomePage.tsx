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
        <p className="eyebrow">ローカルで遊べるミニゲーム集</p>
        <h1>Mini Game Hub</h1>
        <p className="lead">
          ブラウザゲームを遊んで、スコアや実績を記録できます。管理画面からイベントやゲーム設定も調整できます。
        </p>
        <div className="action-row">
          <Link className="button primary" to="/game">
            <Play size={18} aria-hidden="true" />
            ゲームを始める
          </Link>
          <Link className="button ghost" to="/ranking">
            <Trophy size={18} aria-hidden="true" />
            ランキング
          </Link>
        </div>
      </div>

      <div className="side-stack">
        <section className="panel">
          <div className="section-heading">
            <CalendarClock size={20} aria-hidden="true" />
            <h2>開催中イベント</h2>
          </div>
          {event ? (
            <div className="event-summary">
              <strong>{event.name}</strong>
              <p>{event.description}</p>
              <dl className="metric-list">
                <div>
                  <dt>倍率</dt>
                  <dd>{event.multiplier}x</dd>
                </div>
                <div>
                  <dt>終了</dt>
                  <dd>{formatDate(event.endAt)}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="muted">現在開催中のイベントはありません。</p>
          )}
        </section>

        <section className="panel">
          <div className="section-heading">
            <ArrowRight size={20} aria-hidden="true" />
            <h2>遊べるゲーム</h2>
          </div>
          {games.filter((game) => game.gameType !== "UNITY_WEBGL" || Boolean(game.launchPath)).length > 0 ? (
            <div className="list">
              {games
                .filter((game) => game.gameType !== "UNITY_WEBGL" || Boolean(game.launchPath))
                .map((game) => (
                <div className="list-row" key={game.id}>
                  <div>
                    <strong>{game.name}</strong>
                    <p>{game.description}</p>
                  </div>
                  <Link className="button compact" to={`/game?game=${game.slug}`}>遊ぶ</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">ゲーム情報を読み込み中です。</p>
          )}
        </section>
        {error && <p className="error-text">{error}</p>}
      </div>
    </section>
  );
}
