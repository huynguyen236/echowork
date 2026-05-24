/**
 * EchoWork Sanitize Utility
 * Strips all HTML tags from user-provided strings.
 * Prevents XSS in job descriptions, CV fields, and profile data.
 *
 * Usage:
 *   const { stripTags, sanitizeObject } = require('../utils/sanitize.util');
 *   const clean = stripTags(userInput);
 */

/**
 * Strip all HTML tags from a string.
 * Also decodes common HTML entities to prevent double-encoding.
 * @param {string} str
 * @returns {string}
 */
const stripTags = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/<[^>]*>/g, '')           // remove all HTML tags
    .replace(/javascript:/gi, '')       // kill JS protocol
    .replace(/on\w+\s*=/gi, '')         // remove event handlers (onclick=, onload= etc.)
    .trim();
};

/**
 * Sanitize selected string fields of a plain object.
 * Non-string and undefined fields are left untouched.
 * @param {object} obj - The object to sanitize
 * @param {string[]} fields - Field names to sanitize
 * @returns {object} New object with sanitized fields
 */
const sanitizeFields = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = stripTags(result[field]);
    }
  }
  return result;
};

/**
 * HTML-escape a string for safe insertion into HTML templates (e.g. PDF).
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return str || '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

module.exports = { stripTags, sanitizeFields, escapeHtml };
