import { Dialog } from './Dialog';

const SHORTCUTS: Array<[string[], string]> = [
  [['N'], 'New card in the first column'],
  [['/'], 'Focus search'],
  [['T'], 'Toggle light / dark theme'],
  [['Ctrl', 'Z'], 'Undo'],
  [['Ctrl', 'Shift', 'Z'], 'Redo'],
  [['Space'], 'Pick up / drop a focused card'],
  [['↑', '↓', '←', '→'], 'Move a picked-up card'],
  [['Enter'], 'Open a focused card'],
  [['Esc'], 'Close dialog / cancel'],
  [['?'], 'Show this help'],
];

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Keyboard shortcuts" onClose={onClose} size="sm">
      <dl className="shortcuts">
        {SHORTCUTS.map(([keys, text]) => (
          <div key={text} className="shortcuts__row">
            <dt>
              {keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
