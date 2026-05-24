require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');

// ─── Route Imports ───────────────────────────────────────────────────────────
const authRoutes          = require('./routes/auth.routes');
const userRoutes          = require('./routes/user.routes');
const jobRoutes           = require('./routes/job.routes');
const applicationRoutes   = require('./routes/application.routes');
const cvRoutes            = require('./routes/cv.routes');
const accessibilityRoutes = require('./routes/accessibility.routes');
const adminRoutes         = require('./routes/admin.routes');

// ─── Middleware Imports ───────────────────────────────────────────────────────
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());

// CORS — restrict to CLIENT_URL in production, allow all in development
const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_URL
  : true; // reflect all origins in dev

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Static File Serving (uploads) ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EchoWork API is running 🚀', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/cv',            cvRoutes);
app.use('/api/accessibility', accessibilityRoutes);
app.use('/api/admin',         adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
