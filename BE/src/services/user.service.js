const prisma = require('../config/prisma');

/**
 * Get a user's profile by ID (no password returned).
 */
exports.getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, fullName: true, email: true,
      role: true, avatar: true, disability: true, createdAt: true,
    },
  });
  if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  return user;
};

/**
 * Update user profile fields (fullName, disability, avatar).
 */
exports.updateProfile = async (userId, data) => {
  const { fullName, disability, avatarPath } = data;

  const updateData = {};
  if (fullName)    updateData.fullName   = fullName;
  if (disability !== undefined) updateData.disability = disability;
  if (avatarPath)  updateData.avatar     = avatarPath;

  const user = await prisma.user.update({
    where: { id: userId },
    data:  updateData,
    select: {
      id: true, fullName: true, email: true,
      role: true, avatar: true, disability: true, createdAt: true,
    },
  });

  return user;
};
