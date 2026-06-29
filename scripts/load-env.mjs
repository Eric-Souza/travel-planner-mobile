import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load KEY=VALUE lines from a .env file into process.env (does not override existing vars).
 */
export function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return false;

  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }

  return true;
}

export function loadProjectEnv(rootDir) {
  loadEnvFile(join(rootDir, '.env'));
  loadEnvFile(join(rootDir, '.env.local'));
}
