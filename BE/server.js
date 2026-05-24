require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║         EchoWork API Server              ║
  ║  Running on http://localhost:${PORT}         ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}           ║
  ╚══════════════════════════════════════════╝
  `);
});