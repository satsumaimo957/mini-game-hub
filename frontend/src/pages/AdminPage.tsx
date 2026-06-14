import { CalendarPlus, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Achievement, EventItem, Game, GameSetting, Score } from "../types";
import { formatDate, toLocalInputValue } from "../utils";

interface EventForm {
  name: string;
  description: string;
  multiplier: string;
  startAt: string;
  endAt: string;
  active: boolean;
}

type NumericSettingField = "enemySpeed" | "spawnRate" | "timeLimitSeconds" | "baseScorePerSecond";

const now = new Date();
const initialEventForm: EventForm = {
  name: "週末ブースト",
  description: "期間中のスコア倍率を上げるローカルイベントです。",
  multiplier: "2.00",
  startAt: toLocalInputValue(now),
  endAt: toLocalInputValue(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
  active: true
};

export function AdminPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [eventForm, setEventForm] = useState<EventForm>(initialEventForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAdminData();
  }, [token]);

  async function loadAdminData() {
    if (!token) {
      return;
    }
    try {
      const [settingItems, gameItems, achievementItems, eventItems, scoreItems] = await Promise.all([
        apiFetch<GameSetting[]>("/admin/game-settings", { token }),
        apiFetch<Game[]>("/admin/games", { token }),
        apiFetch<Achievement[]>("/admin/achievements", { token }),
        apiFetch<EventItem[]>("/admin/events", { token }),
        apiFetch<Score[]>("/admin/scores", { token })
      ]);
      setSettings(settingItems);
      setGames(gameItems);
      setAchievements(achievementItems);
      setEvents(eventItems);
      setScores(scoreItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "管理データの読み込みに失敗しました。");
    }
  }

  function updateSetting(id: number, field: NumericSettingField, value: number) {
    setSettings((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  async function saveSetting(setting: GameSetting) {
    if (!token) {
      return;
    }
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch<GameSetting>(`/admin/game-settings/${setting.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          enemySpeed: setting.enemySpeed,
          spawnRate: setting.spawnRate,
          timeLimitSeconds: setting.timeLimitSeconds,
          baseScorePerSecond: setting.baseScorePerSecond
        })
      });
      setSettings((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setMessage("ゲーム設定を保存しました。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ゲーム設定の保存に失敗しました。");
    }
  }

  async function createEvent(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await apiFetch<EventItem>("/admin/events", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: eventForm.name,
          description: eventForm.description,
          multiplier: Number(eventForm.multiplier),
          startAt: new Date(eventForm.startAt).toISOString(),
          endAt: new Date(eventForm.endAt).toISOString(),
          active: eventForm.active
        })
      });
      setEventForm(initialEventForm);
      setMessage("イベントを作成しました。");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "イベント作成に失敗しました。");
    }
  }

  async function toggleEvent(eventItem: EventItem) {
    if (!token) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await apiFetch<EventItem>(`/admin/events/${eventItem.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          name: eventItem.name,
          description: eventItem.description,
          multiplier: eventItem.multiplier,
          startAt: eventItem.startAt,
          endAt: eventItem.endAt,
          active: !eventItem.active
        })
      });
      setMessage("イベント状態を更新しました。");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "イベント更新に失敗しました。");
    }
  }

  return (
    <section className="admin-grid">
      <div className="panel wide-panel">
        <div className="page-title-row">
          <div>
            <p className="eyebrow">運営管理</p>
            <h1>管理画面</h1>
          </div>
          {message && <span className="success-text">{message}</span>}
        </div>

        <div className="settings-grid">
          {settings.map((setting) => (
            <div className="setting-editor" key={setting.id}>
              <h2>{setting.gameName}</h2>
              <label>
                敵の速度
                <input
                  type="number"
                  value={setting.enemySpeed}
                  onChange={(event) => updateSetting(setting.id, "enemySpeed", Number(event.target.value))}
                />
              </label>
              <label>
                出現間隔 ms
                <input
                  type="number"
                  value={setting.spawnRate}
                  onChange={(event) => updateSetting(setting.id, "spawnRate", Number(event.target.value))}
                />
              </label>
              <label>
                制限時間 秒
                <input
                  type="number"
                  value={setting.timeLimitSeconds}
                  onChange={(event) => updateSetting(setting.id, "timeLimitSeconds", Number(event.target.value))}
                />
              </label>
              <label>
                1秒あたりの基本スコア
                <input
                  type="number"
                  value={setting.baseScorePerSecond}
                  onChange={(event) => updateSetting(setting.id, "baseScorePerSecond", Number(event.target.value))}
                />
              </label>
              <button className="button primary" type="button" onClick={() => saveSetting(setting)}>
                <Save size={16} aria-hidden="true" />
                保存
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel wide-panel">
        <h2>ゲーム一覧</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名前</th>
                <th>Slug</th>
                <th>種類</th>
                <th>起動パス</th>
                <th>ランキング</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>{game.name}</td>
                  <td>{game.slug}</td>
                  <td>{game.gameType}</td>
                  <td>{game.launchPath ?? "-"}</td>
                  <td><a href={`/ranking?game=${game.slug}`}>開く</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <CalendarPlus size={20} aria-hidden="true" />
          <h2>イベント作成</h2>
        </div>
        <form className="stack-form" onSubmit={createEvent}>
          <label>
            名前
            <input value={eventForm.name} onChange={(event) => setEventForm({ ...eventForm, name: event.target.value })} required />
          </label>
          <label>
            説明
            <textarea
              value={eventForm.description}
              onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })}
              required
            />
          </label>
          <label>
            倍率
            <input
              type="number"
              min="1"
              max="10"
              step="0.01"
              value={eventForm.multiplier}
              onChange={(event) => setEventForm({ ...eventForm, multiplier: event.target.value })}
            />
          </label>
          <label>
            開始
            <input
              type="datetime-local"
              value={eventForm.startAt}
              onChange={(event) => setEventForm({ ...eventForm, startAt: event.target.value })}
            />
          </label>
          <label>
            終了
            <input
              type="datetime-local"
              value={eventForm.endAt}
              onChange={(event) => setEventForm({ ...eventForm, endAt: event.target.value })}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={eventForm.active}
              onChange={(event) => setEventForm({ ...eventForm, active: event.target.checked })}
            />
            有効
          </label>
          <button className="button primary full" type="submit">イベントを作成</button>
        </form>
      </div>

      <div className="panel">
        <h2>イベント一覧</h2>
        <div className="list">
          {events.map((eventItem) => (
            <div className="list-row event-row" key={eventItem.id}>
              <div>
                <strong>{eventItem.name}</strong>
                <p>{eventItem.multiplier}x / {formatDate(eventItem.startAt)} - {formatDate(eventItem.endAt)}</p>
              </div>
              <button className={eventItem.active ? "button compact danger" : "button compact"} type="button" onClick={() => toggleEvent(eventItem)}>
                {eventItem.active ? "無効にする" : "有効にする"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel wide-panel">
        <h2>実績一覧</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>コード</th>
                <th>名前</th>
                <th>対象ゲーム</th>
                <th>条件</th>
                <th>値</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((achievement) => (
                <tr key={achievement.id}>
                  <td>{achievement.code}</td>
                  <td>{achievement.name}</td>
                  <td>{achievement.gameName ?? "全ゲーム共通"}</td>
                  <td>{achievement.conditionType}</td>
                  <td>{achievement.conditionValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel wide-panel">
        <h2>最近のスコア</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ユーザー</th>
                <th>ゲーム</th>
                <th>スコア</th>
                <th>イベント</th>
                <th>日時</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr key={score.id}>
                  <td>{score.username}</td>
                  <td>{score.gameName}</td>
                  <td>{score.score}</td>
                  <td>{score.eventName ?? "-"}</td>
                  <td>{formatDate(score.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
