/**
 * Unified Test Suite Runner — Thoogudeepa Enterprise Suite
 *
 * Sequentially executes all automated testing layers:
 * 1. Customer Workflow & Security Matrix
 * 2. Kitchen KDS & Bulking Matrix
 * 3. Waiter Handheld & Cockpit Matrix
 * 4. Customer-Kitchen Bidirectional Sync Matrix
 * 5. Phase 9 E2E Lifecycle Suite
 * 6. Phase 10 Defensive Invariants Suite
 * 7. Peak Rush Concurrency Stress Simulation
 * 8. End-to-End Dining Lifecycle Suite
 *
 * Execution: npx tsx scripts/run-all-tests.ts [--group=static|live|quarantine|all] [--keep-going]
 * (--keep-going is implied when CI=true so one red suite cannot hide the others)
 */

import { spawnSync } from 'child_process';
import path from 'path';

interface SuiteResult {
  name: string;
  command: string;
  durationMs: number;
  passed: boolean;
  exitCode: number;
}

const ROOT_DIR = path.resolve(__dirname, '..');

type Group = 'static' | 'live' | 'quarantine';

interface SuiteDef {
  name: string;
  cmd: string;
  args: string[];
  group: Group;
}

// static     = reads source files only, no server / DB needed (safe on every PR)
// live       = needs the app running at TEST_BASE_URL and a Supabase test project
// quarantine = offline suites with known stale assertions; reported but non-blocking in CI
const ALL_SUITES: SuiteDef[] = [
  {
    name: 'Phase 3 Waiter Tablet & Hardware Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase3-comprehensive.ts'],
    group: 'static',
  },
  {
    name: 'Phase 5 Customer Portal Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase5-comprehensive.ts'],
    group: 'static',
  },
  {
    name: 'Phase 6 Cross-Portal Bridge Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase6-comprehensive.ts'],
    group: 'static',
  },
  {
    name: 'Phase 7 Waiter Mobile & State Architecture Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase7-comprehensive.ts'],
    group: 'static',
  },
  {
    name: 'Phase 8 Visual & UX Components Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase8-comprehensive.ts'],
    group: 'static',
  },
  {
    name: 'Waiter Comprehensive Multi-Form Test Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-waiter-comprehensive-matrix.ts'],
    group: 'static',
  },
  {
    name: 'Phase 9 E2E Multi-Portal Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase9-comprehensive.ts'],
    group: 'static',
  },
  {
    name: 'Phase 10 Invariants & Defensive Guard Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase10-comprehensive.ts'],
    group: 'static',
  },
  {
    name: 'Phase 1 Seating & Single Active Chair Lock Simulation',
    cmd: 'node',
    args: ['scripts/test-phase1-simulation.mjs'],
    group: 'live',
  },
  {
    name: 'Phase 1 Database Schema & Floor Plan Integrity Suite',
    cmd: 'node',
    args: ['scripts/test-phase1-comprehensive.js'],
    group: 'live',
  },
  {
    name: 'Phase 2 Comprehensive REST API Endpoints Suite',
    cmd: 'node',
    args: ['scripts/test-phase2-comprehensive.js'],
    group: 'live',
  },
  {
    name: 'Phase 2 Global Hardware & Cross-Seat Isolation Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase2-cross-seat.ts'],
    group: 'live',
  },
  {
    name: 'Phase 2 Multi-Device Autonomous Session Recovery Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase2-recovery.ts'],
    group: 'live',
  },
  {
    name: 'Phase 3 Cryptographic Perimeter & Anti-Tampering Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase3-perimeter.ts'],
    group: 'live',
  },
  {
    name: 'Phase 4 NPCI UPI, Dynamic QR & Payment Gateway Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase4-comprehensive.ts'],
    group: 'live',
  },
  {
    name: 'Customer Workflow & Security Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-customer-workflow-matrix.ts'],
    group: 'live',
  },
  {
    name: 'Kitchen KDS & Bulking Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-kitchen-workflow-matrix.ts'],
    group: 'live',
  },
  {
    name: 'Waiter Handheld & Cockpit Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-waiter-workflow-matrix.ts'],
    group: 'live',
  },
  {
    name: 'Customer-Kitchen Bidirectional Sync Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-customer-kitchen-sync-matrix.ts'],
    group: 'live',
  },
  {
    name: 'Full E2E Dining Lifecycle Suite',
    cmd: 'node',
    args: ['scripts/test-e2e-lifecycle.js'],
    group: 'live',
  },
  {
    name: 'Peak Rush Concurrency Stress Simulation',
    cmd: 'node',
    args: ['scripts/simulate-peak-rush.js'],
    group: 'live',
  },
  {
    name: 'DB Schema Validation Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-db-schema-validation.ts'],
    group: 'live',
  },
  {
    name: 'Environment Variable Startup Guard',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-env-validation.ts'],
    group: 'live',
  },
];

