#!/usr/bin/env node
// Keeps the generated parts of the site in step with allPost.js.
//
// Run from the repo root after adding or editing a post in allPost.js:
//
//   node _tools/build-site.mjs           rewrite the generated files
//   node _tools/build-site.mjs --check   change nothing; exit 1 if something is out of date
//
// What it writes (everything else in the repo is left alone):
//   index.html   the hero, editor's picks, destination tiles, first page of
//                stories and an "All stories" list, as plain HTML, so crawlers
//                and visitors without JavaScript see real links. app.js still
//                runs on top and keeps search, filters and pagination working.
//   sitemap.xml  every post, the homepage and the other pages, as clean /slug
//                URLs. Existing <lastmod> dates are kept; a new post gets its
//                publish date.
//
// It runs your real app.js and layout.js (see site-runtime.mjs), so the HTML it
// writes is what the browser would draw, with no second copy to keep in sync.
//
// Needs Node 18 or newer. This folder starts with "_" so GitHub Pages (Jekyll)
// does not publish it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSite } from "./site-runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

const BASE = "https://www.rencalago.com";

// Pages that are not posts but belong in the sitemap. Add a page here (the file
// name without .html) when you create one.
const STATIC_PAGES = ["contact", "about"];

// FILES -----------------------------------------------------------------------
// All changes are collected first and written at the end (or only reported, in
// --check mode), so a failure half way never leaves the site half updated.
const pending = new Map();
const readFile = (file) =>
  pending.has(file) ? pending.get(file) : fs.readFileSync(path.join(root, file), "utf8");
const putFile = (file, content) => pending.set(file, content);

// Replaces what is between <!-- build:NAME --> and <!-- /build:NAME -->.
function fillBlock(html, name, content, file) {
  const pattern = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!pattern.test(html)) throw new Error(`${file} is missing the "build:${name}" markers`);
  return html.replace(pattern, (_match, open, close) => `${open}${content}${close}`);
}

// DATES -----------------------------------------------------------------------
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
// "13 October 2026" or "11 Feb 2023" -> "2026-10-13"
function isoDate(text) {
  const match = String(text).trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  const month = match ? MONTHS.indexOf(match[2].slice(0, 3).toLowerCase()) : -1;
  if (!match || month < 0) {
    throw new Error(`Cannot read the date "${text}" in allPost.js (expected something like "13 October 2026")`);
  }
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
}

const slugOf = (post) => post.link.replace(/^\.\//, "");
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const metaLine = (p) => [p.location, p.datePublished].filter(Boolean).map(escapeHtml).join(" · ");

// STEP: homepage -----------------------------------------------------------------
function buildHomepage(site) {
  let html = readFile("index.html");
  html = fillBlock(html, "hero", site.home.hero, "index.html");
  html = fillBlock(html, "picks", site.home.picks, "index.html");
  html = fillBlock(html, "dest", site.home.dest, "index.html");
  html = fillBlock(html, "feed", site.home.feed, "index.html");

  const items = site.posts
    .map((p) => `\n      <li><a href="${p.link}">${escapeHtml(p.title)}</a> <span class="meta">${metaLine(p)}</span></li>`)
    .join("");
  html = fillBlock(html, "archive", `\n    <ul class="archive-list">${items}\n    </ul>`, "index.html");
  putFile("index.html", html);
}

// STEP: sitemap --------------------------------------------------------------------
function buildSitemap(site) {
  // Keep the <lastmod> values that are already there.
  const existing = new Map();
  const oldXml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  for (const m of oldXml.matchAll(/<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)) {
    existing.set(m[1].trim().replace(/\/$/, ""), m[2] ? m[2].trim() : undefined);
  }

  const entries = [];
  const newestPost = site.posts.map((p) => isoDate(p.datePublished)).sort().pop();
  entries.push({ loc: BASE + "/", lastmod: newestPost }); // the homepage changes with every post

  for (const page of STATIC_PAGES) {
    if (!fs.existsSync(path.join(root, page + ".html"))) throw new Error(`STATIC_PAGES lists "${page}" but ${page}.html does not exist`);
    entries.push({ loc: `${BASE}/${page}`, lastmod: existing.get(`${BASE}/${page}`) });
  }

  for (const post of site.posts) {
    const slug = slugOf(post);
    if (!fs.existsSync(path.join(root, slug + ".html"))) throw new Error(`allPost.js links to "${slug}" but ${slug}.html does not exist`);
    const loc = `${BASE}/${slug}`;
    entries.push({ loc, lastmod: existing.get(loc) || isoDate(post.datePublished) });
  }

  const urls = entries
    .map((e) => `  <url>\n    <loc>${e.loc}</loc>\n${e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : ""}  </url>`)
    .join("\n");
  putFile(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  return entries.length;
}

// RUN --------------------------------------------------------------------------------
const site = await loadSite(root);
let sitemapCount;
try {
  if (!Array.isArray(site.posts) || site.posts.length === 0) throw new Error("allPost.js has no posts");
  buildHomepage(site);
  sitemapCount = buildSitemap(site);
} finally {
  site.cleanup();
}

const stale = [];
for (const [file, content] of pending) {
  const onDisk = fs.readFileSync(path.join(root, file), "utf8");
  if (onDisk === content) continue;
  stale.push(file);
  if (!checkOnly) fs.writeFileSync(path.join(root, file), content);
}

if (checkOnly) {
  if (stale.length) {
    console.error("Out of date: " + stale.join(", ") + "\nRun: node _tools/build-site.mjs");
    process.exit(1);
  }
  console.log(`Up to date (${site.posts.length} posts, ${sitemapCount} sitemap URLs).`);
} else {
  console.log(
    (stale.length ? "Updated " + stale.join(", ") : "No changes") +
      `. ${site.posts.length} posts, ${sitemapCount} sitemap URLs.`
  );
}
