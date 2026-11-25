let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (err) {
  console.error('\n======================================================');
  console.error('❌ ERROR CRÍTICO AL INICIAR EL SERVIDOR');
  console.error('SQLite nativo requiere Node.js 22+ con la bandera:');
  console.error('   node --experimental-sqlite server.js');
  console.error('O ejecuta directamente:');
  console.error('   npm start');
  console.error('======================================================\n');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4800;
const JWT_SECRET = process.env.JWT_SECRET || 'insignia_super_secret_jwt_key_2026_rio_cuarto';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Insignia2026!';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Carpetas de datos y subidas
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Inicialización de SQLite
const db = new DatabaseSync(path.join(DATA_DIR, 'insignia.db'));

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS lots (
    id INTEGER PRIMARY KEY,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lot_id INTEGER,
    name TEXT,
    phone TEXT,
    email TEXT,
    dni TEXT,
    amount REAL,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS accreditations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    dni TEXT,
    email TEXT,
    phone TEXT,
    auction_deadline TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT,
    event_title TEXT,
    event_date TEXT,
    name TEXT,
    phone TEXT,
    email TEXT,
    guests INTEGER,
    notes TEXT,
    created_at TEXT
  );
`);

// Migración retrocompatible si la tabla bids o accreditations ya existían sin nuevas columnas
try {
  db.exec('ALTER TABLE bids ADD COLUMN dni TEXT;');
} catch (_) {}

try {
  db.exec('ALTER TABLE accreditations ADD COLUMN auction_deadline TEXT;');
} catch (_) {}

// Semilla inicial si la base de datos es nueva
function initSeed() {
  const getPass = db.prepare('SELECT value FROM config WHERE key = ?').get('admin_password');
  if (!getPass) {
    console.log('[DB] Inicializando contraseña del Administrador...');
    const hashed = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
    db.prepare('INSERT INTO config (key, value) VALUES (?, ?)').run('admin_password', hashed);
  }

  const lotsCount = db.prepare('SELECT COUNT(*) as count FROM lots').get().count;
  if (lotsCount === 0) {
    console.log('[DB] Inicializando catálogo oficial con 23 lotes...');
    try {
      const defaults = JSON.parse(fs.readFileSync(path.join(__dirname, 'defaults.json'), 'utf-8'));
      
      const insertLot = db.prepare('INSERT INTO lots (id, data) VALUES (?, ?)');
      for (const lot of defaults.lots) {
        insertLot.run(lot.id, JSON.stringify(lot));
      }

      const insertGal = db.prepare('INSERT INTO gallery (id, data) VALUES (?, ?)');
      for (const item of defaults.gallery) {
        insertGal.run(item.id, JSON.stringify(item));
      }

      db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('deadline', defaults.deadline);
      console.log('[DB] Catálogo oficial cargado exitosamente.');
    } catch (err) {
      console.error('[DB] Error cargando defaults.json:', err);
    }
  }
}
initSeed();

// -------------------------------------------------------------
// CABECERAS DE SEGURIDAD Y MIDDLEWARES
// -------------------------------------------------------------
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Cabeceras HTTP de protección
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Configuración CORS
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Servir archivos estáticos subidos
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/uploads', express.static(UPLOADS_DIR));

// Configuración de Multer para subida segura de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `obra-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) && (mime.startsWith('image/') || mime === 'image/svg+xml')) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes válidas (.jpg, .jpeg, .png, .webp, .svg)'));
  }
});

// Middleware de autenticación JWT para rutas protegidas
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// -------------------------------------------------------------
// CONTROL DE RATE LIMITING (EN MEMORIA)
// -------------------------------------------------------------
const loginAttempts = new Map();
const bidAttempts = new Map();
const accreditationAttempts = new Map();

function getClientIp(req) {
  return req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || '127.0.0.1';
}

// Helper para limpiar periódicamente mapas de memoria cada 30 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of loginAttempts.entries()) {
    if (val.lockUntil < now && now - val.lastAttempt > 3600000) loginAttempts.delete(key);
  }
  for (const [key, val] of bidAttempts.entries()) {
    if (now - val.firstAttempt > 60000) bidAttempts.delete(key);
  }
  for (const [key, val] of accreditationAttempts.entries()) {
    if (now - val.firstAttempt > 60000) accreditationAttempts.delete(key);
  }
}, 30 * 60 * 1000);