const argv = process.argv.slice(2);
const groupArg = (argv.find((a) => a.startsWith('--group=')) || '--group=all').split('=')[1];
const KEEP_GOING = argv.includes('--keep-going') || process.env.CI === 'true';
const SUITES = ALL_SUITES.filter((s) => groupArg === 'all' ? s.group !== 'quarantine' : s.group === groupArg);

if (SUITES.length === 0) {
  console.error(`No suites for group "${groupArg}". Use --group=static|live|quarantine|all`);
  process.exit(1);
}

async function main() {
  console.log('\n================================================================');
  console.log('  THOOGUDEEPA ENTERPRISE SUITE — MASTER TEST RUNNER');
  console.log(`  Executing ${SUITES.length} comprehensive testing suites`);
  console.log('================================================================\n');

  const results: SuiteResult[] = [];
  const globalStart = Date.now();

  for (let i = 0; i < SUITES.length; i++) {
    const suite = SUITES[i];
    console.log(`[${i + 1}/${SUITES.length}] Executing: ${suite.name}...`);
    const start = Date.now();

    const child = spawnSync(suite.cmd, suite.args, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        TEST_BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3001',
      },
    });

    const durationMs = Date.now() - start;
    const passed = child.status === 0;

    results.push({
      name: suite.name,
      command: `${suite.cmd} ${suite.args.join(' ')}`,
      durationMs,
      passed,
      exitCode: child.status ?? 1,
    });

    if (!passed) {
      console.error(`\n[FAIL] Suite failed: ${suite.name} (exit code ${child.status})`);
      if (!KEEP_GOING) {
        console.error('[ABORT] Stopping early (pass --keep-going to run remaining suites).');
        break;
      }
    }
  }

  const totalDurationMs = Date.now() - globalStart;
  const allPassed = results.every((r) => r.passed) && results.length === SUITES.length;

  console.log('\n================================================================');
  console.log('  MASTER TEST SUMMARY REPORT');
  console.log('================================================================');

  results.forEach((r, idx) => {
    const statusMark = r.passed ? '[PASS]' : '[FAIL]';
    const durationSec = (r.durationMs / 1000).toFixed(1);
    console.log(`  ${idx + 1}. ${statusMark} ${r.name.padEnd(46)} (${durationSec}s)`);
  });

  console.log('----------------------------------------------------------------');
  console.log(`  Total Suites: ${SUITES.length} | Executed: ${results.length} | Passed: ${results.filter(r => r.passed).length} | Failed: ${results.filter(r => !r.passed).length}`);
  console.log(`  Total Execution Time: ${(totalDurationMs / 1000).toFixed(1)}s`);
  console.log('================================================================\n');

  if (allPassed) {
    console.log('All automated test suites executed successfully with 100% compliance.');
    process.exit(0);
  } else {
    console.error('Test execution failed. See individual suite output above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
