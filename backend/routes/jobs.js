const express = require('express');
const db = require('../config/db');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];
const blank = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim());

function clean(body) {
  return {
    company: blank(body.company),
    position: blank(body.position),
    location: blank(body.location),
    status: body.status || 'Applied',
    applied_date: blank(body.applied_date),
    interview_date: blank(body.interview_date),
    interview_details: blank(body.interview_details),
    job_url: blank(body.job_url),
    salary: blank(body.salary),
    notes: blank(body.notes),
  };
}

function validate(j) {
  if (!j.company || !j.position) return 'Company and position are required';
  if (!STATUSES.includes(j.status)) return 'Invalid status';
  return null;
}

router.get('/stats/summary', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT status, COUNT(*) AS count FROM jobs WHERE user_id = ? GROUP BY status', [req.user.id]);
    const stats = { total: 0 };
    STATUSES.forEach((s) => (stats[s] = 0));
    rows.forEach((r) => { stats[r.status] = r.count; stats.total += r.count; });
    res.json(stats);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT * FROM jobs WHERE user_id = ?';
    const params = [req.user.id];
    if (status && STATUSES.includes(status)) { sql += ' AND status = ?'; params.push(status); }
    if (search) {
      sql += ' AND (company LIKE ? OR position LIKE ? OR location LIKE ?)';
      const q = `%${search}%`; params.push(q, q, q);
    }
    sql += ' ORDER BY created_at DESC, id DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Job not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const j = clean(req.body);
    const err = validate(j);
    if (err) return res.status(400).json({ message: err });
    const [r] = await db.query(
      `INSERT INTO jobs (user_id, company, position, location, status, applied_date, interview_date,
        interview_details, job_url, salary, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, j.company, j.position, j.location, j.status, j.applied_date, j.interview_date,
       j.interview_details, j.job_url, j.salary, j.notes]);
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const j = clean(req.body);
    const err = validate(j);
    if (err) return res.status(400).json({ message: err });
    const [r] = await db.query(
      `UPDATE jobs SET company=?, position=?, location=?, status=?, applied_date=?, interview_date=?,
        interview_details=?, job_url=?, salary=?, notes=? WHERE id=? AND user_id=?`,
      [j.company, j.position, j.location, j.status, j.applied_date, j.interview_date,
       j.interview_details, j.job_url, j.salary, j.notes, req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Job not found' });
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [r] = await db.query('DELETE FROM jobs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
