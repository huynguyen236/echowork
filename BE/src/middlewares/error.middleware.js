/**
 * Global Error Handler Middleware.
 * Catches all errors thrown or passed via next(err) in the app.
 * Must be registered LAST in app.js.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
      field: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  // Generic fallback
  const statusCode = err.statusCode || 500;
  const message    = err.message || 'Internal Server Error';

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorMiddleware;
