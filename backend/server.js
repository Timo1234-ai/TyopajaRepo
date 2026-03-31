const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const db = require('./database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);

// Serve built frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// GET all devices
app.get('/api/devices', (req, res) => {
  const devices = db.prepare('SELECT * FROM devices ORDER BY id ASC').all();
  res.json(devices);
});

// GET single device
app.get('/api/devices/:id', (req, res) => {
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
});

// POST create device
app.post('/api/devices', (req, res) => {
  const { name, type, brand, model, serial_number, quantity, location, status } = req.body;

  if (!name || !type || !serial_number) {
    return res.status(400).json({ error: 'Name, type, and serial number are required' });
  }

  const validTypes = ['switch', 'access_point', 'router'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Type must be switch, access_point, or router' });
  }

  const existing = db.prepare('SELECT id FROM devices WHERE serial_number = ?').get(serial_number);
  if (existing) {
    return res.status(409).json({ error: 'A device with this serial number already exists' });
  }

  const result = db.prepare(
    `INSERT INTO devices (name, type, brand, model, serial_number, quantity, location, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(name, type, brand || '', model || '', serial_number, quantity || 1, location || '', status || 'active');

  const newDevice = db.prepare('SELECT * FROM devices WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newDevice);
});

// PATCH update device quantity
app.patch('/api/devices/:id/quantity', (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  db.prepare('UPDATE devices SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
  const updated = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PUT update device
app.put('/api/devices/:id', (req, res) => {
  const { name, type, brand, model, serial_number, quantity, location, status } = req.body;

  if (!name || !type || !serial_number) {
    return res.status(400).json({ error: 'Name, type, and serial number are required' });
  }

  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  const conflict = db.prepare('SELECT id FROM devices WHERE serial_number = ? AND id != ?').get(serial_number, req.params.id);
  if (conflict) {
    return res.status(409).json({ error: 'A device with this serial number already exists' });
  }

  db.prepare(
    `UPDATE devices SET name=?, type=?, brand=?, model=?, serial_number=?, quantity=?, location=?, status=? WHERE id=?`
  ).run(name, type, brand || '', model || '', serial_number, quantity || 1, location || '', status || 'active', req.params.id);

  const updated = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE device
app.delete('/api/devices/:id', (req, res) => {
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  db.prepare('DELETE FROM devices WHERE id = ?').run(req.params.id);
  res.json({ message: 'Device deleted successfully' });
});

// Rate limiting for static file fallback
const staticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

// Fallback: serve frontend for any non-API route
app.get('/{*path}', staticLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Inventory app running on http://localhost:${PORT}`);
});
