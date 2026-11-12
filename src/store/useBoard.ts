import { useCallback, useEffect, useRef, useState } from 'react';
import type { Board } from '../types';
import { boardReducer, type BoardAction } from './boardReducer';
import { createSeedBoard } from './seed';
import { loadBoard, saveBoard } from './storage';

const HISTORY_LIMIT = 50;

interface History {
  past: Board[];
  present: Board;
  future: Board[];
}

/** Actions that happen continuously during a drag and should not each create an undo step. */
const TRANSIENT: ReadonlySet<BoardAction['type']> = new Set(['card/move', 'column/move']);

export function useBoard() {
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: loadBoard() ?? createSeedBoard(),
    future: [],
  }));
  const dragSnapshot = useRef<Board | null>(null);

  useEffect(() => {
    saveBoard(history.present);
  }, [history.present]);

  const dispatch = useCallback((action: BoardAction) => {
    setHistory((h) => {
      const next = boardReducer(h.present, action);
      if (next === h.present) return h;
      if (TRANSIENT.has(action.type) && dragSnapshot.current) {
        return { ...h, present: next };
      }
      return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: next, future: [] };
    });
  }, []);

  /** Call when a drag starts; all moves until `endTransaction` collapse into one undo step. */
  const beginTransaction = useCallback(() => {
    setHistory((h) => {
      dragSnapshot.current = h.present;
      return h;
    });
  }, []);

  const endTransaction = useCallback(() => {
    const snapshot = dragSnapshot.current;
    dragSnapshot.current = null;
    if (!snapshot) return;
    setHistory((h) =>
      h.present === snapshot
        ? h
        : { past: [...h.past, snapshot].slice(-HISTORY_LIMIT), present: h.present, future: [] },
    );
  }, []);

  /** Aborts a drag: restores the board as it was when the transaction began. */
  const cancelTransaction = useCallback(() => {
    const snapshot = dragSnapshot.current;
    dragSnapshot.current = null;
    if (snapshot) setHistory((h) => ({ ...h, present: snapshot }));
  }, []);

  const undo = useCallback(() => {
    setHistory((h) =>
      h.past.length === 0
        ? h
        : { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] },
    );
  }, []);

  const redo = useCallback(() => {
    setHistory((h) =>
      h.future.length === 0
        ? h
        : { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) },
    );
  }, []);

  return {
    board: history.present,
    dispatch,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    beginTransaction,
    endTransaction,
    cancelTransaction,
  };
}
