import { describe, expect, it } from 'vitest';
import { DEFAULT_LABELS } from '../store/seed';
import type { Card } from '../types';
import { EMPTY_FILTERS, isFilterActive, matchesFilters } from './filter';

const card: Card = {
  id: 'x',
  title: 'Fix login redirect',
  description: 'Users land on a blank page after OAuth',
  labelIds: ['lbl_bug', 'lbl_infra'],
  priority: 'high',
  createdAt: 0,
};

describe('filters', () => {
  it('detects whether any filter is active', () => {
    expect(isFilterActive(EMPTY_FILTERS)).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTERS, query: '  ' })).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTERS, priority: 'low' })).toBe(true);
  });

  it('matches the query against title, description and label names', () => {
    const match = (query: string) => matchesFilters(card, { ...EMPTY_FILTERS, query }, DEFAULT_LABELS);
    expect(match('LOGIN')).toBe(true);
    expect(match('oauth')).toBe(true);
    expect(match('infra')).toBe(true);
    expect(match('design')).toBe(false);
  });

  it('requires every selected label', () => {
    const match = (labelIds: string[]) => matchesFilters(card, { ...EMPTY_FILTERS, labelIds }, DEFAULT_LABELS);
    expect(match(['lbl_bug'])).toBe(true);
    expect(match(['lbl_bug', 'lbl_infra'])).toBe(true);
    expect(match(['lbl_bug', 'lbl_docs'])).toBe(false);
  });

  it('filters by priority', () => {
    expect(matchesFilters(card, { ...EMPTY_FILTERS, priority: 'high' }, DEFAULT_LABELS)).toBe(true);
    expect(matchesFilters(card, { ...EMPTY_FILTERS, priority: 'low' }, DEFAULT_LABELS)).toBe(false);
  });
});
