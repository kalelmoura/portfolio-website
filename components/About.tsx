const FACTS = [
  { emoji: "🎓", text: "Computer Science student" },
  { emoji: "💻", text: "Software Engineer" },
  { emoji: "🚀", text: "From idea to production" },
];

export default function About() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-lg leading-relaxed text-[var(--sub)]">
        I&apos;m Gabriel Kalel Rosa Moura, a software engineer and student at the
        University of Westminster. My current interests are machine learning and
        AI engineering. I like taking ideas all the way to production: designing
        the product, building it, shipping it, and putting it in front of real
        users.
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
