import { describe, expect, it } from 'vitest';
import { formatDueDate, getDueState } from './date';

const now = new Date(2026, 10, 12, 15, 30); // Nov 12, 2026

describe('due dates', () => {
  it('classifies due dates relative to today', () => {
    expect(getDueState('2026-11-11', now)).toBe('overdue');
    expect(getDueState('2026-11-12', now)).toBe('today');
    expect(getDueState('2026-11-14', now)).toBe('soon');
    expect(getDueState('2026-11-20', now)).toBe('later');
  });

  it('formats dates compactly', () => {
    expect(formatDueDate('2026-11-12', now)).toBe('Today');
    expect(formatDueDate('2026-12-03', now)).toBe('Dec 3');
    expect(formatDueDate('2027-01-05', now)).toBe('Jan 5, 2027');
  });
});
