import type { Board, Card, Column } from '../types';
import { createId } from '../utils/id';

export type BoardAction =
  | { type: 'board/rename'; title: string }
  | { type: 'board/replace'; board: Board }
  | { type: 'column/add'; title: string; id?: string }
  | { type: 'column/rename'; columnId: string; title: string }
  | { type: 'column/setWipLimit'; columnId: string; wipLimit?: number }
  | { type: 'column/delete'; columnId: string }
  | { type: 'column/move'; columnId: string; toIndex: number }
  | { type: 'column/clear'; columnId: string }
  | { type: 'card/add'; columnId: string; card: Partial<Card> & { title: string } }
  | { type: 'card/update'; cardId: string; changes: Partial<Omit<Card, 'id'>> }
  | { type: 'card/delete'; cardId: string }
  | { type: 'card/move'; cardId: string; toColumnId: string; toIndex: number };

export function findColumnOfCard(board: Board, cardId: string): Column | undefined {
  return board.columnOrder.map((id) => board.columns[id]).find((c) => c.cardIds.includes(cardId));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function boardReducer(board: Board, action: BoardAction): Board {
  switch (action.type) {
    case 'board/rename':
      return { ...board, title: action.title.trim() || board.title };

    case 'board/replace':
      return action.board;

    case 'column/add': {
      const title = action.title.trim();
      if (!title) return board;
      const id = action.id ?? createId('col');
      return {
        ...board,
        columnOrder: [...board.columnOrder, id],
        columns: { ...board.columns, [id]: { id, title, cardIds: [] } },
      };
    }

    case 'column/rename': {
      const column = board.columns[action.columnId];
      const title = action.title.trim();
      if (!column || !title) return board;
      return { ...board, columns: { ...board.columns, [column.id]: { ...column, title } } };
    }

    case 'column/setWipLimit': {
      const column = board.columns[action.columnId];
      if (!column) return board;
      const wipLimit = action.wipLimit && action.wipLimit > 0 ? Math.floor(action.wipLimit) : undefined;
      return { ...board, columns: { ...board.columns, [column.id]: { ...column, wipLimit } } };
    }

    case 'column/delete': {
      const column = board.columns[action.columnId];
      if (!column) return board;
      const columns = { ...board.columns };
      delete columns[column.id];
      const cards = { ...board.cards };
      column.cardIds.forEach((id) => delete cards[id]);
      return {
        ...board,
        columns,
        cards,
        columnOrder: board.columnOrder.filter((id) => id !== column.id),
      };
    }

    case 'column/move': {
      const from = board.columnOrder.indexOf(action.columnId);
      if (from === -1) return board;
      const to = clamp(action.toIndex, 0, board.columnOrder.length - 1);
      if (from === to) return board;
      return { ...board, columnOrder: moveItem(board.columnOrder, from, to) };
    }

    case 'column/clear': {
      const column = board.columns[action.columnId];
      if (!column || column.cardIds.length === 0) return board;
      const cards = { ...board.cards };
      column.cardIds.forEach((id) => delete cards[id]);
      return {
        ...board,
        cards,
        columns: { ...board.columns, [column.id]: { ...column, cardIds: [] } },
      };
    }

    case 'card/add': {
      const column = board.columns[action.columnId];
      const title = action.card.title.trim();
      if (!column || !title) return board;
      const card: Card = {
        description: '',
        labelIds: [],
        priority: 'medium',
        createdAt: Date.now(),
        ...action.card,
        id: action.card.id ?? createId('card'),
        title,
      };
      return {
        ...board,
        cards: { ...board.cards, [card.id]: card },
        columns: { ...board.columns, [column.id]: { ...column, cardIds: [...column.cardIds, card.id] } },
      };
    }

    case 'card/update': {
      const card = board.cards[action.cardId];
      if (!card) return board;
      const next = { ...card, ...action.changes };
      next.title = next.title.trim() || card.title;
      return { ...board, cards: { ...board.cards, [card.id]: next } };
    }

    case 'card/delete': {
      const column = findColumnOfCard(board, action.cardId);
      if (!column) return board;
      const cards = { ...board.cards };
      delete cards[action.cardId];
      return {
        ...board,
        cards,
        columns: {
          ...board.columns,
          [column.id]: { ...column, cardIds: column.cardIds.filter((id) => id !== action.cardId) },
        },
      };
    }

    case 'card/move': {
      const source = findColumnOfCard(board, action.cardId);
      const target = board.columns[action.toColumnId];
      if (!source || !target) return board;

      if (source.id === target.id) {
        const from = source.cardIds.indexOf(action.cardId);
        const to = clamp(action.toIndex, 0, source.cardIds.length - 1);
        if (from === to) return board;
        return {
          ...board,
          columns: { ...board.columns, [source.id]: { ...source, cardIds: moveItem(source.cardIds, from, to) } },
        };
      }

      const targetIds = [...target.cardIds];
      targetIds.splice(clamp(action.toIndex, 0, targetIds.length), 0, action.cardId);
      return {
        ...board,
        columns: {
          ...board.columns,
          [source.id]: { ...source, cardIds: source.cardIds.filter((id) => id !== action.cardId) },
          [target.id]: { ...target, cardIds: targetIds },
        },
      };
    }
  }
}
