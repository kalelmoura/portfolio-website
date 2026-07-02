import GKLogo from "./GKLogo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center">
        <GKLogo className="h-8 w-8 text-green-500" />
        <p className="text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} Gabriel Kalel Rosa Moura · Built with
          Next.js
        </p>
      </div>
    </footer>
  );
}
