const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

// MySQL Connection Pool Configuration
const db = mysql.createPool({
  uri: process.env.DB_URI,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize Tables
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  
  // Users table
  connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255)
    )
  `, (err) => {
    if (err) console.error("Error creating users table:", err);
  });

  // Events table
  connection.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_time VARCHAR(255) NOT NULL,
      end_time VARCHAR(255) NOT NULL,
      user_id INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) console.error("Error creating events table:", err);
    else console.log('Database tables ready');
  });

  connection.release();
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
    db.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name], function (err, results) {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
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
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const user = results[0];
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// Event Routes (Protected)
app.get('/api/events', authenticateToken, (req, res) => {
  db.query('SELECT * FROM events WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/events', authenticateToken, (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const user_id = req.user.id;

  // Check for conflicts for this user
  db.query('SELECT COUNT(*) as count FROM events WHERE user_id = ? AND start_time < ? AND end_time > ?', [user_id, end_time, start_time], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const row = results[0];
    if (row.count > 0) return res.status(400).json({ error: 'Time conflict with existing event' });

    db.query('INSERT INTO events (title, description, start_time, end_time, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, start_time, end_time, user_id], function (err, insertResults) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: insertResults.insertId });
      });
  });
});

app.put('/api/events/:id', authenticateToken, (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const user_id = req.user.id;

  db.query('SELECT COUNT(*) as count FROM events WHERE user_id = ? AND start_time < ? AND end_time > ? AND id != ?', [user_id, end_time, start_time, req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const row = results[0];
    if (row.count > 0) return res.status(400).json({ error: 'Time conflict with existing event' });

    db.query('UPDATE events SET title=?, description=?, start_time=?, end_time=? WHERE id=? AND user_id=?',
      [title, description, start_time, end_time, req.params.id, user_id], function (err, updateResults) {
        if (err) return res.status(500).json({ error: err.message });
        if (updateResults.affectedRows === 0) return res.status(404).json({ error: 'Event not found or unauthorized' });
        res.json({ message: 'Event updated' });
      });
  });
});

app.delete('/api/events/:id', authenticateToken, (req, res) => {
  db.query('DELETE FROM events WHERE id=? AND user_id=?', [req.params.id, req.user.id], function (err, deleteResults) {
    if (err) return res.status(500).json({ error: err.message });
    if (deleteResults.affectedRows === 0) return res.status(404).json({ error: 'Event not found or unauthorized' });
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
