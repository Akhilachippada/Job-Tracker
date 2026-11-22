import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="nav">
      <span className="brand">Job Tracker</span>
      <div className="nav-right">
        <span>{user?.name}</span>
        <button className="btn ghost" onClick={logout}>Sign out</button>
      </div>
    </header>
  );
}
