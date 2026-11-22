import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await register(form.name, form.email, form.password); navigate('/'); }
    catch (err) { setError(errorMessage(err)); }
  };

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create account</h1>
        <p className="muted">Keep every application, interview and offer in one list.</p>
        {error && <p className="error">{error}</p>}
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password (6+ characters)<input type="password" minLength="6" required value={form.password} onChange={set('password')} /></label>
        <button className="btn full">Create account</button>
        <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </main>
  );
}
