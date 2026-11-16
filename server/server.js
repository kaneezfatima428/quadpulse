import './src/config/env.js';
import app from './src/app.js';
import connectDB from './src/db/db.js';
import { seedDefaultAdmin } from './src/scripts/seedAdmin.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

// Start listening immediately so port 5000 is open and never returns ERR_CONNECTION_REFUSED
const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 ClinicPulse Server running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}`);
  console.log(`🩺 API Health: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});

// Connect to MongoDB asynchronously without blocking server startup
(async () => {
  const conn = await connectDB();
  if (conn) {
    await seedDefaultAdmin();
  }
})();

export default app;
