import './src/config/env.js';
import app from './src/app.js';
import connectDB from './src/db/db.js';
import { seedDefaultAdmin } from './src/scripts/seedAdmin.js';

// Connect to MongoDB and seed admin (runs on every cold start in serverless too)
(async () => {
  const conn = await connectDB();
  if (conn) {
    await seedDefaultAdmin();
  }
})();

// Local development: start HTTP server
// Vercel serverless: skip app.listen(), just export app
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 ClinicPulse Server running on port ${PORT}`);
    console.log(`📡 Base URL: http://localhost:${PORT}`);
    console.log(`🩺 API Health: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });
}

// Vercel needs this default export to handle requests
export default app;
