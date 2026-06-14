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
    return <p className="muted">マイページを読み込んでいます...</p>;
  }

  return (
    <section className="dashboard-grid">
      <div className="panel">
        <div className="section-heading">
          <UserCircle size={20} aria-hidden="true" />
          <h1>マイページ</h1>
        </div>
        <dl className="metric-list">
          <div>
            <dt>ユーザー名</dt>
            <dd>{dashboard.user.username}</dd>
          </div>
          <div>
            <dt>メールアドレス</dt>
            <dd>{dashboard.user.email}</dd>
          </div>
          <div>
            <dt>権限</dt>
            <dd>{dashboard.user.role}</dd>
          </div>
          <div>
            <dt>最高スコア</dt>
            <dd>{dashboard.bestScore}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <div className="section-heading">
          <Award size={20} aria-hidden="true" />
          <h2>実績</h2>
        </div>
        {dashboard.achievements.length > 0 ? (
          <ul className="achievement-list">
            {dashboard.achievements.map((achievement) => (
              <li key={achievement.id}>
                <strong>{achievement.name}</strong>
                <span className="muted">{achievement.gameName ?? "全ゲーム共通"}</span>
                <span>{achievement.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">まだ実績はありません。</p>
        )}
      </div>

      <div className="panel wide-panel dashboard-history">
        <div className="section-heading">
          <History size={20} aria-hidden="true" />
          <h2>プレイ履歴</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ゲーム</th>
                <th>スコア</th>
                <th>時間</th>
                <th>イベント</th>
                <th>日時</th>
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
