export default function Mark({
  className = "h-6 w-6",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="16"
          cy="7.5"
          rx="3.1"
          ry="7.3"
          transform={`rotate(${i * 45} 16 16)`}
        />
      ))}
    </svg>
  );
}
