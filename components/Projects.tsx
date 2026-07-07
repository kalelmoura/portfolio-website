"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, CloseIcon } from "./icons";

type Media = {
  type: "image" | "video";
  src: string;
  alt?: string;
};

type Project = {
  eyebrow: string;
  name: string;
  year: string;
  description: string;
  tech: string[];
  gradient: string;
  glow: string;
  mock: React.ReactNode;
  /** "Live Demo" for sites, "Download" for apps; null shows "In Production" */
  link: { label: "Live Demo" | "Download"; href: string } | null;
  /** files live in public/projects/<name>/ — e.g. { type: "image", src: "/projects/muscle-coach/1.png" } */
  media: Media[];
};

function MuscleCoachMock() {
  return (
    <div className="space-y-2.5">
      <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2 text-xs text-white/85">
        What&apos;s my workout today?
      </div>
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-green-500/90 px-3.5 py-2 text-xs font-medium text-white">
        Push day 💪 Bench 4×8, then dips. I&apos;ll count your rest.
      </div>
      <div className="flex items-center gap-1.5 pl-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function InfamilyMock() {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Sales", "R$ 4.2k"],
          ["Orders", "128"],
          ["Stock", "96%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white/10 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
            <div className="text-sm font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
      {[80, 62, 71].map((w, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="h-1.5 rounded-full bg-white/20" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

function MoneyXRayMock() {
  return (
    <div>
      <div className="flex h-24 items-end gap-2">
        {[45, 70, 35, 90, 55, 75, 60].map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-md ${i % 2 === 0 ? "bg-green-400/80" : "bg-blue-400/80"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between rounded-lg bg-white/10 px-3 py-1.5 text-[11px] text-white/80">
        <span>🤖 “Groceries — Food”</span>
        <span className="font-mono font-semibold text-green-300">−R$ 214,90</span>
      </div>
    </div>
  );
}

const PROJECTS: Project[] = [
  {
    eyebrow: "AI Fitness App",
    name: "Muscle Coach",
    year: "2026",
    description:
      "AI fitness coaching app that builds your workouts and coaches you through every set, right from your phone.",
    tech: ["React Native", "Expo", "FastAPI", "Claude API"],
    gradient: "bg-[linear-gradient(160deg,#0a1f14_0%,#123324_55%,#14532d_100%)]",
    glow: "bg-green-500/25",
    mock: <MuscleCoachMock />,
    link: null,
    media: [],
  },
  {
    eyebrow: "Full-Stack System",
    name: "inf.amily",
    year: "2025",
    description:
      "Full-stack store management system — inventory, sales and reporting for a real business, in one place.",
    tech: ["Next.js", "FastAPI", "Supabase"],
    gradient: "bg-[linear-gradient(160deg,#0b1226_0%,#16224a_55%,#1e3a8a_100%)]",
    glow: "bg-blue-500/25",
    mock: <InfamilyMock />,
    link: null,
    media: [],
  },
  {
    eyebrow: "AI Finance Tool",
    name: "Money X-Ray",
    year: "2025",
    description:
      "AI transaction-analysis app: the AI classifies every transaction, deterministic code does the math.",
    tech: ["Python", "FastAPI", "Claude API"],
    gradient: "bg-[linear-gradient(160deg,#101024_0%,#1e1b4b_55%,#155e75_100%)]",
    glow: "bg-cyan-400/25",
    mock: <MoneyXRayMock />,
    link: null,
    media: [],
  },
];

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  // lock page scroll and close on Escape while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:p-8"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.22, 0.9, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-[0_40px_120px_-24px_rgba(11,21,48,0.45)] sm:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-200 hover:scale-105"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="text-sm font-medium text-[var(--sub)]">{project.eyebrow}</div>
        <h3 className="mt-1 text-4xl font-black tracking-[-0.03em] text-[var(--text)] sm:text-5xl">
          {project.name}
        </h3>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5 sm:p-6">
          <div className="text-sm text-[var(--muted)]">{project.year}</div>
          <p className="mt-3 leading-relaxed text-[var(--sub)]">{project.description}</p>
          <div className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            Technologies
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-200/70 px-3 py-1 text-sm font-medium text-[var(--sub)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 border-b border-slate-100 pb-2 text-sm font-medium text-[var(--muted)]">
          Link
        </div>
        {project.link ? (
          <a
            href={project.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 font-medium text-[var(--text)] transition-colors hover:bg-slate-100"
          >
            {project.link.label}
            <ChevronRightIcon className="h-5 w-5 text-[var(--muted)]" />
          </a>
        ) : (
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-slate-50 px-5 py-4 font-medium text-[var(--sub)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            In Production
          </div>
        )}

        <div className="mt-8 space-y-4">
          {project.media.length > 0 ? (
            project.media.map((m) =>
              m.type === "image" ? (
                <img
                  key={m.src}
                  src={m.src}
                  alt={m.alt ?? `${project.name} screenshot`}
                  loading="lazy"
                  className="w-full rounded-2xl border border-slate-200"
                />
              ) : (
                <video
                  key={m.src}
                  src={m.src}
                  controls
                  playsInline
                  className="w-full rounded-2xl border border-slate-200"
                />
              )
            )
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center text-sm text-[var(--muted)]">
              Screenshots coming soon
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.75), behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 pt-2"
      >
        {PROJECTS.map((project) => (
          <motion.article
            key={project.name}
            role="button"
            tabIndex={0}
            onClick={() => setSelected(project)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected(project);
              }
            }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 0.9, 0.3, 1] }}
            className={`relative flex h-[460px] w-[82vw] shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_60px_-18px_rgba(11,21,48,0.35)] sm:w-[350px] md:w-[380px] ${project.gradient}`}
          >
            <div
              className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${project.glow}`}
            />
            <div className="text-sm font-medium text-white/60">{project.eyebrow}</div>
            <h3 className="mt-1 text-3xl font-bold tracking-tight">{project.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/85"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-auto pt-6">{project.mock}</div>
          </motion.article>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-3">
        {(
          [
            { dir: -1, Icon: ArrowLeftIcon, enabled: canLeft, label: "Previous projects" },
            { dir: 1, Icon: ArrowRightIcon, enabled: canRight, label: "Next projects" },
          ] as const
        ).map(({ dir, Icon, enabled, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => scrollBy(dir)}
            disabled={!enabled}
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[var(--text)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
