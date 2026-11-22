import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(errorMessage(err)); }
  };

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h1>Sign in</h1>
        <p className="muted">Pick up where your job search left off.</p>
        {error && <p className="error">{error}</p>}
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn full">Sign in</button>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
