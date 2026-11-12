export type Priority = 'low' | 'medium' | 'high';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labelIds: string[];
  priority: Priority;
  dueDate?: string; // ISO date, yyyy-mm-dd
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
  wipLimit?: number;
}

export interface Board {
  version: 1;
  title: string;
  columnOrder: string[];
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  labels: Label[];
}

export interface Filters {
  query: string;
  labelIds: string[];
  priority: Priority | 'all';
}
