import { RotateCcw, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../api";
import { PhaserGame } from "../game/PhaserGame";
import { UnityWebGLGame } from "../game/UnityWebGLGame";
import { useAuth } from "../context/AuthContext";
import type { Game, GameOverResult, GameSetting, ScoreSubmitResponse } from "../types";

export function GamePage() {
  const { token, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [setting, setSetting] = useState<GameSetting | null>(null);
  const [result, setResult] = useState<GameOverResult | null>(null);
  const [submitResult, setSubmitResult] = useState<ScoreSubmitResponse | null>(null);
  const [notice, setNotice] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedGameSlug = searchParams.get("game");
  const playableGames = games.filter((game) => game.gameType !== "UNITY_WEBGL" || Boolean(game.launchPath));
  const isUnityGame = selectedGame?.gameType === "UNITY_WEBGL";
  const descriptionLines = selectedGame?.description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean) ?? [];
  const showUnityTestSubmit = import.meta.env.DEV;

  useEffect(() => {
    apiFetch<Game[]>("/games")
      .then((items) => {
        setGames(items);
        const candidates = items.filter((game) => game.gameType !== "UNITY_WEBGL" || Boolean(game.launchPath));
        const game = candidates.find((item) => item.slug === selectedGameSlug || item.code === selectedGameSlug) ?? candidates[0] ?? null;
        setSelectedGame(game);
      })
      .catch((err) => setError(err.message));
  }, [selectedGameSlug]);

  useEffect(() => {
    if (!selectedGame) {
      setSetting(null);
      return;
    }

    setError("");
    setResult(null);
    setSubmitResult(null);
    setNotice("");
    apiFetch<GameSetting>(`/games/${selectedGame.id}/settings`)
      .then(setSetting)
      .catch((err) => setError(err.message));
  }, [selectedGame]);

  const handleGameOver = useCallback((gameResult: GameOverResult) => {
    setResult(gameResult);
    setSubmitResult(null);
  }, []);

  const submitScore = useCallback(async (gameResult?: GameOverResult, submitBySlug = false) => {
    const scoreResult = gameResult ?? result;
    if (!scoreResult || !setting || !selectedGame || !token) {
      return;
    }
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const response = await apiFetch<ScoreSubmitResponse>("/scores", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...(submitBySlug ? { gameSlug: selectedGame.slug } : { gameId: setting.gameId }),
          score: scoreResult.score,
          playTimeSeconds: scoreResult.playTimeSeconds
        })
      });
      setSubmitResult(response);
      setNotice("スコアを登録しました。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "スコア登録に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }, [result, selectedGame, setting, token]);

  const handleUnityGameFinished = useCallback((gameResult: GameOverResult) => {
    setResult(gameResult);
    setSubmitResult(null);
    if (!isAuthenticated) {
      setNotice("ログインするとスコアを登録できます。");
      return;
    }
    void submitScore(gameResult, true);
  }, [isAuthenticated, submitScore]);

  const sendUnityTestScore = useCallback(() => {
    const testResult = selectedGame?.slug === "shikoku-rush"
      ? { score: 2500, playTimeSeconds: 64, dodged: 0 }
      : { score: 1200, playTimeSeconds: 45, dodged: 0 };
    handleUnityGameFinished(testResult);
  }, [handleUnityGameFinished, selectedGame?.slug]);

  function restart() {
    setResult(null);
    setSubmitResult(null);
    setNotice("");
    setError("");
    setResetKey((value) => value + 1);
  }

  function selectGame(gameId: number) {
    const game = playableGames.find((item) => item.id === gameId);
    if (!game) {
      return;
    }
    setSearchParams({ game: game.slug });
    setSelectedGame(game);
    setResetKey((value) => value + 1);
  }

  return (
    <section className="game-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">{selectedGame?.name ?? "ミニゲーム"}</p>
          <h1>ゲームで遊んでスコアを登録</h1>
        </div>
        <Link className="button ghost" to="/ranking">ランキングを見る</Link>
      </div>

      {playableGames.length > 0 && (
        <div className="game-selector" aria-label="ゲームを選択">
          {playableGames.map((game) => (
            <button
              className={`game-tab${selectedGame?.id === game.id ? " active" : ""}`}
              key={game.id}
              type="button"
              onClick={() => selectGame(game.id)}
            >
              {game.name}
            </button>
          ))}
        </div>
      )}

      {setting && selectedGame ? (
        <div className="game-layout">
          <div className="game-stage">
            {isUnityGame ? (
              <UnityWebGLGame
                gameSlug={selectedGame.slug}
                launchPath={selectedGame.launchPath ?? ""}
                resetKey={resetKey}
                onGameFinished={handleUnityGameFinished}
              />
            ) : (
              <PhaserGame setting={setting} resetKey={resetKey} onGameOver={handleGameOver} />
            )}
          </div>
          <aside className="panel">
            <div className="game-guide">
              <h2>ゲーム説明</h2>
              {descriptionLines.length > 0 ? (
                descriptionLines.map((line, index) => <p key={`${selectedGame.slug}-description-${index}`}>{line}</p>)
              ) : (
                <p className="muted">ゲーム説明はまだ登録されていません。</p>
              )}
            </div>

            {!isUnityGame && (
              <>
                <h2>ゲーム設定</h2>
                <dl className="metric-list">
                  <div>
                    <dt>敵の速度</dt>
                    <dd>{setting.enemySpeed}</dd>
                  </div>
                  <div>
                    <dt>出現間隔</dt>
                    <dd>{setting.spawnRate} ms</dd>
                  </div>
                  <div>
                    <dt>制限時間</dt>
                    <dd>{setting.timeLimitSeconds}s</dd>
                  </div>
                  <div>
                    <dt>基本スコア</dt>
                    <dd>{setting.baseScorePerSecond}/s</dd>
                  </div>
                </dl>
              </>
            )}

            {isUnityGame && (
              <div className="unity-score-status">
                <h3>スコア自動連携</h3>
                <p className="muted">
                  ゲーム終了時に Unity から結果が自動で送信されます。
                </p>
                {showUnityTestSubmit && (
                  <button className="button compact" type="button" onClick={sendUnityTestScore} disabled={submitting}>
                    テスト用スコア送信
                  </button>
                )}
              </div>
            )}

            {result && (
              <div className="result-box">
                <strong>ゲームオーバー</strong>
                <p>スコア {result.score} / 時間 {result.playTimeSeconds}s / 回避 {result.dodged}</p>
                {isAuthenticated ? (
                  <button className="button primary full" type="button" onClick={() => submitScore()} disabled={submitting || Boolean(submitResult)}>
                    <Send size={16} aria-hidden="true" />
                    {submitting ? "登録中..." : submitResult ? "登録済み" : "スコアを登録"}
                  </button>
                ) : (
                  <Link className="button primary full" to="/login">ログインして登録</Link>
                )}
                <button className="button ghost full" type="button" onClick={restart}>
                  <RotateCcw size={16} aria-hidden="true" />
                  もう一度遊ぶ
                </button>
              </div>
            )}

            {submitResult && (
              <div className="result-box success">
                <strong>登録スコア: {submitResult.score.score}</strong>
                <p>元スコア {submitResult.score.originalScore} / イベント倍率 {submitResult.score.eventMultiplier}x</p>
                <div className="action-row compact-actions">
                  <Link className="button compact" to={`/ranking?game=${submitResult.score.gameSlug}`}>ランキング</Link>
                  <Link className="button compact" to="/mypage">マイページ</Link>
                </div>
                {submitResult.newAchievements.length > 0 ? (
                  <ul className="achievement-list">
                    {submitResult.newAchievements.map((achievement) => (
                      <li key={achievement.id}>{achievement.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">今回新しく獲得した実績はありません。</p>
                )}
              </div>
            )}
            {notice && <p className="success-text">{notice}</p>}
            {error && <p className="error-text">{error}</p>}
          </aside>
        </div>
      ) : (
        <p className="muted">ゲーム設定を読み込んでいます...</p>
      )}

      {playableGames.length === 0 && !setting && <p className="muted">ゲーム情報の読み込みを待っています。</p>}
    </section>
  );
}
