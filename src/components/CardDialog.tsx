import { useState, type CSSProperties } from 'react';
import type { Board, Card, Priority } from '../types';
import type { BoardAction } from '../store/boardReducer';
import { findColumnOfCard } from '../store/boardReducer';
import { Dialog } from './Dialog';
import { TrashIcon } from './Icons';

interface Props {
  board: Board;
  card: Card;
  dispatch: (action: BoardAction) => void;
  onDelete: (card: Card) => void;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function CardDialog({ board, card, dispatch, onDelete, onClose }: Props) {
  const [draft, setDraft] = useState(card);
  const column = findColumnOfCard(board, card.id);
  const [columnId, setColumnId] = useState(column?.id ?? '');

  function save() {
    dispatch({
      type: 'card/update',
      cardId: card.id,
      changes: {
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        labelIds: draft.labelIds,
        dueDate: draft.dueDate || undefined,
      },
    });
    if (column && columnId && columnId !== column.id) {
      dispatch({ type: 'card/move', cardId: card.id, toColumnId: columnId, toIndex: Infinity });
    }
    onClose();
  }

  function toggleLabel(id: string) {
    setDraft((d) => ({
      ...d,
      labelIds: d.labelIds.includes(id) ? d.labelIds.filter((l) => l !== id) : [...d.labelIds, id],
    }));
  }

  return (
    <Dialog
      title="Edit card"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--danger-ghost" onClick={() => onDelete(card)}>
            <TrashIcon size={15} /> Delete
          </button>
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn--primary" onClick={save}>Save changes</button>
        </>
      }
    >
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="field">
          <span className="field__label">Title</span>
          <input
            className="input"
            value={draft.title}
            autoFocus
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>

        <label className="field">
          <span className="field__label">Description</span>
          <textarea
            className="input"
            rows={4}
            placeholder="Add more details…"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Column</span>
            <select
              className="input"
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
            >
              {board.columnOrder.map((id) => (
                <option key={id} value={id}>{board.columns[id].title}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Due date</span>
            <input
              className="input"
              type="date"
              value={draft.dueDate ?? ''}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value || undefined })}
            />
          </label>
        </div>

        <fieldset className="field">
          <legend className="field__label">Priority</legend>
          <div className="segmented">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                className={`segmented__item segmented__item--${p}`}
                aria-pressed={draft.priority === p}
                onClick={() => setDraft({ ...draft, priority: p })}
              >
                <span className={`priority__dot priority--${p}`} />
                {p[0].toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend className="field__label">Labels</legend>
          <div className="label-picker">
            {board.labels.map((label) => (
              <button
                key={label.id}
                type="button"
                className="label-toggle"
                style={{ '--label': label.color } as CSSProperties}
                aria-pressed={draft.labelIds.includes(label.id)}
                onClick={() => toggleLabel(label.id)}
              >
                {label.name}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}
