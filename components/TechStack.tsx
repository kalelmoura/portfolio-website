"use client";

import { motion } from "framer-motion";

const GROUPS: { label: string; icon: string; items: string[] }[] = [
  {
    label: "Languages",
    icon: "</>",
    items: ["Python", "TypeScript", "JavaScript", "Java", "SQL", "HTML5", "CSS"],
  },
  {
    label: "Frameworks",
    icon: "▲",
    items: ["FastAPI", "Next.js"],
  },
  {
    label: "Tools",
    icon: "⌘",
    items: ["Git", "GitHub"],
  },
];

export default function TechStack() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {GROUPS.map((group, gi) => (
        <div key={group.label}>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-green-600">{group.icon}</span>
            <h3 className="text-lg font-bold tracking-tight text-[var(--text)]">{group.label}</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {group.items.map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px 0px" }}
                transition={{ duration: 0.35, delay: gi * 0.1 + i * 0.05 }}
                whileHover={{ y: -3 }}
                className="cursor-default rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-[0_6px_16px_-6px_rgba(11,21,48,0.4)]"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
