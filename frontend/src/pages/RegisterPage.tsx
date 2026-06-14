import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="form-panel" onSubmit={handleSubmit}>
        <h1>新規登録</h1>
        <label>
          ユーザー名
          <input value={username} onChange={(event) => setUsername(event.target.value)} required maxLength={50} />
        </label>
        <label>
          メールアドレス
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          パスワード
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            minLength={6}
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="button primary full" type="submit" disabled={loading}>
          {loading ? "作成中..." : "アカウントを作成"}
        </button>
        <p className="muted">
          すでにアカウントをお持ちの場合は <Link to="/login">ログイン</Link>
        </p>
      </form>
    </section>
  );
}
