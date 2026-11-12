import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';

interface Props {
  placeholder: string;
  submitLabel: string;
  multiline?: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  keepOpen?: boolean;
}

/** Small text form used to add cards and columns. Enter submits, Escape cancels. */
export function InlineForm({ placeholder, submitLabel, multiline, onSubmit, onCancel, keepOpen }: Props) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => ref.current?.focus(), []);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return onCancel();
    onSubmit(trimmed);
    setValue('');
    if (!keepOpen) onCancel();
    else ref.current?.focus();
  }

  const shared = {
    ref,
    value,
    placeholder,
    'aria-label': placeholder,
    className: 'inline-form__input',
    onChange: (e: ChangeEvent<HTMLTextAreaElement & HTMLInputElement>) => setValue(e.target.value),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    },
  };

  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {multiline ? <textarea rows={2} {...shared} /> : <input {...shared} />}
      <div className="inline-form__actions">
        <button type="submit" className="btn btn--primary btn--sm">{submitLabel}</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
