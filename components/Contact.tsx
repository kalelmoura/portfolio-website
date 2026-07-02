"use client";

import { useState } from "react";
import { GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon } from "./icons";

const CONTACT_EMAIL = "kalelacez@gmail.com";

const LINKS = [
  // TODO: replace with real profile URLs
  {
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    Icon: MailIcon,
  },
  { label: "GitHub", value: "@kalel", href: "https://github.com", Icon: GitHubIcon },
  { label: "LinkedIn", value: "Gabriel Kalel", href: "https://linkedin.com", Icon: LinkedInIcon },
  { label: "Instagram", value: "@kalel", href: "https://instagram.com", Icon: InstagramIcon },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${name || "someone"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ""}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-3">
        {LINKS.map(({ label, value, href, Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/60 px-5 py-4 shadow-[0_10px_28px_-14px_rgba(30,58,138,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-14px_rgba(30,58,138,0.28)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors group-hover:bg-green-100">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {label}
              </span>
              <span className="block text-sm font-medium text-[var(--text)]">{value}</span>
            </span>
          </a>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/70 bg-white/60 p-7 shadow-[0_24px_60px_-18px_rgba(30,58,138,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-[var(--text)] outline-none transition-shadow placeholder:text-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-200"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-[var(--text)] outline-none transition-shadow placeholder:text-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-200"
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Message
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hey Kalel, let's build something…"
            rows={5}
            required
            className="w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-[var(--text)] outline-none transition-shadow placeholder:text-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-200"
          />
        </label>
        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-gradient-to-b from-green-500 to-green-600 px-8 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_-6px_rgba(34,197,94,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-6px_rgba(34,197,94,0.6)] active:translate-y-0"
        >
          Send message
        </button>
      </form>
    </div>
  );
}
