import { useState } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card, Column, Label } from '../types';
import type { BoardAction } from '../store/boardReducer';
import { SortableCard } from './SortableCard';
import { InlineForm } from './InlineForm';
import { Menu } from './Menu';
import { MoreIcon, PlusIcon, TrashIcon } from './Icons';

interface Props {
  column: Column;
  cards: Card[];
  totalCount: number;
  labels: Label[];
  dragDisabled: boolean;
  dispatch: (action: BoardAction) => void;
  onOpenCard: (cardId: string) => void;
  onDelete: (column: Column) => void;
  adding: boolean;
  setAdding: (adding: boolean) => void;
}

export function BoardColumn({
  column,
  cards,
  totalCount,
  labels,
  dragDisabled,
  dispatch,
  onOpenCard,
  onDelete,
  adding,
  setAdding,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
    disabled: dragDisabled || editingTitle,
  });

  const overLimit = column.wipLimit !== undefined && totalCount > column.wipLimit;

  function commitTitle() {
    setEditingTitle(false);
    if (title.trim() && title.trim() !== column.title) {
      dispatch({ type: 'column/rename', columnId: column.id, title });
    } else {
      setTitle(column.title);
    }
  }

  function promptWipLimit() {
    const input = window.prompt(
      `Work-in-progress limit for "${column.title}" (leave empty to remove):`,
      column.wipLimit?.toString() ?? '',
    );
    if (input === null) return;
    dispatch({ type: 'column/setWipLimit', columnId: column.id, wipLimit: Number(input) || undefined });
  }

  return (
    <section
      ref={setNodeRef}
      className={`column${isDragging ? ' column--dragging' : ''}${overLimit ? ' column--over-limit' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      aria-label={`${column.title} column`}
    >
      <header className="column__header" {...attributes} {...listeners} aria-roledescription="Draggable column">
        {editingTitle ? (
          <input
            className="column__title-input"
            value={title}
            autoFocus
            aria-label="Column title"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') {
                setTitle(column.title);
                setEditingTitle(false);
              }
            }}
          />
        ) : (
          <h2 className="column__title" onDoubleClick={() => setEditingTitle(true)} title="Double-click to rename">
            {column.title}
          </h2>
        )}
        <span className={`column__count${overLimit ? ' column__count--warn' : ''}`} title={column.wipLimit ? 'Cards / WIP limit' : 'Cards'}>
          {totalCount}
          {column.wipLimit !== undefined && <span className="column__limit">/{column.wipLimit}</span>}
        </span>
        <Menu
          label={`Actions for ${column.title}`}
          trigger={<MoreIcon />}
          items={[
            { label: 'Add card', icon: <PlusIcon size={14} />, onSelect: () => setAdding(true) },
            { label: 'Rename column', onSelect: () => setEditingTitle(true) },
            { label: column.wipLimit ? 'Change WIP limit' : 'Set WIP limit', onSelect: promptWipLimit },
            { label: 'Clear all cards', onSelect: () => dispatch({ type: 'column/clear', columnId: column.id }) },
            { label: 'Delete column', icon: <TrashIcon size={14} />, danger: true, onSelect: () => onDelete(column) },
          ]}
        />
      </header>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul className="column__cards">
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} labels={labels} disabled={dragDisabled} onOpen={onOpenCard} />
          ))}
          {cards.length === 0 && !adding && (
            <li className="column__empty">{totalCount > 0 ? 'No matching cards' : 'Drop cards here'}</li>
          )}
        </ul>
      </SortableContext>

      <footer className="column__footer">
        {adding ? (
          <InlineForm
            placeholder="What needs to be done?"
            submitLabel="Add card"
            multiline
            keepOpen
            onSubmit={(value) => dispatch({ type: 'card/add', columnId: column.id, card: { title: value } })}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button type="button" className="column__add" onClick={() => setAdding(true)}>
            <PlusIcon size={15} /> Add card
          </button>
        )}
      </footer>
    </section>
  );
}
