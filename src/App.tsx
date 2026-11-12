import { useCallback, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Board, Card, Column, Filters } from './types';
import { useBoard } from './store/useBoard';
import { findColumnOfCard } from './store/boardReducer';
import { createSeedBoard } from './store/seed';
import { isBoard } from './store/storage';
import { useTheme } from './hooks/useTheme';
import { useHotkeys } from './hooks/useHotkeys';
import { EMPTY_FILTERS, isFilterActive, matchesFilters } from './utils/filter';
import { Header } from './components/Header';
import { BoardColumn } from './components/BoardColumn';
import { CardView } from './components/CardView';
import { CardDialog } from './components/CardDialog';
import { ShortcutsDialog } from './components/ShortcutsDialog';
import { InlineForm } from './components/InlineForm';
import { Toast, type ToastMessage } from './components/Toast';
import { PlusIcon } from './components/Icons';

export default function App() {
  const { board, dispatch, undo, redo, canUndo, canRedo, beginTransaction, endTransaction, cancelTransaction } =
    useBoard();
  const { theme, toggle: toggleTheme } = useTheme();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [addingColumnId, setAddingColumnId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activeDrag, setActiveDrag] = useState<{ id: string; type: 'card' | 'column' } | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtering = isFilterActive(filters);
  const dismissToast = useCallback(() => setToast(null), []);
  const notify = useCallback((text: string, withUndo = false) => {
    setToast({ id: Date.now(), text, action: withUndo ? { label: 'Undo', onClick: undo } : undefined });
  }, [undo]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const visibleCards = useMemo(() => {
    const result: Record<string, Card[]> = {};
    for (const columnId of board.columnOrder) {
      result[columnId] = board.columns[columnId].cardIds
        .map((id) => board.cards[id])
        .filter((card) => !filtering || matchesFilters(card, filters, board.labels));
    }
    return result;
  }, [board, filters, filtering]);

  const stats = useMemo(() => {
    const total = Object.keys(board.cards).length;
    const lastColumn = board.columns[board.columnOrder[board.columnOrder.length - 1]];
    return { total, done: lastColumn?.cardIds.length ?? 0 };
  }, [board]);

  // ---------- drag & drop ----------

  /** Resolves a droppable id (card or column) to the id of its column. */
  function columnIdOf(id: string): string | undefined {
    if (board.columns[id]) return id;
    return findColumnOfCard(board, id)?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type as 'card' | 'column';
    setActiveDrag({ id: String(event.active.id), type });
    beginTransaction();
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.data.current?.type !== 'card') return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const from = columnIdOf(activeId);
    const to = columnIdOf(overId);
    if (!from || !to || from === to) return;

    // Moving into another column: insert at the hovered card's position, or at the end.
    const targetIds = board.columns[to].cardIds;
    const overIndex = targetIds.indexOf(overId);
    const isBelow =
      over.rect && active.rect.current.translated
        ? active.rect.current.translated.top > over.rect.top + over.rect.height / 2
        : false;
    const toIndex = overIndex === -1 ? targetIds.length : overIndex + (isBelow ? 1 : 0);
    dispatch({ type: 'card/move', cardId: activeId, toColumnId: to, toIndex });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDrag(null);
    if (over) {
      const activeId = String(active.id);
      const overId = String(over.id);
      if (active.data.current?.type === 'column') {
        const toColumn = columnIdOf(overId);
        if (toColumn) dispatch({ type: 'column/move', columnId: activeId, toIndex: board.columnOrder.indexOf(toColumn) });
      } else {
        const column = columnIdOf(activeId);
        if (column && column === columnIdOf(overId) && overId !== activeId) {
          const toIndex = board.columns[column].cardIds.indexOf(overId);
          if (toIndex !== -1) dispatch({ type: 'card/move', cardId: activeId, toColumnId: column, toIndex });
        }
      }
    }
    endTransaction();
  }

  function handleDragCancel() {
    setActiveDrag(null);
    cancelTransaction();
  }

  // ---------- actions ----------

  function deleteCard(card: Card) {
    dispatch({ type: 'card/delete', cardId: card.id });
    setOpenCardId(null);
    notify(`Deleted “${card.title}”`, true);
  }

  function deleteColumn(column: Column) {
    dispatch({ type: 'column/delete', columnId: column.id });
    notify(`Deleted column “${column.title}”`, true);
  }

  function exportBoard() {
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'board'}.flowboard.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Board exported');
  }

  async function importBoard(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBoard(parsed)) throw new Error('invalid');
      dispatch({ type: 'board/replace', board: parsed as Board });
      notify(`Imported “${(parsed as Board).title}”`, true);
    } catch {
      notify('That file is not a valid Flowboard export');
    }
  }

  function resetBoard() {
    dispatch({ type: 'board/replace', board: createSeedBoard() });
    notify('Board reset to demo data', true);
  }

  useHotkeys({
    '/': () => searchRef.current?.focus(),
    n: () => board.columnOrder[0] && setAddingColumnId(board.columnOrder[0]),
    t: toggleTheme,
    'shift+?': () => setShowShortcuts(true),
    '?': () => setShowShortcuts(true),
    'mod+z': undo,
    'shift+mod+z': redo,
    'mod+y': redo,
  });

  const openCard = openCardId ? board.cards[openCardId] : undefined;
  const dragCard = activeDrag?.type === 'card' ? board.cards[activeDrag.id] : undefined;
  const dragColumn = activeDrag?.type === 'column' ? board.columns[activeDrag.id] : undefined;

  return (
    <div className="app">
      <Header
        title={board.title}
        onRename={(title) => dispatch({ type: 'board/rename', title })}
        stats={stats}
        filters={filters}
        onFiltersChange={setFilters}
        labels={board.labels}
        theme={theme}
        onToggleTheme={toggleTheme}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onExport={exportBoard}
        onImport={() => fileRef.current?.click()}
        onReset={resetBoard}
        onShowShortcuts={() => setShowShortcuts(true)}
        searchRef={searchRef}
      />

      {filtering && <p className="filter-hint">Filters active — drag & drop is paused until you clear them.</p>}

      <main className="board">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={board.columnOrder} strategy={horizontalListSortingStrategy}>
            {board.columnOrder.map((columnId) => (
              <BoardColumn
                key={columnId}
                column={board.columns[columnId]}
                cards={visibleCards[columnId]}
                totalCount={board.columns[columnId].cardIds.length}
                labels={board.labels}
                dragDisabled={filtering}
                dispatch={dispatch}
                onOpenCard={setOpenCardId}
                onDelete={deleteColumn}
                adding={addingColumnId === columnId}
                setAdding={(adding) => setAddingColumnId(adding ? columnId : null)}
              />
            ))}
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
            {dragCard && <CardView card={dragCard} labels={board.labels} overlay />}
            {dragColumn && (
              <div className="column column--overlay">
                <header className="column__header">
                  <h2 className="column__title">{dragColumn.title}</h2>
                  <span className="column__count">{dragColumn.cardIds.length}</span>
                </header>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <div className="add-column">
          {addingColumn ? (
            <InlineForm
              placeholder="Column name"
              submitLabel="Add column"
              onSubmit={(title) => dispatch({ type: 'column/add', title })}
              onCancel={() => setAddingColumn(false)}
            />
          ) : (
            <button type="button" className="add-column__btn" onClick={() => setAddingColumn(true)}>
              <PlusIcon /> Add column
            </button>
          )}
        </div>
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importBoard(file);
          e.target.value = '';
        }}
      />

      {openCard && (
        <CardDialog
          key={openCard.id}
          board={board}
          card={openCard}
          dispatch={dispatch}
          onDelete={deleteCard}
          onClose={() => setOpenCardId(null)}
        />
      )}
      {showShortcuts && <ShortcutsDialog onClose={() => setShowShortcuts(false)} />}
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
