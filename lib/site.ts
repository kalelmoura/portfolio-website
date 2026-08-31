/**
 * Absolute origin for metadata, OG images, robots and sitemap.
 *
 * Set NEXT_PUBLIC_SITE_URL in Vercel once the real domain is attached.
 * Until then this falls back to the deployment URL Vercel injects at build
 * time, so social previews resolve on *.vercel.app too.
 */
const configured =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const SITE_URL = configured ?? "http://localhost:3000";

export const SITE_NAME = "Gabriel Kalel Rosa Moura";
export const SITE_TITLE = "Gabriel Kalel Rosa Moura — Software Engineer";
export const SITE_DESCRIPTION =
  "Portfolio of Gabriel Kalel Rosa Moura — software engineer and Computer Science student at the University of Westminster, working in machine learning and AI engineering.";
