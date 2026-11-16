import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');
const serverEnvPath = path.resolve(__dirname, '../../.env');

try {
  if (typeof process.loadEnvFile === 'function') {
    // Try server/.env first, then root .env
    try {
      process.loadEnvFile(serverEnvPath);
    } catch {
      process.loadEnvFile(envPath);
    }
  }
} catch (err) {
  // Ignore if no .env file
}
