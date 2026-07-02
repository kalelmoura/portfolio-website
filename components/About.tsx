const FACTS = [
  { emoji: "🎓", text: "Software engineering student" },
  { emoji: "🤖", text: "Building AI-powered apps" },
  { emoji: "🚀", text: "From idea to production" },
];

export default function About() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-lg leading-relaxed text-[var(--sub)]">
        I&apos;m Gabriel Kalel Rosa Moura — Kalel for short — a software
        engineering student and developer. I like taking ideas all the way to
        production: designing the product, building the backend, shipping the
        app. Lately that means AI-powered tools, where a model does the
        thinking and clean, reliable code does the work.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {FACTS.map((fact) => (
          <span
            key={fact.text}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--text)] shadow-sm backdrop-blur"
          >
            <span aria-hidden>{fact.emoji}</span>
            {fact.text}
          </span>
        ))}
      </div>
    </div>
  );
}
