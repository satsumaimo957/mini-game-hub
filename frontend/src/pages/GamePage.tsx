import { RotateCcw, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { PhaserGame } from "../game/PhaserGame";
import { useAuth } from "../context/AuthContext";
import type { Game, GameOverResult, GameSetting, ScoreSubmitResponse } from "../types";

export function GamePage() {
  const { token, isAuthenticated } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [setting, setSetting] = useState<GameSetting | null>(null);
  const [result, setResult] = useState<GameOverResult | null>(null);
  const [submitResult, setSubmitResult] = useState<ScoreSubmitResponse | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Game[]>("/games")
      .then(async (items) => {
        setGames(items);
        if (items[0]) {
          setSetting(await apiFetch<GameSetting>(`/games/${items[0].id}/settings`));
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleGameOver = useCallback((gameResult: GameOverResult) => {
    setResult(gameResult);
    setSubmitResult(null);
  }, []);

  async function submitScore() {
    if (!result || !setting || !token) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await apiFetch<ScoreSubmitResponse>("/scores", {
        method: "POST",
        token,
        body: JSON.stringify({
          gameId: setting.gameId,
          score: result.score,
          playTimeSeconds: result.playTimeSeconds
        })
      });
      setSubmitResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Score submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setResult(null);
    setSubmitResult(null);
    setError("");
    setResetKey((value) => value + 1);
  }

  return (
    <section className="game-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Dodge Runner</p>
          <h1>Survive and submit your score</h1>
        </div>
        <Link className="button ghost" to="/ranking">View ranking</Link>
      </div>

      {setting ? (
        <div className="game-layout">
          <div className="game-stage">
            <PhaserGame setting={setting} resetKey={resetKey} onGameOver={handleGameOver} />
          </div>
          <aside className="panel">
            <h2>Game Settings</h2>
            <dl className="metric-list">
              <div>
                <dt>Enemy speed</dt>
                <dd>{setting.enemySpeed}</dd>
              </div>
              <div>
                <dt>Spawn rate</dt>
                <dd>{setting.spawnRate} ms</dd>
              </div>
              <div>
                <dt>Time limit</dt>
                <dd>{setting.timeLimitSeconds}s</dd>
              </div>
              <div>
                <dt>Base score</dt>
                <dd>{setting.baseScorePerSecond}/s</dd>
              </div>
            </dl>

            {result && (
              <div className="result-box">
                <strong>Game over</strong>
                <p>Score {result.score} / Time {result.playTimeSeconds}s / Dodged {result.dodged}</p>
                {isAuthenticated ? (
                  <button className="button primary full" type="button" onClick={submitScore} disabled={submitting || Boolean(submitResult)}>
                    <Send size={16} aria-hidden="true" />
                    {submitting ? "Submitting..." : submitResult ? "Submitted" : "Submit score"}
                  </button>
                ) : (
                  <Link className="button primary full" to="/login">Log in to submit</Link>
                )}
                <button className="button ghost full" type="button" onClick={restart}>
                  <RotateCcw size={16} aria-hidden="true" />
                  Play again
                </button>
              </div>
            )}

            {submitResult && (
              <div className="result-box success">
                <strong>Saved score: {submitResult.score.score}</strong>
                <p>Original {submitResult.score.originalScore} / Multiplier {submitResult.score.eventMultiplier}x</p>
                {submitResult.newAchievements.length > 0 ? (
                  <ul className="achievement-list">
                    {submitResult.newAchievements.map((achievement) => (
                      <li key={achievement.id}>{achievement.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No new achievements this run.</p>
                )}
              </div>
            )}
            {error && <p className="error-text">{error}</p>}
          </aside>
        </div>
      ) : (
        <p className="muted">Loading game settings...</p>
      )}

      {games.length === 0 && !setting && <p className="muted">Waiting for backend game data.</p>}
    </section>
  );
}
