export type DueState = 'overdue' | 'today' | 'soon' | 'later';

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getDueState(dueDate: string, now = new Date()): DueState {
  const [y, m, d] = dueDate.split('-').map(Number);
  const due = new Date(y, m - 1, d).getTime();
  const diffDays = Math.round((due - startOfDay(now)) / 86_400_000);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 2) return 'soon';
  return 'later';
}

export function formatDueDate(dueDate: string, now = new Date()): string {
  const state = getDueState(dueDate, now);
  if (state === 'today') return 'Today';
  const [y, m, d] = dueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}
