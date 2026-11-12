import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card, Label } from '../types';
import { CardView } from './CardView';

interface Props {
  card: Card;
  labels: Label[];
  disabled: boolean;
  onOpen: (cardId: string) => void;
}

export function SortableCard({ card, labels, disabled, onOpen }: Props) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' },
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      className={`card-slot${isDragging ? ' card-slot--dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-roledescription="Draggable card"
      aria-label={card.title}
      onClick={() => onOpen(card.id)}
      onKeyDown={(event) => {
        listeners?.onKeyDown?.(event);
        if (event.key === 'Enter' && !event.defaultPrevented) onOpen(card.id);
      }}
    >
      <CardView card={card} labels={labels} />
    </li>
  );
}
