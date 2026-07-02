"use client";

import { motion } from "framer-motion";

const BUILDING = [
  {
    name: "Muscle Coach",
    tagline: "AI fitness coaching app",
    focus: [
      "Smarter workout generation with the Claude API",
      "Real-time coaching flow in React Native / Expo",
      "FastAPI backend for plans and progress tracking",
    ],
  },
  {
    name: "inf.amily",
    tagline: "Full-stack store management system",
    focus: [
      "Inventory and sales dashboards in Next.js",
      "Supabase auth, storage and realtime data",
      "Reporting endpoints on FastAPI",
    ],
  },
];

export default function CurrentlyBuilding() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {BUILDING.map((project) => (
        <motion.div
          key={project.name}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 0.9, 0.3, 1] }}
          className="relative rounded-3xl border border-white/70 bg-white/60 p-7 shadow-[0_24px_60px_-18px_rgba(30,58,138,0.14),0_6px_20px_-6px_rgba(30,58,138,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-[var(--text)]">
                {project.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--sub)]">{project.tagline}</p>
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              In development
            </span>
          </div>
          <ul className="mt-5 space-y-2.5">
            {project.focus.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--sub)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
