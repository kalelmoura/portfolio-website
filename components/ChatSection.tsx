"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GKLogo from "./GKLogo";

type Phase = "idle" | "thinking" | "done";

export default function ChatSection({
  id,
  question,
  title,
  children,
}: {
  id: string;
  question: string;
  title: string;
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (phase !== "thinking") return;
    const timer = setTimeout(() => setPhase("done"), 1300);
    return () => clearTimeout(timer);
  }, [phase]);

  const started = phase !== "idle";
  const revealed = phase === "done";

  return (
    <motion.section
      id={id}
      onViewportEnter={() => setPhase((p) => (p === "idle" ? "thinking" : p))}
      viewport={{ once: true, margin: "-120px 0px" }}
      className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20 sm:py-24"
    >
      {/* simulated chat: GK avatar, user question, thinking dots */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={started ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.45, ease: [0.22, 0.9, 0.3, 1] }}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/70 shadow-[0_10px_28px_-10px_rgba(30,58,138,0.25)] backdrop-blur"
        >
          <GKLogo className="h-9 w-9 text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 0.9, 0.3, 1] }}
          className="mt-4 max-w-[90vw] rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.6)] sm:text-base"
        >
          {question}
        </motion.div>

        <div className="mt-4 flex h-8 items-center">
          <AnimatePresence>
            {phase === "thinking" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex items-center gap-1.5"
                aria-label="Thinking…"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -7, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                    className="h-2.5 w-2.5 rounded-full bg-slate-400"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* section content reveals once "thinking" finishes */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.22, 0.9, 0.3, 1] }}
        className="mt-6"
      >
        <h2 className="text-center text-4xl font-black tracking-[-0.03em] text-[var(--text)] sm:text-5xl">
          {title}
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 0.9, 0.3, 1] }}
          className="mt-10"
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
