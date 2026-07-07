import GKLogo from "./GKLogo";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md shadow-[0_2px_16px_rgba(11,21,48,0.08)]">
      <div className="relative flex h-16 items-center px-3">
        <a href="#home" className="flex shrink-0 items-center" aria-label="Back to top">
          <GKLogo className="h-9 w-9 transition-transform duration-300 hover:rotate-6" />
        </a>

        <a
          href="#home"
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold tracking-tight text-[var(--text)] lg:text-base"
        >
          Gabriel Kalel Rosa Moura
        </a>
      </div>
    </header>
  );
}
