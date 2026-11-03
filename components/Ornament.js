// Small kolam-style divider used under every section heading.
export default function Ornament() {
  return (
    <svg className="orn" viewBox="0 0 140 14" aria-hidden="true" focusable="false">
      <path d="M0 7 H52 M88 7 H140" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="58" cy="7" r="1.6" fill="currentColor" />
      <circle cx="82" cy="7" r="1.6" fill="currentColor" />
      <path d="M70 1 L77 7 L70 13 L63 7Z" fill="currentColor" />
    </svg>
  );
}
