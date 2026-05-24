const prisma = require('../config/prisma');

/**
 * Get accessibility settings for the current user.
 * Creates a default record if none exists.
 */
exports.getSettings = async (userId) => {
  let settings = await prisma.accessibilitySetting.findUnique({ where: { userId } });

  if (!settings) {
    // Auto-create defaults on first access
    settings = await prisma.accessibilitySetting.create({
      data: { userId, fontSize: 'medium', contrastMode: 'normal' },
    });
  }

  return settings;
};

/**
 * Update (upsert) accessibility settings for the current user.
 * @param {number} userId
 * @param {{ fontSize?, contrastMode? }} data
 */
exports.updateSettings = async (userId, data) => {
  const { fontSize, contrastMode } = data;

  const updateData = {};
  if (fontSize     !== undefined) updateData.fontSize     = fontSize;
  if (contrastMode !== undefined) updateData.contrastMode = contrastMode;

  return prisma.accessibilitySetting.upsert({
    where:  { userId },
    update: updateData,
    create: { userId, fontSize: fontSize || 'medium', contrastMode: contrastMode || 'normal' },
  });
};
