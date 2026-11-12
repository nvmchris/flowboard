import { beforeEach, describe, expect, it } from 'vitest';
import { createSeedBoard } from './seed';
import { STORAGE_KEY, isBoard, loadBoard, saveBoard } from './storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a board through localStorage', () => {
    const board = createSeedBoard();
    saveBoard(board);
    expect(loadBoard()).toEqual(board);
  });

  it('returns null for missing or corrupt data', () => {
    expect(loadBoard()).toBeNull();
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadBoard()).toBeNull();
  });

  it('rejects boards that reference unknown cards', () => {
    const board = createSeedBoard();
    board.columns.todo.cardIds.push('ghost');
    expect(isBoard(board)).toBe(false);
    expect(isBoard({ hello: 'world' })).toBe(false);
  });
});
