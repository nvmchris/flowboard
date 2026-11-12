import { useState, type CSSProperties, type RefObject } from 'react';
import type { Filters, Label, Priority } from '../types';
import type { Theme } from '../hooks/useTheme';
import { isFilterActive } from '../utils/filter';
import { Logo } from './Logo';
import { Menu } from './Menu';
import {
  DownloadIcon,
  KeyboardIcon,
  MoonIcon,
  MoreIcon,
  RedoIcon,
  ResetIcon,
  SearchIcon,
  SunIcon,
  UndoIcon,
  UploadIcon,
} from './Icons';

interface Props {
  title: string;
  onRename: (title: string) => void;
  stats: { total: number; done: number };
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  labels: Label[];
  theme: Theme;
  onToggleTheme: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  onShowShortcuts: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
}

export function Header({ searchRef, ...props }: Props) {
  const { filters, onFiltersChange, labels, stats } = props;
  const [editing, setEditing] = useState(false);
  const progress = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  function toggleLabel(id: string) {
    const labelIds = filters.labelIds.includes(id)
      ? filters.labelIds.filter((l) => l !== id)
      : [...filters.labelIds, id];
    onFiltersChange({ ...filters, labelIds });
  }

  return (
    <header className="topbar">
      <div className="topbar__row">
        <div className="brand">
          <Logo />
          <span className="brand__name">Flowboard</span>
        </div>
        <span className="topbar__divider" />
        {editing ? (
          <input
            className="board-title-input"
            defaultValue={props.title}
            autoFocus
            aria-label="Board title"
            onBlur={(e) => {
              props.onRename(e.target.value);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <button type="button" className="board-title" onClick={() => setEditing(true)} title="Rename board">
            {props.title}
          </button>
        )}
        <div className="progress" title={`${stats.done} of ${stats.total} cards done`}>
          <div className="progress__bar">
            <div className="progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress__text">{progress}% done</span>
        </div>

        <span className="spacer" />

        <div className="toolbar">
          <button type="button" className="icon-btn" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!props.canUndo} onClick={props.onUndo}>
            <UndoIcon />
          </button>
          <button type="button" className="icon-btn" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!props.canRedo} onClick={props.onRedo}>
            <RedoIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={props.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title="Toggle theme (T)"
            onClick={props.onToggleTheme}
          >
            {props.theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <Menu
            label="Board actions"
            trigger={<MoreIcon />}
            items={[
              { label: 'Export as JSON', icon: <DownloadIcon size={14} />, onSelect: props.onExport },
              { label: 'Import from JSON', icon: <UploadIcon size={14} />, onSelect: props.onImport },
              { label: 'Keyboard shortcuts', icon: <KeyboardIcon size={14} />, onSelect: props.onShowShortcuts },
              { label: 'Reset to demo board', icon: <ResetIcon size={14} />, danger: true, onSelect: props.onReset },
            ]}
          />
        </div>
      </div>

      <div className="topbar__row topbar__row--filters">
        <label className="search">
          <SearchIcon />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search cards…"
            aria-label="Search cards"
            value={filters.query}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onFiltersChange({ ...filters, query: '' });
                e.currentTarget.blur();
              }
            }}
          />
          <kbd>/</kbd>
        </label>

        <select
          className="select"
          aria-label="Filter by priority"
          value={filters.priority}
          onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value as Priority | 'all' })}
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div className="chips" role="group" aria-label="Filter by label">
          {labels.map((label) => (
            <button
              key={label.id}
              type="button"
              className="chip"
              style={{ '--label': label.color } as CSSProperties}
              aria-pressed={filters.labelIds.includes(label.id)}
              onClick={() => toggleLabel(label.id)}
            >
              <span className="chip__dot" />
              {label.name}
            </button>
          ))}
        </div>

        {isFilterActive(filters) && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => onFiltersChange({ query: '', labelIds: [], priority: 'all' })}
          >
            Clear filters
          </button>
        )}
      </div>
    </header>
  );
}
