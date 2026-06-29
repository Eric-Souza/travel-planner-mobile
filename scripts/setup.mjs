#!/usr/bin/env node
/**
 * First-time local setup: create .env from .env.example if missing.
 */
import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, '.env');
const examplePath = join(root, '.env.example');

function detectLanIp() {
  for (const iface of Object.values(networkInterfaces())) {
    if (!iface) continue;
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return null;
}

if (existsSync(envPath)) {
  console.log('.env already exists — skipping create.');
} else if (!existsSync(examplePath)) {
  console.error('Missing .env.example — cannot bootstrap .env.');
  process.exit(1);
} else {
  copyFileSync(examplePath, envPath);
  console.log('Created .env from .env.example');
}

const lanIp = detectLanIp();
console.log('\nNext steps:');
console.log('  1. npm install');
console.log('  2. Start travel-planner-api on port 8000 (see backend README)');
if (lanIp) {
  console.log(`  3. Physical device? Set EXPO_PUBLIC_API_BASE_URL=http://${lanIp}:8000/v1 in .env`);
} else {
  console.log('  3. Physical device? Set EXPO_PUBLIC_API_BASE_URL to your PC LAN IP in .env');
}
console.log('  4. npm start');
console.log('\nCurrent API URL:', process.env.EXPO_PUBLIC_API_BASE_URL ?? '(set in .env after expo start loads it)');
