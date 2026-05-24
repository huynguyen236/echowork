const router     = require('express').Router();
const rateLimit  = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const validate   = require('../middlewares/validate.middleware');
const { registerValidation, loginValidation } = require('../validations/auth.validation');

// ─── Rate Limiter ──────────────────────────────────────────────────────────
// Prevents brute-force attacks on login/register endpoints.
// Max 10 requests per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 10,
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test', // skip in test env
});

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  registerValidation, validate,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  loginValidation, validate,
  authController.login
);

module.exports = router;