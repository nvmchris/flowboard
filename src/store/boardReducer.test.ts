import { describe, expect, it } from 'vitest';
import { boardReducer, findColumnOfCard } from './boardReducer';
import { createSeedBoard } from './seed';

const seed = () => createSeedBoard();

describe('boardReducer', () => {
  describe('columns', () => {
    it('adds a column at the end', () => {
      const board = boardReducer(seed(), { type: 'column/add', title: '  Review  ', id: 'review' });
      expect(board.columnOrder.at(-1)).toBe('review');
      expect(board.columns.review).toEqual({ id: 'review', title: 'Review', cardIds: [] });
    });

    it('ignores blank column titles', () => {
      const before = seed();
      expect(boardReducer(before, { type: 'column/add', title: '   ' })).toBe(before);
    });

    it('renames a column', () => {
      const board = boardReducer(seed(), { type: 'column/rename', columnId: 'todo', title: 'Next up' });
      expect(board.columns.todo.title).toBe('Next up');
    });

    it('deletes a column together with its cards', () => {
      const before = seed();
      const cardIds = before.columns.backlog.cardIds;
      const board = boardReducer(before, { type: 'column/delete', columnId: 'backlog' });
      expect(board.columns.backlog).toBeUndefined();
      expect(board.columnOrder).not.toContain('backlog');
      cardIds.forEach((id) => expect(board.cards[id]).toBeUndefined());
    });

    it('reorders columns and clamps the target index', () => {
      const board = boardReducer(seed(), { type: 'column/move', columnId: 'backlog', toIndex: 99 });
      expect(board.columnOrder).toEqual(['todo', 'doing', 'done', 'backlog']);
    });

    it('sets and clears a WIP limit', () => {
      let board = boardReducer(seed(), { type: 'column/setWipLimit', columnId: 'todo', wipLimit: 4.7 });
      expect(board.columns.todo.wipLimit).toBe(4);
      board = boardReducer(board, { type: 'column/setWipLimit', columnId: 'todo', wipLimit: 0 });
      expect(board.columns.todo.wipLimit).toBeUndefined();
    });

    it('clears all cards of a column', () => {
      const board = boardReducer(seed(), { type: 'column/clear', columnId: 'done' });
      expect(board.columns.done.cardIds).toEqual([]);
      expect(board.cards.c8).toBeUndefined();
    });
  });

  describe('cards', () => {
    it('adds a card with sensible defaults', () => {
      const board = boardReducer(seed(), { type: 'card/add', columnId: 'todo', card: { id: 'new', title: ' Write tests ' } });
      expect(board.columns.todo.cardIds.at(-1)).toBe('new');
      expect(board.cards.new).toMatchObject({ title: 'Write tests', priority: 'medium', labelIds: [], description: '' });
    });

    it('updates a card but never blanks its title', () => {
      let board = boardReducer(seed(), { type: 'card/update', cardId: 'c1', changes: { priority: 'high', title: '' } });
      expect(board.cards.c1.priority).toBe('high');
      expect(board.cards.c1.title).toBe('Offline sync with service worker');
      board = boardReducer(board, { type: 'card/update', cardId: 'c1', changes: { title: 'Renamed' } });
      expect(board.cards.c1.title).toBe('Renamed');
    });

    it('deletes a card from its column', () => {
      const board = boardReducer(seed(), { type: 'card/delete', cardId: 'c4' });
      expect(board.cards.c4).toBeUndefined();
      expect(board.columns.todo.cardIds).not.toContain('c4');
    });

    it('reorders a card within its column', () => {
      const board = boardReducer(seed(), { type: 'card/move', cardId: 'c3', toColumnId: 'backlog', toIndex: 0 });
      expect(board.columns.backlog.cardIds).toEqual(['c3', 'c1', 'c2']);
    });

    it('moves a card to another column at a given index', () => {
      const board = boardReducer(seed(), { type: 'card/move', cardId: 'c1', toColumnId: 'done', toIndex: 1 });
      expect(board.columns.backlog.cardIds).toEqual(['c2', 'c3']);
      expect(board.columns.done.cardIds).toEqual(['c8', 'c1', 'c9']);
      expect(findColumnOfCard(board, 'c1')?.id).toBe('done');
    });

    it('appends when the target index is out of range', () => {
      const board = boardReducer(seed(), { type: 'card/move', cardId: 'c1', toColumnId: 'todo', toIndex: Infinity });
      expect(board.columns.todo.cardIds.at(-1)).toBe('c1');
    });

    it('returns the same board for no-op moves', () => {
      const before = seed();
      expect(boardReducer(before, { type: 'card/move', cardId: 'c1', toColumnId: 'backlog', toIndex: 0 })).toBe(before);
      expect(boardReducer(before, { type: 'card/move', cardId: 'missing', toColumnId: 'todo', toIndex: 0 })).toBe(before);
    });
  });

  it('does not mutate the previous state', () => {
    const before = seed();
    const snapshot = structuredClone(before);
    boardReducer(before, { type: 'card/move', cardId: 'c1', toColumnId: 'done', toIndex: 0 });
    boardReducer(before, { type: 'column/delete', columnId: 'todo' });
    expect(before).toEqual(snapshot);
  });
});
