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
//   cebu-travel-guides.html, dumaguete-travel-guides.html,
//   negros-oriental-travel-guides.html
//                the destination pages: a short intro (from
//                _tools/destinations.json) and plain-HTML lists of the stories
//                that belong to each destination.
//   sitemap.xml  every post, the homepage, the destination pages and the other
//                pages, as clean /slug URLs. Existing <lastmod> dates are kept;
//                a new post gets its publish date.
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

// STEP: destination pages --------------------------------------------------------
// /cebu-travel-guides, /dumaguete-travel-guides and /negros-oriental-travel-guides.
// The wording lives in _tools/destinations.json. The story lists follow the same
// rule as the homepage filter, so a new post lands on the right pages by itself.
const warnings = [];

function buildDestinationPages(site) {
  const config = JSON.parse(fs.readFileSync(path.join(root, "_tools", "destinations.json"), "utf8"));
  const bySlug = new Map(site.posts.map((p) => [slugOf(p), p]));
  const pages = [];

  for (const [key, cfg] of Object.entries(config)) {
    const dest = site.destinations.find((d) => d.key === key);
    if (!dest) throw new Error(`destinations.json has "${key}" but DESTINATIONS in app.js does not`);

    // Which stories belong here: the homepage filter's rule, then the page's own
    // excludeLocation / exclude / include lists.
    const wanted = new Set(
      site.posts.filter((p) => site.matchesFilter(p, { type: "dest", value: key })).map(slugOf)
    );
    for (const word of cfg.excludeLocation || []) {
      for (const p of site.posts) if (String(p.location || "").toLowerCase().includes(word)) wanted.delete(slugOf(p));
    }
    for (const slug of cfg.exclude || []) wanted.delete(slug);
    for (const slug of cfg.include || []) {
      if (!bySlug.has(slug)) throw new Error(`destinations.json (${key}): "${slug}" is not in allPost.js`);
      wanted.add(slug);
    }
    const stories = site.posts.filter((p) => wanted.has(slugOf(p))); // allPost.js order: newest first
    if (stories.length < 8) {
      throw new Error(`${cfg.page}: only ${stories.length} stories. A destination page needs at least 8 to be more than a thin list.`);
    }

    const start = (cfg.startWith || []).map((slug) => {
      const post = bySlug.get(slug);
      if (!post || !wanted.has(slug)) throw new Error(`destinations.json (${key}): startWith "${slug}" is not one of this page's stories`);
      return post;
    });
    const rest = stories.filter((p) => !start.includes(p));

    if (cfg.description.length < 140 || cfg.description.length > 165) {
      warnings.push(`${cfg.page}: description is ${cfg.description.length} characters (aim for about 150-160)`);
    }

    const cards = (list) => list.map((p) => site.storyCard(p)).join("");
    const intro = cfg.intro.map((paragraph) => `<p>${paragraph}</p>`).join("\n          ");
    const section = (heading, list) =>
      list.length
        ? `
          <div class="section-head section-head--accent">
            <h2>${escapeHtml(heading)}</h2>
          </div>${cards(list)}`
        : "";

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(cfg.title)} | Ren Calago blog</title>
    <link rel="icon" type="image/x-icon" href="./Images/rencalago-favicon.png" />
    <meta name="description" content="${escapeHtml(cfg.description)}" />
    <meta name="keywords" content="${escapeHtml(cfg.keywords)}" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
      integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <link rel="stylesheet" href="./style.css" />
    <!-- build:seo --><!-- /build:seo -->
  </head>
  <body>
    <!-- This page is written by _tools/build-site.mjs. Edit _tools/destinations.json, then run the script. -->
    <my-header><!-- build:header --><!-- /build:header --></my-header>

    <main>
      <section class="wrap page-head">
        <p class="kicker">Destination</p>
        <h1>${escapeHtml(cfg.h1)}</h1>
        <div class="page-head__intro">
          ${intro}
        </div>
      </section>

      <section class="wrap columns">
        <div class="feed">${section("Start with these", start)}${section(start.length ? `More ${dest.name} stories` : `${dest.name} stories`, rest)}
        </div>

        <aside class="side" aria-label="Sidebar">
          <my-sidebar><!-- build:sidebar --><!-- /build:sidebar --></my-sidebar>
        </aside>
      </section>
    </main>

    <my-footer><!-- build:footer --><!-- /build:footer --></my-footer>
    <script type="module" src="./destination.js"></script>
  </body>
</html>
`;
    putFile(cfg.page + ".html", html);
    pages.push({
      slug: cfg.page,
      count: stories.length,
      lastmod: stories.map((p) => isoDate(p.datePublished)).sort().pop(),
    });
  }
  return pages;
}

// STEP: sitemap --------------------------------------------------------------------
function buildSitemap(site, destinationPages) {
  // Keep the <lastmod> values that are already there.
  const existing = new Map();
  const oldXml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  for (const m of oldXml.matchAll(/<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)) {
    existing.set(m[1].trim().replace(/\/$/, ""), m[2] ? m[2].trim() : undefined);
  }

  const entries = [];
  const newestPost = site.posts.map((p) => isoDate(p.datePublished)).sort().pop();
  entries.push({ loc: BASE + "/", lastmod: newestPost }); // the homepage changes with every post

  for (const page of destinationPages) entries.push({ loc: `${BASE}/${page.slug}`, lastmod: page.lastmod });

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
let destinationPages = [];
try {
  if (!Array.isArray(site.posts) || site.posts.length === 0) throw new Error("allPost.js has no posts");
  buildHomepage(site);
  destinationPages = buildDestinationPages(site);
  sitemapCount = buildSitemap(site, destinationPages);
} finally {
  site.cleanup();
}

const stale = [];
for (const [file, content] of pending) {
  const target = path.join(root, file);
  const onDisk = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null; // null = a new file
  if (onDisk === content) continue;
  stale.push(file);
  if (!checkOnly) fs.writeFileSync(path.join(root, file), content);
}

for (const warning of warnings) console.warn("Warning: " + warning);

if (checkOnly) {
  if (stale.length) {
    console.error("Out of date: " + stale.join(", ") + "\nRun: node _tools/build-site.mjs");
    process.exit(1);
  }
  console.log(`Up to date (${site.posts.length} posts, ${destinationPages.length} destination pages, ${sitemapCount} sitemap URLs).`);
} else {
  console.log(
    (stale.length ? "Updated " + stale.join(", ") : "No changes") +
      `. ${site.posts.length} posts, ${destinationPages.length} destination pages (${destinationPages.map((p) => p.count).join("/")} stories), ${sitemapCount} sitemap URLs.`
  );
}
