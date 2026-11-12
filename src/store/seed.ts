import type { Board, Card, Label } from '../types';

export const DEFAULT_LABELS: Label[] = [
  { id: 'lbl_feature', name: 'Feature', color: '#6d5dfc' },
  { id: 'lbl_bug', name: 'Bug', color: '#ef4444' },
  { id: 'lbl_design', name: 'Design', color: '#ec4899' },
  { id: 'lbl_research', name: 'Research', color: '#f59e0b' },
  { id: 'lbl_docs', name: 'Docs', color: '#10b981' },
  { id: 'lbl_infra', name: 'Infra', color: '#0ea5e9' },
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Demo board shown on first visit so the app looks alive right away. */
export function createSeedBoard(): Board {
  const now = Date.now();
  const raw: Array<[string, string, Omit<Card, 'id' | 'createdAt'>]> = [
    ['backlog', 'c1', { title: 'Offline sync with service worker', description: 'Cache the app shell so the board loads without a network connection.', labelIds: ['lbl_feature', 'lbl_infra'], priority: 'medium' }],
    ['backlog', 'c2', { title: 'Research collaborative editing', description: 'Compare CRDT libraries (Yjs, Automerge) for real-time multi-user boards.', labelIds: ['lbl_research'], priority: 'low' }],
    ['backlog', 'c3', { title: 'Card cover images', description: '', labelIds: ['lbl_feature', 'lbl_design'], priority: 'low' }],
    ['todo', 'c4', { title: 'Keyboard shortcuts cheat sheet', description: 'Press `?` to open an overlay listing every shortcut.', labelIds: ['lbl_feature', 'lbl_docs'], priority: 'medium', dueDate: daysFromNow(5) }],
    ['todo', 'c5', { title: 'Fix card flicker on fast drag', description: 'Cards briefly jump when moved quickly between columns on Safari.', labelIds: ['lbl_bug'], priority: 'high', dueDate: daysFromNow(1) }],
    ['doing', 'c6', { title: 'Polish dark mode palette', description: 'Raise contrast of muted text and borders to meet WCAG AA.', labelIds: ['lbl_design'], priority: 'medium', dueDate: daysFromNow(2) }],
    ['doing', 'c7', { title: 'Export board as JSON', description: 'Download the full board and import it on another device.', labelIds: ['lbl_feature'], priority: 'high' }],
    ['done', 'c8', { title: 'Drag & drop between columns', description: 'Mouse, touch and keyboard support via dnd-kit.', labelIds: ['lbl_feature'], priority: 'high' }],
    ['done', 'c9', { title: 'Set up CI and GitHub Pages', description: 'Typecheck, lint and test on every PR; deploy on merge.', labelIds: ['lbl_infra'], priority: 'medium' }],
  ];

  const columns: Board['columns'] = {
    backlog: { id: 'backlog', title: 'Backlog', cardIds: [] },
    todo: { id: 'todo', title: 'To Do', cardIds: [] },
    doing: { id: 'doing', title: 'In Progress', cardIds: [], wipLimit: 3 },
    done: { id: 'done', title: 'Done', cardIds: [] },
  };
  const cards: Board['cards'] = {};
  raw.forEach(([columnId, id, data], i) => {
    cards[id] = { ...data, id, createdAt: now - (raw.length - i) * 60_000 };
    columns[columnId].cardIds.push(id);
  });

  return {
    version: 1,
    title: 'Product Roadmap',
    columnOrder: ['backlog', 'todo', 'doing', 'done'],
    columns,
    cards,
    labels: DEFAULT_LABELS,
  };
}
