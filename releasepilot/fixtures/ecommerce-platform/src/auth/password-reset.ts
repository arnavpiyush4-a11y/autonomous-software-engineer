/**
 * E-Commerce Platform — Auth Module
 * Fixture file for ReleasePilot AI Proof Mode.
 *
 * INTENTIONAL BUG (line 32):
 *   Password reset tokens are never invalidated after use.
 *   An attacker can reuse a captured token for account takeover.
 *
 * This bug is real and reproducible. The regression test in
 * tests/run.js will fail on the BUGGY version and pass on the
 * FIXED version, demonstrating ReleasePilot's fix evidence.
 */

/** Simulated in-memory token store (would be DB in production) */
const TOKEN_STORE: Map<string, { userId: string; usedAt: Date | null; expiresAt: Date }> = new Map();

export function createResetToken(userId: string): string {
  const token = `reset_${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  TOKEN_STORE.set(token, {
    userId,
    usedAt: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return token;
}

/**
 * BUGGY IMPLEMENTATION — token.usedAt check is missing.
 * After a successful reset, the token is never marked as used,
 * allowing replay attacks.
 */
export function resetPasswordBuggy(token: string, _newPassword: string): { success: boolean; error?: string } {
  const record = TOKEN_STORE.get(token);

  if (!record) {
    return { success: false, error: 'Token not found' };
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: 'Token expired' };
  }

  // BUG: Missing check: if (record.usedAt) return error
  // BUG: Missing: record.usedAt = new Date();

  // Simulate password update
  return { success: true };
}

/**
 * FIXED IMPLEMENTATION — invalidates token after first use.
 */
export function resetPasswordFixed(token: string, _newPassword: string): { success: boolean; error?: string } {
  const record = TOKEN_STORE.get(token);

  if (!record) {
    return { success: false, error: 'Token not found' };
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: 'Token expired' };
  }

  // FIX: Reject already-used tokens
  if (record.usedAt) {
    return { success: false, error: 'Token already used' };
  }

  // FIX: Mark token as used immediately
  record.usedAt = new Date();

  return { success: true };
}
