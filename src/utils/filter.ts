import type { Card, Filters, Label } from '../types';

export const EMPTY_FILTERS: Filters = { query: '', labelIds: [], priority: 'all' };

export function isFilterActive(filters: Filters): boolean {
  return filters.query.trim() !== '' || filters.labelIds.length > 0 || filters.priority !== 'all';
}

export function matchesFilters(card: Card, filters: Filters, labels: Label[]): boolean {
  if (filters.priority !== 'all' && card.priority !== filters.priority) return false;
  if (filters.labelIds.length > 0 && !filters.labelIds.every((id) => card.labelIds.includes(id))) return false;

  const query = filters.query.trim().toLowerCase();
  if (!query) return true;
  const labelNames = card.labelIds
    .map((id) => labels.find((l) => l.id === id)?.name ?? '')
    .join(' ');
  return `${card.title} ${card.description} ${labelNames}`.toLowerCase().includes(query);
}
