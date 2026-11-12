import { useEffect } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  action?: { label: string; onClick: () => void };
}

interface Props {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className="toast-region" role="status" aria-live="polite" aria-label="Notifications">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.text}</span>
          {toast.action && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.action!.onClick();
                onDismiss();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