// -------------------------------------------------------------
// RUTAS DE AUTENTICACIÓN
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lockUntil: 0, lastAttempt: now };
  attempt.lastAttempt = now;

  if (attempt.lockUntil > now) {
    const remainingMin = Math.ceil((attempt.lockUntil - now) / 60000);
    return res.status(429).json({
      error: `Demasiados intentos fallidos. Acceso bloqueado por ${remainingMin} minuto(s).`
    });
  }

  const { password, pin } = req.body;
  const inputPass = password || pin;

  if (!inputPass) {
    return res.status(400).json({ error: 'Debes proporcionar la contraseña o PIN de acceso' });
  }

  const row = db.prepare('SELECT value FROM config WHERE key = ?').get('admin_password');
  if (!row) {
    return res.status(500).json({ error: 'Error interno en la configuración de seguridad' });
  }

  const isValid = bcrypt.compareSync(String(inputPass).trim(), row.value);

  if (!isValid) {
    attempt.count += 1;
    if (attempt.count >= 5) {
      attempt.lockUntil = now + 15 * 60 * 1000; // Bloqueo de 15 minutos
      loginAttempts.set(ip, attempt);
      return res.status(429).json({
        error: 'Has superado el límite de 5 intentos. Acceso bloqueado temporalmente por 15 minutos.'
      });
    }
    loginAttempts.set(ip, attempt);
    return res.status(401).json({
      error: 'Contraseña o PIN incorrecto',
      attemptsLeft: 5 - attempt.count
    });
  }

  // Éxito: reinicia intentos y emite JWT firmado por 7 días
  loginAttempts.delete(ip);
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    role: 'admin',
    message: 'Acceso autorizado correctamente'
  });
});

app.get('/api/auth/verify', requireAuth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Debes proporcionar la contraseña actual y la nueva' });
  }

  if (String(newPassword).trim().length < 4) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' });
  }

  const row = db.prepare('SELECT value FROM config WHERE key = ?').get('admin_password');
  if (!bcrypt.compareSync(String(currentPassword).trim(), row.value)) {
    return res.status(400).json({ error: 'La contraseña actual no es correcta' });
  }

  const hashedNew = bcrypt.hashSync(String(newPassword).trim(), 10);
  db.prepare('UPDATE config SET value = ? WHERE key = ?').run(hashedNew, 'admin_password');

  res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
});

// -------------------------------------------------------------
// RUTAS DE DATOS PÚBLICAS Y PROTEGIDAS
// -------------------------------------------------------------

