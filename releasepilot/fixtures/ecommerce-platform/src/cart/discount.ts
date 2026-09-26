/**
 * E-Commerce Platform — Cart Discount Module
 * Fixture file for ReleasePilot AI Proof Mode.
 *
 * INTENTIONAL BUG: Floating-point arithmetic causes 0.001¢ discrepancies.
 * Tests for exact monetary equality will fail on buggy version.
 */

/**
 * BUGGY: Uses float arithmetic directly
 */
export function applyDiscountBuggy(price: number, pct: number): number {
  return price - (price * pct / 100);
}

/**
 * FIXED: Uses integer-cent math to avoid floating-point errors
 */
export function applyDiscountFixed(price: number, pct: number): number {
  const cents = Math.round(price * 100);
  const discountCents = Math.round(cents * pct / 100);
  return (cents - discountCents) / 100;
}
