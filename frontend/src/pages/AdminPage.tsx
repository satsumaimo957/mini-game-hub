import { CalendarPlus, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";
import type { EventItem, GameSetting, Score } from "../types";
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
  name: "Weekend Boost",
  description: "Temporary score multiplier for local play sessions.",
  multiplier: "2.00",
  startAt: toLocalInputValue(now),
  endAt: toLocalInputValue(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
  active: true
};

export function AdminPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<GameSetting[]>([]);
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
      const [settingItems, eventItems, scoreItems] = await Promise.all([
        apiFetch<GameSetting[]>("/admin/game-settings", { token }),
        apiFetch<EventItem[]>("/admin/events", { token }),
        apiFetch<Score[]>("/admin/scores", { token })
      ]);
      setSettings(settingItems);
      setEvents(eventItems);
      setScores(scoreItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
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
      setMessage("Game setting saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save setting");
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
      setMessage("Event created.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
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
      setMessage("Event status updated.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    }
  }

  return (
    <section className="admin-grid">
      <div className="panel wide-panel">
        <div className="page-title-row">
          <div>
            <p className="eyebrow">Operations</p>
            <h1>Admin Console</h1>
          </div>
          {message && <span className="success-text">{message}</span>}
        </div>

        <div className="settings-grid">
          {settings.map((setting) => (
            <div className="setting-editor" key={setting.id}>
              <h2>{setting.gameName}</h2>
              <label>
                Enemy speed
                <input
                  type="number"
                  value={setting.enemySpeed}
                  onChange={(event) => updateSetting(setting.id, "enemySpeed", Number(event.target.value))}
                />
              </label>
              <label>
                Spawn rate ms
                <input
                  type="number"
                  value={setting.spawnRate}
                  onChange={(event) => updateSetting(setting.id, "spawnRate", Number(event.target.value))}
                />
              </label>
              <label>
                Time limit seconds
                <input
                  type="number"
                  value={setting.timeLimitSeconds}
                  onChange={(event) => updateSetting(setting.id, "timeLimitSeconds", Number(event.target.value))}
                />
              </label>
              <label>
                Base score per second
                <input
                  type="number"
                  value={setting.baseScorePerSecond}
                  onChange={(event) => updateSetting(setting.id, "baseScorePerSecond", Number(event.target.value))}
                />
              </label>
              <button className="button primary" type="button" onClick={() => saveSetting(setting)}>
                <Save size={16} aria-hidden="true" />
                Save
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <CalendarPlus size={20} aria-hidden="true" />
          <h2>Create Event</h2>
        </div>
        <form className="stack-form" onSubmit={createEvent}>
          <label>
            Name
            <input value={eventForm.name} onChange={(event) => setEventForm({ ...eventForm, name: event.target.value })} required />
          </label>
          <label>
            Description
            <textarea
              value={eventForm.description}
              onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })}
              required
            />
          </label>
          <label>
            Multiplier
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
            Start
            <input
              type="datetime-local"
              value={eventForm.startAt}
              onChange={(event) => setEventForm({ ...eventForm, startAt: event.target.value })}
            />
          </label>
          <label>
            End
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
            Active
          </label>
          <button className="button primary full" type="submit">Create event</button>
        </form>
      </div>

      <div className="panel">
        <h2>Events</h2>
        <div className="list">
          {events.map((eventItem) => (
            <div className="list-row event-row" key={eventItem.id}>
              <div>
                <strong>{eventItem.name}</strong>
                <p>{eventItem.multiplier}x / {formatDate(eventItem.startAt)} - {formatDate(eventItem.endAt)}</p>
              </div>
              <button className={eventItem.active ? "button compact danger" : "button compact"} type="button" onClick={() => toggleEvent(eventItem)}>
                {eventItem.active ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel wide-panel">
        <h2>Recent Scores</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Game</th>
                <th>Score</th>
                <th>Event</th>
                <th>Date</th>
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
