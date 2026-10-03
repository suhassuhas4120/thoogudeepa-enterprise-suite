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
 * Execution: npx tsx scripts/run-all-tests.ts
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

const SUITES = [
  {
    name: 'Customer Workflow & Security Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-customer-workflow-matrix.ts'],
  },
  {
    name: 'Kitchen KDS & Bulking Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-kitchen-workflow-matrix.ts'],
  },
  {
    name: 'Waiter Handheld & Cockpit Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-waiter-workflow-matrix.ts'],
  },
  {
    name: 'Customer-Kitchen Bidirectional Sync Matrix',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-customer-kitchen-sync-matrix.ts'],
  },
  {
    name: 'Phase 9 E2E Multi-Portal Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase9-comprehensive.ts'],
  },
  {
    name: 'Phase 10 Invariants & Defensive Guard Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-phase10-comprehensive.ts'],
  },
  {
    name: 'Full E2E Dining Lifecycle Suite',
    cmd: 'node',
    args: ['scripts/test-e2e-lifecycle.js'],
  },
  {
    name: 'Peak Rush Concurrency Stress Simulation',
    cmd: 'node',
    args: ['scripts/simulate-peak-rush.js'],
  },
  {
    name: 'DB Schema Validation Suite',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-db-schema-validation.ts'],
  },
  {
    name: 'Environment Variable Startup Guard',
    cmd: 'npx',
    args: ['tsx', 'scripts/test-env-validation.ts'],
  },
];

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
      console.error(`\n[ABORT] Suite failed: ${suite.name} (exit code ${child.status})`);
      break;
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
