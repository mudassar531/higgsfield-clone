export default function Mark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M8 3.75H4.75V8M16 3.75h3.25V8M19.25 16v4.25H16M8 20.25H4.75V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect x="8.5" y="8.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
