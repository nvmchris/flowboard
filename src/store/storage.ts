import type { Board } from '../types';

export const STORAGE_KEY = 'flowboard:board:v1';

/** Validates the shape of an unknown value well enough to safely render it. */
export function isBoard(value: unknown): value is Board {
  if (!value || typeof value !== 'object') return false;
  const b = value as Partial<Board>;
  if (b.version !== 1 || typeof b.title !== 'string') return false;
  if (!Array.isArray(b.columnOrder) || !b.columns || !b.cards || !Array.isArray(b.labels)) return false;
  return b.columnOrder.every((id) => {
    const col = b.columns![id];
    return col && Array.isArray(col.cardIds) && col.cardIds.every((cid) => cid in b.cards!);
  });
}

export function loadBoard(): Board | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isBoard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveBoard(board: Board): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch {
    // Storage may be full or unavailable (private mode). The app keeps working in memory.
  }
}
