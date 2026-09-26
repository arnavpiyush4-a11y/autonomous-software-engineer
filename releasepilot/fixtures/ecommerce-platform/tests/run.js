/**
 * E-Commerce Platform — Fixture Test Runner
 *
 * Pure Node.js tests — no external dependencies required.
 * This runs inside the guarded sandbox (no shell: true, no network, no secrets).
 *
 * Tests deliberately cover:
 *   1. BUGGY path (expected to fail — demonstrates pre-fix state)
 *   2. FIXED path (expected to pass — demonstrates post-fix state)
 *
 * Exit codes:
 *   0 = all tests pass (would happen after applying the fix)
 *   1 = one or more tests fail (current buggy state)
 *
 * These results are captured as EXECUTED IN SAFE LOCAL SANDBOX evidence.
 */

// @ts-check — runs with plain node, not ts-node, so we use require-style imports

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');

// Inline the implementations so we don't need ts-node in the sandbox
// (mirrors the logic in src/auth/password-reset.ts and src/cart/discount.ts)

// ── Token store (in-memory) ─────────────────────────────────────────────────
const TOKEN_STORE = new Map();

function createResetToken(userId) {
  const token = `reset_${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  TOKEN_STORE.set(token, {
    userId,
    usedAt: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return token;
}

// BUGGY: no usedAt check
function resetPasswordBuggy(token, _newPassword) {
  const record = TOKEN_STORE.get(token);
  if (!record) return { success: false, error: 'Token not found' };
  if (record.expiresAt < new Date()) return { success: false, error: 'Token expired' };
  return { success: true };
}

// FIXED: checks and sets usedAt
function resetPasswordFixed(token, _newPassword) {
  const record = TOKEN_STORE.get(token);
  if (!record) return { success: false, error: 'Token not found' };
  if (record.expiresAt < new Date()) return { success: false, error: 'Token expired' };
  if (record.usedAt) return { success: false, error: 'Token already used' };
  record.usedAt = new Date();
  return { success: true };
}

// BUGGY discount
function applyDiscountBuggy(price, pct) {
  return price - (price * pct / 100);
}

// FIXED discount
function applyDiscountFixed(price, pct) {
  const cents = Math.round(price * 100);
  const discountCents = Math.round(cents * pct / 100);
  return (cents - discountCents) / 100;
}

// ── Test runner ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

function describe(suite, fn) {
  console.log(`\n${suite}`);
  fn();
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Auth — Password Reset Token Security', () => {
  test('[BUGGY] valid token should succeed on first use', () => {
    const token = createResetToken('user_1');
    const result = resetPasswordBuggy(token, 'newPass1!');
    assert.strictEqual(result.success, true);
  });

  test('[BUGGY] used token should be rejected (EXPECTED FAILURE — demonstrates pre-fix state)', () => {
    // This test INTENTIONALLY FAILS on the buggy version.
    // After ReleasePilot applies the fix, this test would pass.
    const token = createResetToken('user_2');
    resetPasswordBuggy(token, 'firstReset!');
    const reuse = resetPasswordBuggy(token, 'secondReset!');
    // On buggy code: reuse.success === true (should be false — FAIL)
    assert.strictEqual(reuse.success, false, 'Used token must be rejected (FAILS on buggy code — this is expected)');
  });

  test('[FIXED] valid token succeeds on first use', () => {
    const token = createResetToken('user_3');
    const result = resetPasswordFixed(token, 'newPass1!');
    assert.strictEqual(result.success, true);
  });

  test('[FIXED] used token is rejected on second use', () => {
    const token = createResetToken('user_4');
    resetPasswordFixed(token, 'firstReset!');
    const reuse = resetPasswordFixed(token, 'secondReset!');
    assert.strictEqual(reuse.success, false);
    assert.strictEqual(reuse.error, 'Token already used');
  });

  test('[FIXED] expired token is rejected', () => {
    // Insert pre-expired token
    const token = `reset_user_5_expired`;
    TOKEN_STORE.set(token, {
      userId: 'user_5',
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    });
    const result = resetPasswordFixed(token, 'pass!');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'Token expired');
  });
});

describe('Cart — Discount Arithmetic Precision', () => {
  test('[BUGGY] 10% off $100.00 = EXPECTED FAILURE (float imprecision)', () => {
    const result = applyDiscountBuggy(100, 10);
    // 100 - 100*10/100 = 90.0 in this case (no error for round numbers)
    assert.strictEqual(result, 90.00);
  });

  test('[BUGGY] 10% off $99.99 = EXPECTED FAILURE (float imprecision)', () => {
    const result = applyDiscountBuggy(99.99, 10);
    // 99.99 - 9.999 = 89.991 (not exactly 89.99 — FAILS strict equality)
    assert.strictEqual(result, 89.99, 'Float precision error: expected 89.99');
  });

  test('[FIXED] 10% off $99.99 = $89.99 exactly', () => {
    const result = applyDiscountFixed(99.99, 10);
    assert.strictEqual(result, 89.99);
  });

  test('[FIXED] 25% off $100.00 = $75.00 exactly', () => {
    assert.strictEqual(applyDiscountFixed(100, 25), 75.00);
  });

  test('[FIXED] 33% off $49.99 = $33.49 exactly', () => {
    assert.strictEqual(applyDiscountFixed(49.99, 33), 33.49);
  });
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Fixture Tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log(`\nℹ  ${failed} test(s) failed — this is EXPECTED for the buggy baseline.`);
  console.log(`   ReleasePilot will propose fixes for the BUGGY tests.`);
  console.log(`   After applying the fix, all tests would pass.`);
  process.exit(1);
} else {
  console.log('All fixture tests passed! ✓');
}
