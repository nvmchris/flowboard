import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from './Icons';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'sm';
}

/** Accessible modal built on the native <dialog> element (focus trap + Escape for free). */
export function Dialog({ title, onClose, children, footer, size = 'md' }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal?.();
  }, []);

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--${size}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog__panel">
        <header className="dialog__header">
          <h2 className="dialog__title">{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="dialog__body">{children}</div>
        {footer && <footer className="dialog__footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
