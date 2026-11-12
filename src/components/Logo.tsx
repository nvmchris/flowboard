export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b7bff" />
          <stop offset="1" stopColor="#5b4bf0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#logo-g)" />
      <rect x="12" y="14" width="11" height="36" rx="3" fill="#fff" />
      <rect x="26.5" y="14" width="11" height="24" rx="3" fill="#fff" opacity=".85" />
      <rect x="41" y="14" width="11" height="30" rx="3" fill="#fff" opacity=".7" />
    </svg>
  );
}