// Verificación de estado del servidor (Health Check)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Obtener todos los datos del sitio (Público)
app.get('/api/data', (req, res) => {
  try {
    const lotRows = db.prepare('SELECT data FROM lots ORDER BY id ASC').all();
    const lots = lotRows.map(r => JSON.parse(r.data));

    const eventRows = db.prepare('SELECT data FROM events').all();
    const events = eventRows.map(r => JSON.parse(r.data));

    const galRows = db.prepare('SELECT data FROM gallery').all();
    const gallery = galRows.map(r => JSON.parse(r.data));

    const deadlineRow = db.prepare('SELECT value FROM config WHERE key = ?').get('deadline');
    const deadline = deadlineRow ? deadlineRow.value : '2026-12-02T00:00';

    const galleryIntroRow = db.prepare('SELECT value FROM config WHERE key = ?').get('galleryIntro');
    let galleryIntro = null;
    if (galleryIntroRow) {
      try { galleryIntro = JSON.parse(galleryIntroRow.value); } catch (_) { galleryIntro = null; }
    }

    const homeRow = db.prepare('SELECT value FROM config WHERE key = ?').get('home');
    let home = null;
    if (homeRow) {
      try { home = JSON.parse(homeRow.value); } catch (_) { home = null; }
    }

    res.json({ lots, events, gallery, deadline, galleryIntro, home });
  } catch (err) {
    console.error('Error al consultar datos:', err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Guardar Lotes (Protegido)
app.put('/api/lots', requireAuth, (req, res) => {
  const lots = req.body;
  if (!Array.isArray(lots)) {
    return res.status(400).json({ error: 'Formato inválido: se esperaba un array de lotes' });
  }

  try {
    db.exec('BEGIN TRANSACTION');
    db.exec('DELETE FROM lots');
    const insert = db.prepare('INSERT INTO lots (id, data) VALUES (?, ?)');
    for (const lot of lots) {
      insert.run(lot.id, JSON.stringify(lot));
    }
    db.exec('COMMIT');
    res.json({ success: true, count: lots.length });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Error guardando lotes:', err);
    res.status(500).json({ error: 'Error guardando lotes en la base de datos' });
  }
});

// Guardar Eventos (Protegido)
app.put('/api/events', requireAuth, (req, res) => {
  const events = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Formato inválido: se esperaba un array de eventos' });
  }

  try {
    db.exec('BEGIN TRANSACTION');
    db.exec('DELETE FROM events');
    const insert = db.prepare('INSERT INTO events (id, data) VALUES (?, ?)');
    for (const ev of events) {
      insert.run(String(ev.id), JSON.stringify(ev));
    }
    db.exec('COMMIT');
    res.json({ success: true, count: events.length });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Error guardando eventos:', err);
    res.status(500).json({ error: 'Error guardando eventos' });
  }
});

// Guardar Galería (Protegido)
app.put('/api/gallery', requireAuth, (req, res) => {
  const gallery = req.body;
  if (!Array.isArray(gallery)) {
    return res.status(400).json({ error: 'Formato inválido: se esperaba un array de fotos' });
  }

  try {
    db.exec('BEGIN TRANSACTION');
    db.exec('DELETE FROM gallery');
    const insert = db.prepare('INSERT INTO gallery (id, data) VALUES (?, ?)');
    for (const item of gallery) {
      insert.run(String(item.id), JSON.stringify(item));
    }
    db.exec('COMMIT');
    res.json({ success: true, count: gallery.length });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Error guardando galería:', err);
    res.status(500).json({ error: 'Error guardando galería' });
  }
});

// Guardar Fecha límite (Protegido)
app.put('/api/deadline', requireAuth, (req, res) => {
  const { deadline } = req.body;
  if (!deadline) {
    return res.status(400).json({ error: 'Fecha requerida' });
  }
  try {
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('deadline', deadline);
    res.json({ success: true, deadline });
  } catch (err) {
    res.status(500).json({ error: 'Error guardando fecha límite' });
  }
});

// Guardar texto introductorio de la Galería (Protegido)
app.put('/api/gallery-intro', requireAuth, (req, res) => {
  const { title, text } = req.body || {};
  const intro = {
    title: String(title || '').slice(0, 200),
    text: String(text || '').slice(0, 5000),
  };
  try {
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('galleryIntro', JSON.stringify(intro));
    res.json({ success: true, galleryIntro: intro });
  } catch (err) {
    res.status(500).json({ error: 'Error guardando texto de la galería' });
  }
});

// Subida de archivos / imágenes (Protegido)
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

// -------------------------------------------------------------
// SISTEMA DE PREOFERTAS (BIDS)
// -------------------------------------------------------------

// Registrar Preoferta en tiempo real (Público con protección anti-spam)
app.post('/api/bids', (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const bidInfo = bidAttempts.get(ip) || { count: 0, firstAttempt: now };

  if (now - bidInfo.firstAttempt > 60000) {
    bidInfo.count = 1;
    bidInfo.firstAttempt = now;
  } else {
    bidInfo.count += 1;
    if (bidInfo.count > 10) {
      return res.status(429).json({
        error: 'Demasiadas solicitudes de preoferta. Por favor espera un minuto antes de intentar nuevamente.'
      });
    }
  }
  bidAttempts.set(ip, bidInfo);

  const { lotId, name, phone, email, dni, amount } = req.body;

  const lotIdNum = parseInt(lotId, 10);
  const amountNum = parseFloat(amount);

  if (isNaN(lotIdNum) || isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Monto u obra inválida' });
  }

  // Sanitización de datos
  const safeName = String(name || 'Anónimo').trim().slice(0, 100);
  const safePhone = String(phone || '').trim().slice(0, 50);
  const safeEmail = String(email || '').trim().slice(0, 120);
  const safeDni = String(dni || '').trim().slice(0, 30);

  if (!safeName || !safePhone || !safeEmail || !safeDni) {
    return res.status(400).json({ error: 'Todos los datos de contacto y DNI son obligatorios para garantizar la seriedad de la preoferta.' });
  }

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(safeEmail)) {
    return res.status(400).json({ error: 'El correo electrónico ingresado no tiene un formato válido.' });
  }

  try {
    const lotRow = db.prepare('SELECT data FROM lots WHERE id = ?').get(lotIdNum);
    if (!lotRow) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    const lot = JSON.parse(lotRow.data);
    const currentPrice = lot.currentPrice || lot.priceValue || 0;
    const BID_INCREMENT = 50; // Escalón de puja de a $USD 50
    const minRequired = currentPrice + BID_INCREMENT;

    if (amountNum < minRequired) {
      return res.status(400).json({
        error: `La preoferta mínima requerida es de $USD ${minRequired.toLocaleString('es-AR')} (las posturas aumentan en escalones de $USD 50).`
      });
    }

    // Registrar oferta en base de datos SQLite
    const createdAt = new Date().toISOString();
    db.prepare(`
      INSERT INTO bids (lot_id, name, phone, email, dni, amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      lotIdNum,
      safeName,
      safePhone,
      safeEmail,
      safeDni,
      amountNum,
      createdAt
    );

    // Actualizar precio actual y contador de ofertas en el lote
    lot.currentPrice = amountNum;
    lot.bidsCount = (lot.bidsCount || 0) + 1;
    db.prepare('UPDATE lots SET data = ? WHERE id = ?').run(JSON.stringify(lot), lotIdNum);

    res.json({
      success: true,
      updatedLot: lot,
      bid: {
        lotId: lotIdNum,
        amount: amountNum,
        createdAt
      }
    });
  } catch (err) {
    console.error('Error registrando oferta:', err);
    res.status(500).json({ error: 'Error interno al procesar la preoferta' });
  }
});

// Obtener estado público resumido de preofertas (Público, sin exponer datos personales)
app.get('/api/bids/public', (req, res) => {
  try {
    const bids = db.prepare('SELECT lot_id, amount, created_at FROM bids ORDER BY id ASC').all();
    const summary = {};
    for (const b of bids) {
      if (!summary[b.lot_id] || b.amount > summary[b.lot_id].highestBid) {
        summary[b.lot_id] = {
          highestBid: b.amount,
          date: b.created_at,
          bidsCount: (summary[b.lot_id]?.bidsCount || 0) + 1
        };
      } else {
        summary[b.lot_id].bidsCount += 1;
      }
    }
    res.json({ preoffers: summary });
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar preofertas públicas' });
  }
});

// Ver historial completo de preofertas con datos de contacto (Protegido para el Admin)
app.get('/api/bids', requireAuth, (req, res) => {
  try {
    const bids = db.prepare('SELECT * FROM bids ORDER BY id DESC').all();
    res.json({ bids });
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar ofertas' });
  }
});

// Guardar contenido editable de la página de Inicio (Protegido)
app.put('/api/home', requireAuth, (req, res) => {
  const b = req.body || {};
  const str = (v, max) => String(v == null ? '' : v).slice(0, max);
  const home = {
    heroTitle: str(b.heroTitle, 300),
    heroSlides: Array.isArray(b.heroSlides)
      ? b.heroSlides.slice(0, 12).map((x) => str(x, 500)).filter(Boolean)
      : [],
    artistsTitle: str(b.artistsTitle, 200),
    artistsIntro: str(b.artistsIntro, 2000),
    servicesTitle: str(b.servicesTitle, 200),
    services: Array.isArray(b.services)
      ? b.services.slice(0, 12).map((x) => ({
          title: str(x && x.title, 120),
          text: str(x && x.text, 600),
          image: str(x && x.image, 500),
        }))
      : [],
  };
  try {
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run('home', JSON.stringify(home));
    res.json({ success: true, home });
  } catch (err) {
    console.error('Error guardando Inicio:', err);
    res.status(500).json({ error: 'Error guardando el contenido de Inicio' });
  }
});

// Registrar solicitud de reserva de asistencia a un evento (Público)
const reservationAttempts = new Map();
app.post('/api/reservations', (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const info = reservationAttempts.get(ip) || { count: 0, firstAttempt: now };
  if (now - info.firstAttempt > 60000) {
    info.count = 1;
    info.firstAttempt = now;
  } else {
    info.count += 1;
    if (info.count > 8) {
      return res.status(429).json({ error: 'Demasiadas solicitudes. Esperá un minuto antes de reintentar.' });
    }
  }
  reservationAttempts.set(ip, info);

  try {
    const { eventId, eventTitle, eventDate, name, phone, email, guests, notes } = req.body || {};
    const safeName = String(name || '').trim().slice(0, 100);
    const safePhone = String(phone || '').trim().slice(0, 50);
    const safeEmail = String(email || '').trim().slice(0, 120);
    if (!safeName || !safePhone) {
      return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
    }
    if (safeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido' });
    }
    let safeGuests = parseInt(guests, 10);
    if (isNaN(safeGuests) || safeGuests < 1) safeGuests = 1;
    if (safeGuests > 20) safeGuests = 20;

    db.prepare(`
      INSERT INTO reservations (event_id, event_title, event_date, name, phone, email, guests, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      String(eventId || '').slice(0, 80),
      String(eventTitle || '').slice(0, 200),
      String(eventDate || '').slice(0, 80),
      safeName,
      safePhone,
      safeEmail,
      safeGuests,
      String(notes || '').trim().slice(0, 500),
      new Date().toISOString()
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error al registrar reserva:', err);
    res.status(500).json({ error: 'Error al registrar la reserva' });
  }
});

// Ver solicitudes de reserva (Protegido para el Admin)
app.get('/api/reservations', requireAuth, (req, res) => {
  try {
    const reservations = db.prepare('SELECT * FROM reservations ORDER BY id DESC').all();
    res.json({ reservations });
  } catch (err) {
    console.error('Error al listar reservas:', err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Eliminar una solicitud de reserva (Protegido para el Admin)
app.delete('/api/reservations/:id', requireAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    const r = db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
    if (r.changes === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar reserva:', err);
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
});

// Registrar acreditación de visitante para el catálogo de subastas
app.post('/api/accreditations', (req, res) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const accInfo = accreditationAttempts.get(ip) || { count: 0, firstAttempt: now };

  if (now - accInfo.firstAttempt > 60000) {
    accInfo.count = 1;
    accInfo.firstAttempt = now;
  } else {
    accInfo.count += 1;
    if (accInfo.count > 10) {
      return res.status(429).json({
        error: 'Demasiadas solicitudes de acreditación. Por favor espera un minuto antes de reintentar.'
      });
    }
  }
  accreditationAttempts.set(ip, accInfo);

  try {
    const { name, dni, email, phone, auctionDeadline } = req.body;
    if (!name || !dni || !email || !phone) {
      return res.status(400).json({ error: 'Nombre, DNI, correo electrónico y teléfono son obligatorios' });
    }
    const safeName = String(name).trim().slice(0, 100);
    const safeDni = String(dni).trim().slice(0, 30);
    const safeEmail = String(email).trim().slice(0, 120);
    const safePhone = String(phone).trim().slice(0, 50);
    const safeAuctionDeadline = auctionDeadline ? String(auctionDeadline).trim().slice(0, 50) : null;

    if (!safeName || !safeDni || !safeEmail || !safePhone) {
      return res.status(400).json({ error: 'Todos los campos de acreditación son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeEmail)) {
      return res.status(400).json({ error: 'El correo electrónico ingresado no tiene un formato válido' });
    }

    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO accreditations (name, dni, email, phone, auction_deadline, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(safeName, safeDni, safeEmail, safePhone, safeAuctionDeadline, createdAt);

    res.json({ success: true, message: 'Acreditación registrada exitosamente' });
  } catch (err) {
    console.error('Error al registrar acreditación:', err);
    res.status(500).json({ error: 'Error al registrar acreditación' });
  }
});

// Ver lista de acreditaciones enriquecida con las pujas del usuario (Protegido para el Admin)
app.get('/api/accreditations', requireAuth, (req, res) => {
  try {
    const accreditations = db.prepare('SELECT * FROM accreditations ORDER BY id DESC').all();
    const allBids = db.prepare('SELECT * FROM bids ORDER BY id DESC').all();
    const lotsRows = db.prepare('SELECT id, data FROM lots').all();
    const lotsMap = {};
    for (const r of lotsRows) {
      try {
        lotsMap[r.id] = JSON.parse(r.data);
      } catch {}
    }

    const enhanced = accreditations.map((acc) => {
      const cleanAccDni = String(acc.dni || '').trim().toLowerCase();
      const cleanAccEmail = String(acc.email || '').trim().toLowerCase();

      // Buscar pujas del usuario por DNI o Email
      const userBids = allBids.filter((b) => {
        const bDni = String(b.dni || '').trim().toLowerCase();
        const bEmail = String(b.email || '').trim().toLowerCase();
        return (cleanAccDni && bDni === cleanAccDni) || (cleanAccEmail && bEmail === cleanAccEmail);
      });

      // Agrupar por lote para mostrar la postura más alta por obra
      const lotBidsMap = new Map();
      for (const b of userBids) {
        const current = lotBidsMap.get(b.lot_id);
        if (!current || b.amount > current.amount) {
          lotBidsMap.set(b.lot_id, b);
        }
      }

      const bidsList = Array.from(lotBidsMap.values()).map((b) => {
        const lotInfo = lotsMap[b.lot_id] || {};
        return {
          lotId: b.lot_id,
          lotNumber: lotInfo.lote || `Lote #${String(b.lot_id).padStart(2, '0')}`,
          title: lotInfo.title || 'Obra en subasta',
          artist: lotInfo.artist || '',
          amount: b.amount,
          date: b.created_at,
        };
      });

      return {
        ...acc,
        bids: bidsList,
      };
    });

    res.json({ accreditations: enhanced });
  } catch (err) {
    console.error('Error al consultar acreditaciones:', err);
    res.status(500).json({ error: 'Error al consultar acreditaciones' });
  }
});

// Eliminar una acreditación específica (Protegido para el Admin)
app.delete('/api/accreditations/:id', requireAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de acreditación inválido' });
    }
    const info = db.prepare('DELETE FROM accreditations WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Acreditación no encontrada' });
    }
    res.json({ success: true, message: 'Acreditación eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar acreditación:', err);
    res.status(500).json({ error: 'Error al eliminar acreditación' });
  }
});

// Reiniciar todas las acreditaciones para una nueva subasta (Protegido para el Admin)
app.post('/api/accreditations/reset', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM accreditations').run();
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(
      'accreditations_reset_at',
      new Date().toISOString()
    );
    res.json({
      success: true,
      message: 'Todas las acreditaciones han sido reiniciadas. Los visitantes deberán acreditarse nuevamente.',
    });
  } catch (err) {
    console.error('Error al reiniciar acreditaciones:', err);
    res.status(500).json({ error: 'Error al reiniciar acreditaciones' });
  }
});

// Verificar si una acreditación sigue activa en la base de datos (Público)
app.get('/api/accreditations/check', (req, res) => {
  try {
    const { dni, email } = req.query;
    if (!dni && !email) {
      return res.json({ valid: false });
    }
    const row = db.prepare(`
      SELECT id FROM accreditations 
      WHERE (dni = ? AND dni != '') OR (email = ? AND email != '')
      LIMIT 1
    `).get(String(dni || '').trim(), String(email || '').trim());

    res.json({ valid: Boolean(row) });
  } catch (err) {
    res.json({ valid: true });
  }
});

// -------------------------------------------------------------
// INICIO DEL SERVIDOR
// -------------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================`);
  console.log(`🚀 Insignia Subastas Backend escuchando en puerto ${PORT}`);
  console.log(`🔒 Modo seguro activo con autenticación JWT, bcrypt y rate-limit`);
  console.log(`📁 Base de datos SQLite: ${path.join(DATA_DIR, 'insignia.db')}`);
  console.log(`================================================`);
});
