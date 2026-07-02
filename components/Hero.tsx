"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import GKLogo from "./GKLogo";
import {
  BriefcaseIcon,
  DownloadIcon,
  GitHubIcon,
  InstagramIcon,
  LayersIcon,
  LinkedInIcon,
  MailIcon,
  SmileIcon,
  WrenchIcon,
} from "./icons";

const TITLES = ["Software Engineer", "Comp. Sci Student"];

function useTypewriter(words: string[], typeSpeed = 85, deleteSpeed = 45, pause = 1700) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    let delay = deleting ? deleteSpeed : typeSpeed;
    if (!deleting && text === current) delay = pause;
    else if (deleting && text === "") delay = 350;

    const timer = setTimeout(() => {
      if (!deleting) {
        if (text === current) setDeleting(true);
        else setText(current.slice(0, text.length + 1));
      } else {
        if (text === "") {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        } else {
          setText(current.slice(0, text.length - 1));
        }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, wordIndex, words, typeSpeed, deleteSpeed, pause]);

  return text;
}

const SOCIALS = [
  // TODO: replace with real profile URLs
  { label: "GitHub", href: "https://github.com", Icon: GitHubIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
];

const SECTION_LINKS = [
  { label: "About", href: "#about", Icon: SmileIcon, color: "text-green-500" },
  { label: "Projects", href: "#projects", Icon: BriefcaseIcon, color: "text-blue-500" },
  { label: "Tech Stack", href: "#tech-stack", Icon: LayersIcon, color: "text-indigo-500" },
  { label: "Currently Building", href: "#currently-building", Icon: WrenchIcon, color: "text-amber-500" },
  { label: "Contact", href: "#contact", Icon: MailIcon, color: "text-purple-500" },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 0.9, 0.3, 1] as const },
});

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const title = useTypewriter(TITLES);

  // cursor-following gradient — blue blob and green blob trail the mouse
  // at different spring speeds, only inside the hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const blueX = useSpring(mouseX, { stiffness: 55, damping: 18 });
  const blueY = useSpring(mouseY, { stiffness: 55, damping: 18 });
  const greenX = useSpring(mouseX, { stiffness: 30, damping: 22 });
  const greenY = useSpring(mouseY, { stiffness: 30, damping: 22 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    mouseX.set(el.clientWidth * 0.6);
    mouseY.set(el.clientHeight * 0.4);
  }, [mouseX, mouseY]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen items-center overflow-hidden pt-16"
    >
      {/* static ambient wash so the hero has color before the mouse moves */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at 15% 20%, rgba(59,130,246,0.10), transparent 70%), radial-gradient(700px circle at 85% 75%, rgba(34,197,94,0.10), transparent 70%)",
        }}
      />

      {/* cursor-following blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[560px] w-[560px] rounded-full opacity-50 blur-[110px]"
        style={{
          x: blueX,
          y: blueY,
          marginLeft: -280,
          marginTop: -280,
          background: "radial-gradient(circle, rgba(59,130,246,0.55) 0%, transparent 65%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[480px] w-[480px] rounded-full opacity-50 blur-[100px]"
        style={{
          x: greenX,
          y: greenY,
          marginLeft: -160,
          marginTop: -160,
          background: "radial-gradient(circle, rgba(34,197,94,0.5) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-28 pt-10 text-center">
        <motion.p
          {...fadeUp(0)}
          className="text-lg font-semibold text-[var(--sub)] sm:text-xl"
        >
          Hey, I&apos;m Gabriel{" "}
          <span className="inline-block origin-[70%_70%] animate-[wave_2.4s_ease-in-out_1.2s_2]">
            👋
          </span>
        </motion.p>

        <motion.h1
          {...fadeUp(0.1)}
          className="mt-2 h-[1.25em] whitespace-nowrap text-[clamp(1.1rem,6.2vw,3.75rem)] font-black leading-[1.1] tracking-[-0.03em]"
        >
          <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            {title}
          </span>
          <span className="caret ml-0.5 font-light text-green-500">|</span>
        </motion.h1>

        <motion.div {...fadeUp(0.2)} className="mt-6 flex items-center gap-3">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-[var(--sub)] shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:text-green-600 hover:shadow-md"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </motion.div>

        {/* floating GK mark where the reference shows an illustration */}
        <motion.div {...fadeUp(0.3)} className="mt-8">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-44 w-44 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-[0_24px_60px_-18px_rgba(30,58,138,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:h-52 sm:w-52"
          >
            <GKLogo className="h-28 w-28 text-green-500 sm:h-32 sm:w-32" />
          </motion.div>
        </motion.div>

        <motion.div {...fadeUp(0.4)} className="mt-8">
          <a
            href="/resume.pdf"
            download="Gabriel-Kalel-Rosa-Moura-Resume.pdf"
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-b from-green-500 to-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_-6px_rgba(34,197,94,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_rgba(34,197,94,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] active:translate-y-0"
          >
            <DownloadIcon className="h-5 w-5" />
            Resume
          </a>
        </motion.div>

        {/* section shortcuts, boxed like the reference */}
        <motion.nav
          {...fadeUp(0.5)}
          aria-label="Sections"
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          {SECTION_LINKS.map(({ label, href, Icon, color }) => (
            <a
              key={href}
              href={href}
              className="flex min-w-28 flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/70 px-5 py-3.5 text-sm font-medium text-[var(--text)] shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icon className={`h-5 w-5 ${color}`} />
              {label}
            </a>
          ))}
        </motion.nav>
      </div>

      {/* ghost watermark, like the reference's giant name at the fold */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-2vw] select-none text-center text-[19vw] font-black leading-none tracking-[-0.05em] text-slate-900/[0.04]"
      >
        Kalel
      </div>
    </section>
  );
}
