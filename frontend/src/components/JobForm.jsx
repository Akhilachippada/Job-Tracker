import { useState } from 'react';
import api, { errorMessage } from '../api.js';

export const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

const empty = {
  company: '', position: '', location: '', status: 'Applied', applied_date: '',
  interview_date: '', interview_details: '', job_url: '', salary: '', notes: '',
};

export default function JobForm({ job, onClose, onSaved }) {
  const [form, setForm] = useState(
    job ? { ...empty, ...Object.fromEntries(Object.entries(job).map(([k, v]) => [k, v ?? ''])) } : empty
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (job) await api.put(`/jobs/${job.id}`, form);
      else await api.post('/jobs', form);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{job ? 'Edit application' : 'Add application'}</h2>
        {error && <p className="error">{error}</p>}
        <div className="grid">
          <label>Company *<input name="company" value={form.company} onChange={set} required /></label>
          <label>Position *<input name="position" value={form.position} onChange={set} required /></label>
          <label>Location<input name="location" value={form.location} onChange={set} /></label>
          <label>Status
            <select name="status" value={form.status} onChange={set}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Applied on<input type="date" name="applied_date" value={form.applied_date} onChange={set} /></label>
          <label>Interview on<input type="date" name="interview_date" value={form.interview_date} onChange={set} /></label>
          <label>Salary<input name="salary" value={form.salary} onChange={set} placeholder="e.g. 8 LPA" /></label>
          <label>Job link<input type="url" name="job_url" value={form.job_url} onChange={set} placeholder="https://" /></label>
        </div>
        <label>Interview details<textarea name="interview_details" rows="2" value={form.interview_details} onChange={set} placeholder="Round, interviewer, mode, topics to prepare" /></label>
        <label>Notes<textarea name="notes" rows="2" value={form.notes} onChange={set} /></label>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save application'}</button>
        </div>
      </form>
    </div>
  );
}
