import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../api.js';
import Navbar from '../components/Navbar.jsx';
import JobForm, { STATUSES } from '../components/JobForm.jsx';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, job = edit
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [j, s] = await Promise.all([
        api.get('/jobs', { params: { status, search } }),
        api.get('/jobs/stats/summary'),
      ]);
      setJobs(j.data); setStats(s.data); setError('');
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (job) => {
    if (!window.confirm(`Delete ${job.position} at ${job.company}?`)) return;
    try { await api.delete(`/jobs/${job.id}`); load(); }
    catch (err) { setError(errorMessage(err)); }
  };

  const saved = () => { setEditing(null); load(); };

  return (
    <>
      <Navbar />
      <main className="page">
        <section className="stats">
          <button className={`stat ${status === '' ? 'on' : ''}`} onClick={() => setStatus('')}>
            <b>{stats.total}</b>All
          </button>
          {STATUSES.map((s) => (
            <button key={s} className={`stat ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>
              <b>{stats[s] ?? 0}</b>{s}
            </button>
          ))}
        </section>

        <section className="toolbar">
          <input placeholder="Search company, role or location" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn" onClick={() => setEditing({})}>Add application</button>
        </section>

        {error && <p className="error">{error}</p>}
        {loading ? <p className="center-note">Loading…</p> : jobs.length === 0 ? (
          <p className="center-note">{stats.total === 0 ? 'No applications yet. Add your first one to start tracking.' : 'No applications match this filter.'}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Company</th><th>Position</th><th>Status</th><th>Applied</th><th>Interview</th><th></th></tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td><b>{job.company}</b><div className="muted">{job.location}</div></td>
                    <td>
                      {job.job_url ? <a href={job.job_url} target="_blank" rel="noreferrer">{job.position}</a> : job.position}
                      <div className="muted">{job.salary}</div>
                    </td>
                    <td><span className="badge" data-status={job.status}>{job.status}</span></td>
                    <td>{job.applied_date || '–'}</td>
                    <td>{job.interview_date || '–'}<div className="muted">{job.interview_details}</div></td>
                    <td className="row-actions">
                      <button className="btn ghost small" onClick={() => setEditing(job)}>Edit</button>
                      <button className="btn danger small" onClick={() => remove(job)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {editing && <JobForm job={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={saved} />}
    </>
  );
}
