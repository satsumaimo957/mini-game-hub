import { Award, History, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";
import type { UserDashboard } from "../types";
import { formatDate } from "../utils";

export function MyPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }
    apiFetch<UserDashboard>("/users/me/dashboard", { token })
      .then(setDashboard)
      .catch((err) => setError(err.message));
  }, [token]);

  if (!dashboard) {
    return <p className="muted">Loading your page...</p>;
  }

  return (
    <section className="dashboard-grid">
      <div className="panel">
        <div className="section-heading">
          <UserCircle size={20} aria-hidden="true" />
          <h1>My Page</h1>
        </div>
        <dl className="metric-list">
          <div>
            <dt>Username</dt>
            <dd>{dashboard.user.username}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{dashboard.user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{dashboard.user.role}</dd>
          </div>
          <div>
            <dt>Best score</dt>
            <dd>{dashboard.bestScore}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <div className="section-heading">
          <Award size={20} aria-hidden="true" />
          <h2>Achievements</h2>
        </div>
        {dashboard.achievements.length > 0 ? (
          <ul className="achievement-list">
            {dashboard.achievements.map((achievement) => (
              <li key={achievement.id}>
                <strong>{achievement.name}</strong>
                <span>{achievement.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No achievements yet.</p>
        )}
      </div>

      <div className="panel wide-panel dashboard-history">
        <div className="section-heading">
          <History size={20} aria-hidden="true" />
          <h2>Play History</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Game</th>
                <th>Score</th>
                <th>Time</th>
                <th>Event</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.playHistory.map((score) => (
                <tr key={score.id}>
                  <td>{score.gameName}</td>
                  <td>{score.score}</td>
                  <td>{score.playTimeSeconds}s</td>
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
