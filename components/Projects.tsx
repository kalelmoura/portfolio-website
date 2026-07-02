"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

type Project = {
  eyebrow: string;
  name: string;
  description: string;
  tech: string[];
  gradient: string;
  glow: string;
  mock: React.ReactNode;
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
    description:
      "AI fitness coaching app that builds your workouts and coaches you through every set, right from your phone.",
    tech: ["React Native", "Expo", "FastAPI", "Claude API"],
    gradient: "bg-[linear-gradient(160deg,#0a1f14_0%,#123324_55%,#14532d_100%)]",
    glow: "bg-green-500/25",
    mock: <MuscleCoachMock />,
  },
  {
    eyebrow: "Full-Stack System",
    name: "inf.amily",
    description:
      "Full-stack store management system — inventory, sales and reporting for a real business, in one place.",
    tech: ["Next.js", "FastAPI", "Supabase"],
    gradient: "bg-[linear-gradient(160deg,#0b1226_0%,#16224a_55%,#1e3a8a_100%)]",
    glow: "bg-blue-500/25",
    mock: <InfamilyMock />,
  },
  {
    eyebrow: "AI Finance Tool",
    name: "Money X-Ray",
    description:
      "AI transaction-analysis app: the AI classifies every transaction, deterministic code does the math.",
    tech: ["Python", "FastAPI", "Claude API"],
    gradient: "bg-[linear-gradient(160deg,#101024_0%,#1e1b4b_55%,#155e75_100%)]",
    glow: "bg-cyan-400/25",
    mock: <MoneyXRayMock />,
  },
];

export default function Projects() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

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
            whileHover={{ y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 0.9, 0.3, 1] }}
            className={`relative flex h-[460px] w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_60px_-18px_rgba(11,21,48,0.35)] sm:w-[350px] md:w-[380px] ${project.gradient}`}
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
    </div>
  );
}
