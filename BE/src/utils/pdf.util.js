const puppeteer = require('puppeteer');
const { escapeHtml } = require('./sanitize.util');

/**
 * Generate a PDF buffer from an HTML string.
 * @param {string} htmlContent - Full HTML page to render.
 * @returns {Promise<Buffer>} PDF buffer ready to stream.
 */
const generatePDFFromHTML = async (htmlContent) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

/**
 * Build an HTML string from a CV object.
 * All user-provided data is HTML-escaped before insertion.
 * @param {object} cv   - CV data from Prisma.
 * @param {object} user - User data (fullName, email, disability).
 * @returns {string} HTML string.
 */
const buildCVHTML = (cv, user) => {
  // Parse JSON fields if they are strings
  const education  = safeParseJSON(cv.education);
  const experience = safeParseJSON(cv.experience);
  const skills     = safeParseJSON(cv.skills);

  // ─── Escape all user-provided strings before inserting into HTML ────────────
  const safeName       = escapeHtml(user.fullName     || '');
  const safeEmail      = escapeHtml(user.email        || '');
  const safeDisability = escapeHtml(user.disability   || '');
  const safeSummary    = escapeHtml(cv.summary        || '');

  const educationHTML = Array.isArray(education)
    ? education.map(e => `
        <div class="entry">
          <div class="entry-title">${escapeHtml(e.degree || '')} — ${escapeHtml(e.school || '')}</div>
          <div class="entry-sub">${escapeHtml(e.year || '')}</div>
          <p>${escapeHtml(e.description || '')}</p>
        </div>`).join('')
    : `<p>${escapeHtml(String(education || ''))}</p>`;

  const experienceHTML = Array.isArray(experience)
    ? experience.map(e => `
        <div class="entry">
          <div class="entry-title">${escapeHtml(e.position || '')} @ ${escapeHtml(e.company || '')}</div>
          <div class="entry-sub">${escapeHtml(e.duration || '')}</div>
          <p>${escapeHtml(e.description || '')}</p>
        </div>`).join('')
    : `<p>${escapeHtml(String(experience || ''))}</p>`;

  const skillsHTML = Array.isArray(skills)
    ? `<ul class="skills-list">${skills.map(s => `<li>${escapeHtml(String(s))}</li>`).join('')}</ul>`
    : `<p>${escapeHtml(String(skills || ''))}</p>`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
    <title>${safeName} — CV</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', sans-serif; color: #222; background: #fff; padding: 40px; font-size: 13px; line-height: 1.6; }
      h1 { font-size: 28px; color: #1a1a2e; margin-bottom: 4px; }
      .subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
      h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #3a86ff; border-bottom: 2px solid #3a86ff; padding-bottom: 4px; margin: 20px 0 10px; }
      .summary { color: #444; margin-bottom: 8px; }
      .entry { margin-bottom: 14px; }
      .entry-title { font-weight: 600; font-size: 13px; }
      .entry-sub { color: #888; font-size: 11px; margin-bottom: 4px; }
      .skills-list { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; }
      .skills-list li { background: #eef2ff; color: #3a86ff; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    </style>
  </head>
  <body>
    <h1>${safeName}</h1>
    <div class="subtitle">${safeEmail}${safeDisability ? ' · Disability: ' + safeDisability : ''}</div>

    ${cv.summary    ? `<h2>Profile</h2><p class="summary">${safeSummary}</p>` : ''}
    ${cv.education  ? `<h2>Education</h2>${educationHTML}` : ''}
    ${cv.experience ? `<h2>Experience</h2>${experienceHTML}` : ''}
    ${cv.skills     ? `<h2>Skills</h2>${skillsHTML}` : ''}
  </body>
  </html>`;
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const safeParseJSON = (value) => {
  if (!value) return '';
  try { return JSON.parse(value); } catch { return value; }
};

module.exports = { generatePDFFromHTML, buildCVHTML };
