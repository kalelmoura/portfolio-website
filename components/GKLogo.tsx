export default function GKLogo({
  className = "h-10 w-10",
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
      <defs>
        <linearGradient id="gk-g" x1="16" y1="18" x2="84" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="gk-k" x1="78" y1="56" x2="106" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#059669" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* G: open arc sweeping into a crossbar that reaches into the bowl */}
      <path
        d="M71 25 A36 36 0 1 0 82 64 L56 64"
        stroke="url(#gk-g)"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* K grows out of the crossbar's end — short upper arm, long running leg */}
      <path
        d="M82 64 V101 M82 79 L99 59 M82 79 L104 105"
        stroke="url(#gk-k)"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
