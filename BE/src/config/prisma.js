const { PrismaClient } = require('@prisma/client');

// ─── Singleton Prisma Client ───────────────────────────────────────────────
// Reuse the same instance across the app to avoid connection pool exhaustion
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
