import { Gamepad2, LogOut, Shield, Trophy, UserCircle } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="app-header">
      <Link className="brand" to="/">
        <Gamepad2 size={24} aria-hidden="true" />
        <span>Mini Game Hub</span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/game">Game</NavLink>
        <NavLink to="/ranking">
          <Trophy size={16} aria-hidden="true" />
          Ranking
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/mypage">
            <UserCircle size={16} aria-hidden="true" />
            My Page
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin">
            <Shield size={16} aria-hidden="true" />
            Admin
          </NavLink>
        )}
      </nav>
      <div className="auth-actions">
        {isAuthenticated ? (
          <>
            <span className="user-chip">{user?.username}</span>
            <button className="icon-button" type="button" onClick={logout} title="Log out" aria-label="Log out">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <Link className="button ghost" to="/login">Log in</Link>
            <Link className="button primary" to="/register">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
