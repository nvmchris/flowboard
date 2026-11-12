import { useEffect, useRef } from 'react';

type Handler = (event: KeyboardEvent) => void;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Registers global keyboard shortcuts. Keys use the format "mod+z", "shift+mod+z", "/", "n".
 * "mod" means Ctrl on Windows/Linux and Cmd on macOS. Shortcuts are ignored while typing in a field.
 */
export function useHotkeys(bindings: Record<string, Handler>) {
  const ref = useRef(bindings);
  useEffect(() => {
    ref.current = bindings;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const parts: string[] = [];
      if (event.shiftKey) parts.push('shift');
      if (event.ctrlKey || event.metaKey) parts.push('mod');
      parts.push(event.key.toLowerCase());
      const combo = parts.join('+');
      const handler = ref.current[combo];
      if (!handler) return;
      if (isTyping(event.target)) return;
      event.preventDefault();
      handler(event);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
