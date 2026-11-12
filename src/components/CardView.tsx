import type { CSSProperties } from 'react';
import type { Card, Label } from '../types';
import { formatDueDate, getDueState } from '../utils/date';
import { CalendarIcon, TextIcon } from './Icons';

interface Props {
  card: Card;
  labels: Label[];
  overlay?: boolean;
}

const PRIORITY_TEXT = { low: 'Low', medium: 'Medium', high: 'High' } as const;

/** Pure presentational card, shared by the sortable card and the drag overlay. */
export function CardView({ card, labels, overlay }: Props) {
  const cardLabels = card.labelIds
    .map((id) => labels.find((l) => l.id === id))
    .filter((l): l is Label => Boolean(l));

  return (
    <div className={`card${overlay ? ' card--overlay' : ''}`} data-priority={card.priority}>
      {cardLabels.length > 0 && (
        <div className="card__labels">
          {cardLabels.map((label) => (
            <span key={label.id} className="label-pill" style={{ '--label': label.color } as CSSProperties}>
              {label.name}
            </span>
          ))}
        </div>
      )}
      <p className="card__title">{card.title}</p>
      <div className="card__meta">
        <span className={`priority priority--${card.priority}`} title={`${PRIORITY_TEXT[card.priority]} priority`}>
          <span className="priority__dot" />
          {PRIORITY_TEXT[card.priority]}
        </span>
        {card.dueDate && (
          <span className={`due due--${getDueState(card.dueDate)}`} title={`Due ${card.dueDate}`}>
            <CalendarIcon size={13} />
            {formatDueDate(card.dueDate)}
          </span>
        )}
        {card.description && (
          <span className="card__has-desc" title="Has description">
            <TextIcon size={13} />
          </span>
        )}
      </div>
    </div>
  );
}
