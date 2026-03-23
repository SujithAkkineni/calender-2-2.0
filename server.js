const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./calendar.db');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  console.log('Database tables ready');
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User created' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// Event Routes (Protected)
app.get('/api/events', authenticateToken, (req, res) => {
  db.all('SELECT * FROM events WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const user_id = req.user.id;

  // Check for conflicts for this user
  db.get('SELECT COUNT(*) as count FROM events WHERE user_id = ? AND start_time < ? AND end_time > ?', [user_id, end_time, start_time], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count > 0) return res.status(400).json({ error: 'Time conflict with existing event' });

    db.run('INSERT INTO events (title, description, start_time, end_time, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, start_time, end_time, user_id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
  });
});

app.put('/api/events/:id', authenticateToken, (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const user_id = req.user.id;

  db.get('SELECT COUNT(*) as count FROM events WHERE user_id = ? AND start_time < ? AND end_time > ? AND id != ?', [user_id, end_time, start_time, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count > 0) return res.status(400).json({ error: 'Time conflict with existing event' });

    db.run('UPDATE events SET title=?, description=?, start_time=?, end_time=? WHERE id=? AND user_id=?',
      [title, description, start_time, end_time, req.params.id, user_id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Event not found or unauthorized' });
      res.json({ message: 'Event updated' });
    });
  });
});

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM events WHERE id=? AND user_id=?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Event not found or unauthorized' });
    res.json({ message: 'Event deleted' });
  });
});

// Serve frontend in production (or deployable build)
app.use(express.static(path.join(__dirname, 'client/build')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
