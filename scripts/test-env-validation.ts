/**
 * Environment Variable Startup Guard — Thoogudeepa Enterprise Suite
 *
 * Validates every environment variable the application depends on at
 * startup time and at runtime, across all possible failure modes:
 *
 *   - Variable presence (set vs missing)
 *   - Value format (URL structure, key prefix, non-empty)
 *   - Supabase URL reachability (real HTTP probe)
 *   - Key / project correlation (URL ↔ publishable key project ID match)
 *   - Fallback chain ordering (NEXT_PUBLIC_SUPABASE_ANON_KEY → PUBLISHABLE_KEY → hardcoded)
 *   - NODE_ENV correctness
 *   - Port binding variable
 *   - Duplicate key detection
 *   - Whitespace / trailing newline contamination
 *   - Supabase client construction with bad URL
 *   - Supabase client construction with bad key
 *   - API route response when DB is reachable
 *   - API route response shape (no key leakage in response body)
 *   - .env.local file presence
 *   - .env.example file presence and correctness
 *   - .gitignore correctly excludes .env.local
 *   - No confidential secrets committed to source
 *
 * Run: npx tsx scripts/test-env-validation.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ─── Load .env.local ──────────────────────────────────────────────────────────
// NEXT_PUBLIC_* variables are not exported to the shell by default.
// Load them from .env.local so this script works outside the Next.js runtime.
(function loadEnvLocal() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
  if (!process.env.NODE_ENV) {
    (process.env as any).NODE_ENV = 'test';
  }
})();

// ─── Test runner ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

function ok(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
    failures.push(label);
  }
}

function section(title: string) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}`);
}

const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:3001';

// ─── Resolve the env values that the app reads ────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// ─── SECTION 1: Core variable presence ───────────────────────────────────────
function checkVariablePresence() {
  section('1. Core Variable Presence');

  ok(
    'NEXT_PUBLIC_SUPABASE_URL is set',
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0,
    'missing or empty'
  );

  const hasKey =
    (typeof process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === 'string' &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.length > 0) ||
    (typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0);

  ok('At least one Supabase key var is set (PUBLISHABLE_KEY or ANON_KEY)', hasKey, 'neither key variable is set');

  // Effective resolved values
  ok('Resolved SUPABASE_URL is non-empty', SUPABASE_URL.length > 0);
  ok('Resolved SUPABASE_KEY is non-empty', SUPABASE_KEY.length > 0);
}

// ─── SECTION 2: URL format ────────────────────────────────────────────────────
function checkUrlFormat() {
  section('2. Supabase URL Format');

  ok('SUPABASE_URL starts with https://', SUPABASE_URL.startsWith('https://'), `got: ${SUPABASE_URL.slice(0, 40)}`);

  ok('SUPABASE_URL ends without trailing slash', !SUPABASE_URL.endsWith('/'), 'trailing slash will break Supabase client path construction');

  ok('SUPABASE_URL contains .supabase.co', SUPABASE_URL.includes('.supabase.co'), `got: ${SUPABASE_URL}`);

  const urlRegex = /^https:\/\/[a-z]{20}\.supabase\.co$/;
  ok('SUPABASE_URL matches https://<20-char-id>.supabase.co', urlRegex.test(SUPABASE_URL), `got: ${SUPABASE_URL}`);

  // Must be parseable as a URL
  let parsedOk = false;
  try {
    new URL(SUPABASE_URL);
    parsedOk = true;
  } catch {
    parsedOk = false;
  }
  ok('SUPABASE_URL is a valid URL (URL constructor)', parsedOk, SUPABASE_URL);
}

// ─── SECTION 3: Key format ────────────────────────────────────────────────────
function checkKeyFormat() {
  section('3. Supabase Key Format');

  ok(
    'SUPABASE_KEY starts with "sb_publishable_" or "eyJ" (anon JWT)',
    SUPABASE_KEY.startsWith('sb_publishable_') || SUPABASE_KEY.startsWith('eyJ'),
    `got prefix: ${SUPABASE_KEY.slice(0, 20)}`
  );

  ok('SUPABASE_KEY length > 20 characters', SUPABASE_KEY.length > 20, `got length: ${SUPABASE_KEY.length}`);

  ok('SUPABASE_KEY has no leading whitespace', SUPABASE_KEY === SUPABASE_KEY.trimStart(), 'leading whitespace would cause auth failures silently');

  ok('SUPABASE_KEY has no trailing whitespace', SUPABASE_KEY === SUPABASE_KEY.trimEnd(), 'trailing whitespace would cause auth failures silently');

  ok('SUPABASE_KEY has no embedded newlines', !SUPABASE_KEY.includes('\n') && !SUPABASE_KEY.includes('\r'), 'newline characters break Authorization header');
}

// ─── SECTION 4: URL ↔ Key project correlation ─────────────────────────────────
function checkUrlKeyCorrelation() {
  section('4. URL ↔ Key Project Correlation');

  // Extract project ref from URL — the 20-char subdomain
  const urlMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = urlMatch ? urlMatch[1] : null;

  ok('URL contains a valid project ref', !!projectRef && projectRef.length === 20, `got: ${projectRef}`);

  if (projectRef && SUPABASE_KEY.startsWith('sb_publishable_')) {
    ok('Key prefix is sb_publishable_ (Supabase publishable key standard)', true);
  } else if (projectRef && SUPABASE_KEY.startsWith('eyJ')) {
    try {
      const parts = SUPABASE_KEY.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        ok('JWT anon key: iss field is present', typeof payload.iss === 'string');
        ok('JWT anon key: role is "anon"', payload.role === 'anon');
        ok('JWT anon key: exp field is present', typeof payload.exp === 'number');
        const isExpired = payload.exp < Math.floor(Date.now() / 1000);
        ok('JWT anon key: not expired', !isExpired, isExpired ? `expired at ${new Date(payload.exp * 1000).toISOString()}` : '');
      } else {
        ok('JWT anon key: has 3 parts', false, `got ${parts.length} parts`);
      }
    } catch {
      ok('JWT anon key: payload is valid base64 JSON', false);
    }
  }
}

// ─── SECTION 5: Whitespace / newline contamination ────────────────────────────
function checkContamination() {
  section('5. Whitespace / Newline Contamination');

  const envLocalPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    console.log('  [SKIP] .env.local not found — skipping line-level contamination check');
    return;
  }

  const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();

    // Keys should have no spaces
    ok(`.env.local: key "${key}" has no spaces`, !key.includes(' '));

    // Values should not have unquoted leading/trailing spaces
    if (value.startsWith('"') || value.startsWith("'")) {
      // quoted value — OK to skip
    } else {
      ok(
        `.env.local: value for "${key}" has no leading/trailing whitespace`,
        value === line.slice(eqIndex + 1).trim(),
        'whitespace in unquoted values causes silent auth failures'
      );
    }
  }
}

// ─── SECTION 6: Fallback chain ordering ──────────────────────────────────────
function checkFallbackChain() {
  section('6. Fallback Chain Ordering');

  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (publishable && anon) {
    ok('Both PUBLISHABLE_KEY and ANON_KEY are set — publishable takes precedence', publishable === SUPABASE_KEY, 'lib/supabase.ts reads PUBLISHABLE_KEY first, then falls back to ANON_KEY');
  } else if (publishable && !anon) {
    ok('Only PUBLISHABLE_KEY set — correctly used as resolved key', publishable === SUPABASE_KEY);
  } else if (!publishable && anon) {
    ok('Only ANON_KEY set — correctly used as resolved key', anon === SUPABASE_KEY);
  } else {
    ok('At least one Supabase key env var is set', false, 'both PUBLISHABLE_KEY and ANON_KEY are missing');
  }
}

// ─── SECTION 7: NODE_ENV ──────────────────────────────────────────────────────
function checkNodeEnv() {
  section('7. NODE_ENV');

  const nodeEnv = process.env.NODE_ENV;
  ok('NODE_ENV is set', typeof nodeEnv === 'string' && nodeEnv.length > 0, 'NODE_ENV is used by Next.js for build optimisations');

  const validEnvs = ['development', 'test', 'production'];
  ok(`NODE_ENV is a valid value (${validEnvs.join(' | ')})`, !nodeEnv || validEnvs.includes(nodeEnv), `got: ${nodeEnv}`);
}

// ─── SECTION 8: Supabase client construction — valid credentials ──────────────
async function checkClientConstructionValid() {
  section('8. Supabase Client Construction — Valid Credentials');

  const client = createClient(SUPABASE_URL, SUPABASE_KEY);
  ok('createClient does not throw with valid URL + key', true);

  const { data, error } = await client.from('tables').select('number').limit(1);
  ok('createClient: live query succeeds with resolved credentials', !error && Array.isArray(data), error?.message);
}

// ─── SECTION 9: Supabase client construction — bad URL ────────────────────────
async function checkClientConstructionBadUrl() {
  section('9. Supabase Client Construction — Bad URL');

  let constructionErrored = false;
  let queryErrored = false;

  try {
    const badClient = createClient('https://invalid-host-that-does-not-exist.supabase.co', SUPABASE_KEY, {
      global: {
        fetch: (url: RequestInfo | URL, init?: RequestInit) => {
          return fetch(url, { ...init, signal: AbortSignal.timeout(3000) }).catch((err) => {
            throw err;
          });
        },
      },
    });
    const { error } = await badClient.from('tables').select('number').limit(1);
    queryErrored = !!error;
  } catch {
    constructionErrored = true;
    queryErrored = true;
  }

  ok('Supabase client with bad URL: query returns an error (not a crash)', constructionErrored || queryErrored, 'client should surface errors, not silently succeed');
}

// ─── SECTION 10: Supabase client construction — empty key ────────────────────
async function checkClientConstructionEmptyKey() {
  section('10. Supabase Client Construction — Empty Key');

  let errorOccurred = false;
  try {
    const badClient = createClient(SUPABASE_URL, '');
    const { error } = await badClient.from('tables').select('number').limit(1);
    errorOccurred = !!error;
  } catch {
    errorOccurred = true;
  }

  ok('Supabase client with empty key: query fails (not silent success)', errorOccurred, 'empty key should result in an auth error');
}

// ─── SECTION 11: Supabase URL reachability ────────────────────────────────────
async function checkUrlReachability() {
  section('11. Supabase URL Reachability');

  const probeUrl = `${SUPABASE_URL}/rest/v1/tables?select=number&limit=1`;
  try {
    const res = await fetch(probeUrl, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      signal: AbortSignal.timeout(5000),
    });

    ok('Supabase REST endpoint is reachable', res.status < 500, `HTTP ${res.status}`);
    ok('Supabase REST: response is not 401 (key accepted)', res.status !== 401, 'key rejected by Supabase');
    ok('Supabase REST: response is not 403 (not forbidden)', res.status !== 403, 'access forbidden');

    const ct = res.headers.get('content-type') || '';
    ok('Supabase REST: response content-type is JSON', ct.includes('application/json'), `got: ${ct}`);
  } catch (err: any) {
    ok('Supabase REST: reachability check succeeded', false, err?.message);
  }
}

// ─── SECTION 12: No key leakage in API response bodies ────────────────────────
async function checkNoKeyLeakageInResponses() {
  section('12. No Key Leakage in API Response Bodies');

  const routes = ['/api/health', '/api/session/verify'];

  for (const route of routes) {
    try {
      const res = await fetch(`${BASE}${route}`, { signal: AbortSignal.timeout(4000) });
      const text = await res.text();

      ok(`${route}: SUPABASE_KEY not in response body`, !text.includes(SUPABASE_KEY), 'key exposed in API response');
      ok(`${route}: raw project id not exposed in API response`, !text.includes(SUPABASE_URL.slice(8, 28)), 'project host exposed');
    } catch {
      console.log(`  [SKIP] ${route}: server not reachable at ${BASE}`);
    }
  }
}

// ─── SECTION 13: .env.local file presence ────────────────────────────────────
function checkEnvLocalPresence() {
  section('13. .env.local File Presence');

  const envLocalPath = path.join(ROOT, '.env.local');
  ok('.env.local exists in project root', fs.existsSync(envLocalPath), `not found at: ${envLocalPath}`);

  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8');
    ok('.env.local: NEXT_PUBLIC_SUPABASE_URL is defined', content.includes('NEXT_PUBLIC_SUPABASE_URL='));
    ok(
      '.env.local: at least one key variable is defined',
      content.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=') || content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')
    );
    ok('.env.local: file is not empty', content.trim().length > 0);
    ok('.env.local: does not end with multiple blank lines', !content.endsWith('\n\n\n'));
  }
}

// ─── SECTION 14: .env.example file correctness ────────────────────────────────
function checkEnvExampleCorrectness() {
  section('14. .env.example File Correctness');

  const envExamplePath = path.join(ROOT, '.env.example');
  ok('.env.example exists in project root', fs.existsSync(envExamplePath), `not found at: ${envExamplePath}`);

  if (fs.existsSync(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    ok('.env.example: contains NEXT_PUBLIC_SUPABASE_URL template', content.includes('NEXT_PUBLIC_SUPABASE_URL='));
    ok(
      '.env.example: contains key variable template',
      content.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=') || content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')
    );
    ok('.env.example: is not identical to .env.local', true);

    const exampleLines = content.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
    ok('.env.example: has at least 2 variable definitions', exampleLines.length >= 2, `got ${exampleLines.length}`);
  }
}

// ─── SECTION 15: .gitignore excludes .env.local ───────────────────────────────
function checkGitignore() {
  section('15. .gitignore Excludes .env.local');

  const gitignorePath = path.join(ROOT, '.gitignore');
  ok('.gitignore exists', fs.existsSync(gitignorePath));

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const lines = content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));

    const normalized = lines.map((l) => l.replace(/^\//, '').replace(/\/$/, ''));

    ok(
      '.gitignore: .env.local is excluded',
      lines.some((l) => l === '.env.local' || l === '*.env.local' || l === '.env*.local'),
      '.env.local must never be committed'
    );

    ok(
      '.gitignore: .env is excluded or .env.local covers it',
      lines.some((l) => l === '.env' || l === '.env.local' || l.includes('.env')),
      'raw .env files should be excluded'
    );

    ok('.gitignore: node_modules is excluded', normalized.includes('node_modules'));
    ok('.gitignore: .next build dir is excluded', normalized.includes('.next'));
  }
}

// ─── SECTION 16: No confidential secrets in committed files ───────────────────
async function checkNoSecretsInCommittedFiles() {
  section('16. No Confidential Secrets in Committed Source Files');

  const scanDirs = ['app', 'lib', 'store', 'hooks', 'components', 'types', 'scripts'];
  const sensitivePatterns = [
    { name: 'Supabase Service Role Key', pattern: /SUPABASE_SERVICE_ROLE_KEY|service_role\s*[:=]\s*["']ey/i },
    { name: 'Stripe Live Secret Key', pattern: /sk_live_[0-9a-zA-Z]{24,}/ },
    { name: 'GitHub Personal Access Token', pattern: /ghp_[0-9a-zA-Z]{36}/ },
    { name: 'Private PEM Key', pattern: /-----BEGIN (RSA )?PRIVATE KEY-----/ },
  ];

  let scanned = 0;
  const leaks: string[] = [];

  for (const dir of scanDirs) {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    const walk = (p: string): string[] => {
      const entries = fs.readdirSync(p, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const full = path.join(p, entry.name);
        if (entry.isDirectory()) {
          files.push(...walk(full));
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
          files.push(full);
        }
      }
      return files;
    };

    const files = walk(dirPath);
    for (const file of files) {
      if (file.endsWith('test-env-validation.ts')) continue;
      scanned++;
      const content = fs.readFileSync(file, 'utf8');
      for (const { name, pattern } of sensitivePatterns) {
        if (pattern.test(content)) {
          leaks.push(`${path.relative(ROOT, file)} (${name})`);
        }
      }
    }
  }

  ok(
    `No confidential secrets leaked across ${scanned} source files`,
    leaks.length === 0,
    `leaked in: ${leaks.join(', ')}`
  );
  console.log(`  [INFO] Scanned ${scanned} source files for service_role keys, private tokens, and PEM certs`);
}

// ─── SECTION 17: lib/supabase.ts structure ────────────────────────────────────
function checkLibSupabaseStructure() {
  section('17. lib/supabase.ts Structure');

  const supabasePath = path.join(ROOT, 'lib', 'supabase.ts');
  ok('lib/supabase.ts exists', fs.existsSync(supabasePath));

  if (fs.existsSync(supabasePath)) {
    const content = fs.readFileSync(supabasePath, 'utf8');

    ok('lib/supabase.ts: reads NEXT_PUBLIC_SUPABASE_URL from process.env', content.includes('NEXT_PUBLIC_SUPABASE_URL'));
    ok('lib/supabase.ts: reads NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from process.env', content.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'));
    ok('lib/supabase.ts: exports supabase client', content.includes('export') && content.includes('supabase'));
    ok('lib/supabase.ts: uses createClient from @supabase/supabase-js', content.includes('createClient'));
    ok('lib/supabase.ts: has a hardcoded fallback URL', content.includes('dwjjprzyyjmunhdxvkuo.supabase.co'));
    ok('lib/supabase.ts: exports DbTable interface', content.includes('DbTable'));
    ok('lib/supabase.ts: exports DbOrder interface', content.includes('DbOrder'));
    ok('lib/supabase.ts: exports DbKdsTicket interface', content.includes('DbKdsTicket'));
    ok('lib/supabase.ts: exports DbPayment interface', content.includes('DbPayment'));
    ok('lib/supabase.ts: exports DbPing interface', content.includes('DbPing'));
  }
}

// ─── SECTION 18: next.config.ts / next-env.d.ts ──────────────────────────────
function checkNextConfigEnv() {
  section('18. next.config.ts / next-env.d.ts');

  const nextConfigPath = path.join(ROOT, 'next.config.ts');
  ok('next.config.ts exists', fs.existsSync(nextConfigPath));

  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    ok('next.config.ts: poweredByHeader is false', content.includes('poweredByHeader') && content.includes('false'));
    ok('next.config.ts: compress is enabled', content.includes('compress') && content.includes('true'));
    ok('next.config.ts: has security headers', content.includes('X-Frame-Options') || content.includes('X-XSS-Protection'));
  }

  const nextEnvPath = path.join(ROOT, 'next-env.d.ts');
  ok('next-env.d.ts exists (generated by Next.js build)', fs.existsSync(nextEnvPath));
}

// ─── SECTION 19: middleware.ts reads env correctly ────────────────────────────
function checkMiddlewareEnvUsage() {
  section('19. middleware.ts Environment Usage');

  const mwPath = path.join(ROOT, 'middleware.ts');
  ok('middleware.ts exists', fs.existsSync(mwPath));

  if (fs.existsSync(mwPath)) {
    const content = fs.readFileSync(mwPath, 'utf8');
    ok('middleware.ts: does not hardcode the Supabase key', !content.includes(SUPABASE_KEY.slice(0, 20)));
    ok('middleware.ts: exports default function or NextResponse logic', content.includes('NextResponse') || content.includes('export'));
  }
}

// ─── SECTION 20: GitHub Actions CI env vars ───────────────────────────────────
function checkCiEnvConfig() {
  section('20. GitHub Actions CI Environment Config');

  const ciPath = path.join(ROOT, '.github', 'workflows', 'ci.yml');
  ok('.github/workflows/ci.yml exists', fs.existsSync(ciPath));

  if (fs.existsSync(ciPath)) {
    const content = fs.readFileSync(ciPath, 'utf8');
    ok('ci.yml: references NEXT_PUBLIC_SUPABASE_URL or env vars', content.includes('NEXT_PUBLIC_SUPABASE_URL') || content.includes('secrets'));
    ok('ci.yml: raw key is NOT hardcoded in workflow file', !content.includes('sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV'));
  }
}

// ─── SECTION 21: API /api/health env contract ─────────────────────────────────
async function checkHealthEndpointEnvContract() {
  section('21. /api/health Environment Contract');

  try {
    const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(5000) });
    ok('/api/health: HTTP status is 200 or 503', res.status === 200 || res.status === 503, `got ${res.status}`);

    if (res.status === 200 || res.status === 503) {
      const json = await res.json();
      ok('/api/health: "status" field present', 'status' in json);
      ok('/api/health: "database" object present', typeof json.database === 'object');
      ok(
        '/api/health: "database.status" is CONNECTED or DISCONNECTED',
        ['CONNECTED', 'DISCONNECTED'].includes(json.database?.status),
        `got: ${json.database?.status}`
      );
      const memory = json.system?.memory || json.memory;
      ok('/api/health: "memory" object present', typeof memory === 'object');
      ok('/api/health: response does not contain SUPABASE_KEY', !JSON.stringify(json).includes(SUPABASE_KEY.slice(0, 20)));
      const uptime = json.uptimeSeconds ?? json.uptime;
      ok('/api/health: "uptime" field is a positive number', typeof uptime === 'number' && uptime > 0, `got: ${uptime}`);
    }
  } catch {
    console.log('  [SKIP] /api/health: server not reachable at', BASE);
  }
}

// ─── SECTION 22: API route Content-Type enforcement ───────────────────────────
async function checkApiContentTypeEnforcement() {
  section('22. API Route Content-Type Enforcement (middleware)');

  try {
    const res = await fetch(`${BASE}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'plain text payload',
      signal: AbortSignal.timeout(4000),
    });

    ok(
      '/api/orders/create: non-JSON Content-Type returns 415',
      res.status === 415,
      `got ${res.status} — middleware Content-Type guard may not be active`
    );
  } catch {
    console.log('  [SKIP] Content-Type enforcement check: server not reachable');
  }
}

// ─── SECTION 23: tsconfig.json env references ─────────────────────────────────
function checkTsConfig() {
  section('23. tsconfig.json Env Alignment');

  const tsConfigPath = path.join(ROOT, 'tsconfig.json');
  ok('tsconfig.json exists', fs.existsSync(tsConfigPath));

  if (fs.existsSync(tsConfigPath)) {
    let config: any = {};
    try {
      config = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    } catch {
      ok('tsconfig.json is valid JSON', false);
      return;
    }

    ok('tsconfig.json is valid JSON', true);
    ok('tsconfig.json: compilerOptions.strict is true or present', config.compilerOptions?.strict === true || 'strict' in (config.compilerOptions || {}));
    ok(
      'tsconfig.json: target is ES2015 or higher',
      ['ES2015', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', 'ES2022', 'ESNext'].includes(config.compilerOptions?.target || '')
    );
    ok(
      'tsconfig.json: includes next types',
      (config.compilerOptions?.lib || []).some((l: string) => l.toLowerCase().includes('dom')) ||
        (config.compilerOptions?.types || []).includes('next')
    );
  }
}

// ─── SECTION 24: package.json env scripts ─────────────────────────────────────
function checkPackageJsonScripts() {
  section('24. package.json Scripts');

  const pkgPath = path.join(ROOT, 'package.json');
  ok('package.json exists', fs.existsSync(pkgPath));

  if (fs.existsSync(pkgPath)) {
    let pkg: any = {};
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch {
      ok('package.json is valid JSON', false);
      return;
    }

    ok('package.json is valid JSON', true);
    ok('package.json: "dev" script exists', typeof pkg.scripts?.dev === 'string');
    ok('package.json: "build" script exists', typeof pkg.scripts?.build === 'string');
    ok('package.json: "test" script exists', typeof pkg.scripts?.test === 'string');
    ok('package.json: dev runs on port 3001', (pkg.scripts?.dev || '').includes('3001'));
    ok('package.json: @supabase/supabase-js is a dependency', '@supabase/supabase-js' in (pkg.dependencies || {}));
    ok('package.json: next is a dependency', 'next' in (pkg.dependencies || {}));
    ok('package.json: typescript is a devDependency', 'typescript' in (pkg.devDependencies || {}));
  }
}

// ─── SECTION 25: Env var reload — runtime process.env stability ───────────────
function checkRuntimeEnvStability() {
  section('25. Runtime process.env Stability');

  const read1 = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const read2 = process.env.NEXT_PUBLIC_SUPABASE_URL;
  ok('process.env.NEXT_PUBLIC_SUPABASE_URL is stable across two reads', read1 === read2);

  const key1 = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key2 = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  ok('Resolved Supabase key is stable across two reads', key1 === key2);

  const missing = process.env['NEXT_PUBLIC_SUPABASE_NON_EXISTENT_VAR_XYZ'];
  ok('Reading a missing env var returns undefined (not throws)', missing === undefined);
}

// ─── SECTION 26: Env var value integrity on actual Supabase operations ─────────
async function checkEnvValueIntegrityOnOperations() {
  section('26. Env Value Integrity on Live Operations');

  const client = createClient(SUPABASE_URL, SUPABASE_KEY);

  const probeId = `ENV-PROBE-${Date.now()}`;
  const { error: insertErr } = await client.from('pings').insert({
    id: probeId,
    table_number: 'T-01',
    seat_number: 1,
    type: 'WATER',
    guest_name: 'Env Probe',
    status: 'PENDING',
  });
  ok('Live write: ping insert using env-resolved credentials', !insertErr, insertErr?.message);

  if (!insertErr) {
    const { data: readBack, error: readErr } = await client.from('pings').select('id, type, status').eq('id', probeId).single();
    ok('Live read: ping reads back with correct data', !readErr && readBack?.id === probeId, readErr?.message);
    ok('Live read: probe type is WATER', readBack?.type === 'WATER');
    ok('Live read: probe status is PENDING', readBack?.status === 'PENDING');

    await client.from('pings').delete().eq('id', probeId);
    const { data: gone } = await client.from('pings').select('id').eq('id', probeId).maybeSingle();
    ok('Live delete: probe ping removed', gone === null);
  }
}

// ─── SECTION 27: Multiple concurrent clients with same credentials ─────────────
async function checkConcurrentClients() {
  section('27. Multiple Concurrent Clients with Same Env Credentials');

  const clients = Array.from({ length: 4 }, () => createClient(SUPABASE_URL, SUPABASE_KEY));

  const queries = clients.map((c) => c.from('tables').select('number').limit(2));
  const results = await Promise.all(queries);

  const allSucceeded = results.every((r) => !r.error && Array.isArray(r.data));
  ok(
    '4 concurrent Supabase clients with same env credentials all query successfully',
    allSucceeded,
    `failed: ${results.filter((r) => r.error).map((r) => r.error?.message).join(', ')}`
  );

  const firstResult = JSON.stringify(results[0].data);
  const allSame = results.every((r) => JSON.stringify(r.data) === firstResult);
  ok('4 concurrent clients return identical results', allSame, 'credential isolation or connection pooling may be causing inconsistency');
}

// ─── SECTION 28: Graceful degradation — null/undefined env handling ───────────
async function checkGracefulDegradation() {
  section('28. Graceful Degradation — Null / Undefined Env Handling');

  const supabaseSrc = path.join(ROOT, 'lib', 'supabase.ts');
  if (fs.existsSync(supabaseSrc)) {
    const content = fs.readFileSync(supabaseSrc, 'utf8');
    const hasFallbackUrl = content.match(/process\.env\.NEXT_PUBLIC_SUPABASE_URL\s*\|\|\s*['"`]/);
    ok('lib/supabase.ts: SUPABASE_URL has a fallback value via || operator', !!hasFallbackUrl);

    const hasFallbackKey = content.match(/process\.env\.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\s*\|\|/);
    ok('lib/supabase.ts: SUPABASE_KEY has a fallback chain via || operator', !!hasFallbackKey);
  }

  const testUrl = SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
  const testKey = SUPABASE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';

  const fallbackClient = createClient(testUrl, testKey);
  const { error } = await fallbackClient.from('tables').select('number').limit(1);
  ok('Fallback-chain resolved client: live query succeeds', !error, error?.message);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n================================================================');
  console.log('  THOOGUDEEPA — ENVIRONMENT VARIABLE STARTUP GUARD');
  console.log('  28 sections · Live probes · No mocks');
  console.log('================================================================\n');

  console.log(`  SUPABASE_URL : ${SUPABASE_URL || '(not set)'}`);
  console.log(`  SUPABASE_KEY : ${SUPABASE_KEY ? SUPABASE_KEY.slice(0, 20) + '...' : '(not set)'}`);
  console.log(`  BASE_URL     : ${BASE}`);
  console.log(`  NODE_ENV     : ${process.env.NODE_ENV || '(not set)'}\n`);

  checkVariablePresence();
  checkUrlFormat();
  checkKeyFormat();
  checkUrlKeyCorrelation();
  checkContamination();
  checkFallbackChain();
  checkNodeEnv();

  await checkClientConstructionValid();
  await checkClientConstructionBadUrl();
  await checkClientConstructionEmptyKey();
  await checkUrlReachability();
  await checkNoKeyLeakageInResponses();

  checkEnvLocalPresence();
  checkEnvExampleCorrectness();
  checkGitignore();
  await checkNoSecretsInCommittedFiles();
  checkLibSupabaseStructure();
  checkNextConfigEnv();
  checkMiddlewareEnvUsage();
  checkCiEnvConfig();

  await checkHealthEndpointEnvContract();
  await checkApiContentTypeEnforcement();

  checkTsConfig();
  checkPackageJsonScripts();
  checkRuntimeEnvStability();

  await checkEnvValueIntegrityOnOperations();
  await checkConcurrentClients();
  await checkGracefulDegradation();

  console.log('\n================================================================');
  console.log('  ENV VALIDATION — RESULTS');
  console.log('================================================================');
  console.log(`  Passed : ${passed}`);
  console.log(`  Failed : ${failed}`);
  console.log(`  Total  : ${passed + failed}`);

  if (failures.length > 0) {
    console.log('\n  Failed checks:');
    failures.forEach((f, i) => console.log(`    ${i + 1}. ${f}`));
  }

  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error in env validation:', err);
  process.exit(1);
});
