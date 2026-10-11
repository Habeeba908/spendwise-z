import { describe, expect, it } from 'vitest';
import { applyDecision, calculateFinancialSummary, seed } from './finance';

describe('calculateFinancialSummary', () => {
  const summary = calculateFinancialSummary(seed);
  it('balance = income - spending - paid bills - savings', () => expect(summary.balance).toBe(10000 - 1200 - 299 - 1400));
  it('reserves unpaid commitments and active subscriptions', () => expect(summary.reserved).toBe(2500 + 892));
  it('daily allowance = free cash / days left', () => expect(summary.allowance).toBeCloseTo(summary.free / 22));
  it('risk and health stay within 0-100', () => {
    expect(summary.risk).toBeGreaterThanOrEqual(0); expect(summary.risk).toBeLessThanOrEqual(100);
    expect(summary.health).toBeGreaterThanOrEqual(0); expect(summary.health).toBeLessThanOrEqual(100);
  });
});

describe('applyDecision', () => {
  const base = { amt: 500, ref: 1, cat: 'Food' };
  it('spending lowers balance', () => expect(calculateFinancialSummary(applyDecision(seed, { ...base, kind: 'spend' })).balance).toBe(7101 - 500));
  it('extra income raises balance', () => expect(calculateFinancialSummary(applyDecision(seed, { ...base, kind: 'income' })).balance).toBe(7101 + 500));
  it('cancelling a subscription frees reserved cash', () => expect(calculateFinancialSummary(applyDecision(seed, { ...base, kind: 'cancel', ref: 3 })).reserved).toBe(3392 - 499));
  it('never mutates the original state', () => { applyDecision(seed, { ...base, kind: 'spend' }); expect(seed.txs.length).toBe(4); });
});

import { isValidState, sanitizeAmount, sanitizeText } from './finance';
describe('input sanitization', () => {
  it('strips angle brackets and limits length', () => { expect(sanitizeText('<b>Hi</b>')).toBe('bHi/b'); expect(sanitizeText('x'.repeat(99)).length).toBe(40); });
  it('clamps amounts to a safe range', () => { expect(sanitizeAmount(-5)).toBe(0); expect(sanitizeAmount(NaN)).toBe(0); expect(sanitizeAmount(9e12)).toBe(1_000_000); });
  it('rejects malformed stored state', () => { expect(isValidState({})).toBe(false); expect(isValidState(seed)).toBe(true); });
});
