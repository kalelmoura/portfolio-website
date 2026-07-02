export default function GKLogo({
  className = "h-10 w-10 text-green-500",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 112 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="GK — Gabriel Kalel"
      role="img"
    >
      {/* G: open arc ending in a crossbar; K grows out of the bar's end */}
      <path
        d="M70 28 A34 34 0 1 0 80 66 L56 66 M80 66 V100 M80 82 L98 62 M80 82 L100 104"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
