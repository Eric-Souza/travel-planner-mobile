#!/usr/bin/env node
/**
 * Generates TypeScript types from the FastAPI OpenAPI schema.
 * Requires a running backend: set API_SCHEMA_URL or EXPO_PUBLIC_API_BASE_URL.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const baseUrl = process.env.API_SCHEMA_URL
  ?? process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/v1\/?$/, '')
  ?? 'http://localhost:8000';

const schemaUrl = `${baseUrl}/openapi.json`;
const outPath = join(root, 'src', 'api', 'generated', 'api-types.generated.ts');

async function main() {
  console.log(`Fetching OpenAPI schema from ${schemaUrl}…`);
  const res = await fetch(schemaUrl);
  if (!res.ok) {
    console.error(`Failed to fetch schema (${res.status}). Is travel-planner-api running?`);
    process.exit(1);
  }
  const schema = await res.json();

  // Minimal generation: write schema as typed comment block + re-export paths
  // For full generation, install openapi-typescript and run: npx openapi-typescript schema.json -o out.ts
  const { execSync } = await import('child_process');
  const tmpSchema = join(root, '.openapi-tmp.json');
  writeFileSync(tmpSchema, JSON.stringify(schema, null, 2));

  try {
    execSync(
      `npx openapi-typescript "${tmpSchema}" -o "${outPath}"`,
      { stdio: 'inherit', cwd: root },
    );
    console.log(`Wrote ${outPath}`);
  } finally {
    const { unlinkSync } = await import('fs');
    try {
      unlinkSync(tmpSchema);
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
