const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Register a new user.
 * @param {{ fullName, email, password, role?, disability? }} data
 */
exports.register = async (data) => {
  const { fullName, email, password, role = 'CANDIDATE', disability } = data;

  // Check duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Email already registered.'), { statusCode: 409 });

  // Hash password — never store plain text
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { fullName, email, password: hashedPassword, role, disability },
    select: { id: true, fullName: true, email: true, role: true, disability: true, createdAt: true },
  });

  return user;
};

/**
 * Log in a user and return a signed JWT.
 * @param {{ email, password }} data
 */
exports.login = async (data) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });

  // Sign JWT — NEVER include password in payload
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Strip password before returning user object
  const { password: _pw, ...safeUser } = user;

  return { token, user: safeUser };
};