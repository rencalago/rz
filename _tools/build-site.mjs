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
//   every page  the menu, sidebar and footer written in as plain HTML, plus the
//                canonical link and Open Graph tags (see buildPages below).
//   every post  a "Keep reading" block of three related stories under the
//                article, and width/height on the article's own photos.
//   cebu-travel-guides.html, dumaguete-travel-guides.html,
//   negros-oriental-travel-guides.html, luzon-travel-guides.html
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
const STATIC_PAGES = ["contact", "about", "trip-budget-calculator", "festival-calendar", "packing-checklist", "free-travel-guides", "where-to-go-philippines-quiz", "philippines-travel-map"];

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

  const total = archivePageCount(site);
  html = fillBlock(html, "archive", archiveList(site.posts.slice(0, ARCHIVE_PAGE_SIZE)) + archivePager(1, total), "index.html");
  putFile("index.html", html);
}

// STEP: "All stories" list, 10 per page ------------------------------------------
// Page 1 is the list on the homepage. Pages 2, 3... are real pages
// (/all-stories-2, /all-stories-3, ...) so every story stays reachable by link.
const ARCHIVE_PAGE_SIZE = 10;
const archivePageCount = (site) => Math.ceil(site.posts.length / ARCHIVE_PAGE_SIZE);
const archiveSlug = (n) => `all-stories-${n}`;

function archiveList(posts) {
  const items = posts
    .map((p) => `\n      <li><a href="${p.link}">${escapeHtml(p.title)}</a> <span class="meta">${metaLine(p)}</span></li>`)
    .join("");
  return `\n    <ul class="archive-list">${items}\n    </ul>`;
}

function archivePager(page, total) {
  if (total < 2) return "";
  const prev = page === 1 ? "" : `<a rel="prev" href="${page === 2 ? "./#archive-heading" : "./" + archiveSlug(page - 1)}">&larr; Previous page</a>`;
  const next = page === total ? "" : `<a rel="next" href="./${archiveSlug(page + 1)}">Next page &rarr;</a>`;
  return `\n    <nav class="pager" aria-label="All stories pages">${prev}<span class="pager__status">Page ${page} of ${total}</span>${next}</nav>`;
}

function buildArchivePages(site) {
  const total = archivePageCount(site);
  const pages = [];
  for (let n = 2; n <= total; n++) {
    const posts = site.posts.slice((n - 1) * ARCHIVE_PAGE_SIZE, n * ARCHIVE_PAGE_SIZE);
    const description = `All Ren Calago Blog stories, page ${n} of ${total}: travel guides, food trips and local news from Cebu, Dumaguete and Negros Oriental.`;
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>All Stories, Page ${n} | Ren Calago blog</title>
    <link rel="icon" type="image/x-icon" href="./Images/rencalago-favicon.png" />
    <meta name="description" content="${escapeHtml(description)}" />
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
    <!-- This page is written by _tools/build-site.mjs. Do not edit it by hand. -->
    <my-header><!-- build:header --><!-- /build:header --></my-header>

    <main>
      <section class="wrap page-head">
        <p class="kicker">Page ${n} of ${total}</p>
        <h1>All stories</h1>
      </section>

      <section class="wrap archive" aria-label="All stories">${archiveList(posts)}${archivePager(n, total)}
      </section>
    </main>

    <my-footer><!-- build:footer --><!-- /build:footer --></my-footer>
    <script type="module" src="./destination.js"></script>
  </body>
</html>
`;
    putFile(archiveSlug(n) + ".html", html);
    pages.push({ slug: archiveSlug(n), lastmod: posts.map((p) => isoDate(p.datePublished)).sort().pop() });
  }
  return pages;
}

// The " | Ren Calago blog" suffix is added only when the whole title still fits
// in 60 characters, so search results do not cut it short.
const TITLE_SUFFIX = " | Ren Calago blog";
const withSiteSuffix = (title) => ((title + TITLE_SUFFIX).length <= 60 ? title + TITLE_SUFFIX : title);

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

    if (withSiteSuffix(cfg.title).length > 60) warnings.push(`${cfg.page}: title is ${cfg.title.length} characters (aim for 60 or fewer)`);
    if (cfg.description.length < 140 || cfg.description.length > 165) {
      warnings.push(`${cfg.page}: description is ${cfg.description.length} characters (aim for about 150-160)`);
    }

    const cards = (list) => list.map((p) => site.storyCard(p)).join("");
    const intro = cfg.intro.map((paragraph) => `<p>${paragraph}</p>`).join("\n              ");
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
    <title>${escapeHtml(withSiteSuffix(cfg.title))}</title>
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
      <section class="wrap columns columns--dest">
        <div class="feed">
          <header class="page-head page-head--dest">
            <p class="kicker">Destination</p>
            <h1>${escapeHtml(cfg.h1)}</h1>
            <div class="page-head__intro">
              ${intro}
            </div>
          </header>${section("Start with these", start)}${section(start.length ? `More ${dest.name} stories` : `${dest.name} stories`, rest)}
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
      name: cfg.h1,
      members: new Set(stories.map(slugOf)),
      count: stories.length,
      lastmod: stories.map((p) => isoDate(p.datePublished)).sort().pop(),
    });
  }
  return pages;
}

// STEP: "Keep reading" block on every post -------------------------------------------
// Three related stories under each article, written as plain HTML so readers and
// crawlers can follow them. Stories are matched by place first (same town, then
// same region, then a neighbouring region); stories the article already links to
// are skipped. Among equally good matches, the story with the fewest "Keep
// reading" links so far wins, so links spread across the whole site instead of
// piling onto the newest posts, and every story ends up linked from somewhere.
const RELATED_COUNT = 3;
const REGIONS = [
  ["cebu", ["cebu", "oslob", "moalboal", "badian", "bantayan", "malapascua", "camotes", "cordova", "talisay", "dumanjug", "dalaguete", "carmen", "busay"]],
  ["negros-oriental", ["dumaguete", "negros oriental", "bais", "tanjay", "pamplona", "san jose", "la libertad", "sibulan", "mabinay", "apo island", "canlaon"]],
  ["siquijor", ["siquijor"]],
  ["bohol", ["bohol", "panglao", "corella"]],
  ["negros-occidental", ["negros occidental", "bacolod", "sipalay", "silay"]],
  ["eastern-visayas", ["leyte", "samar", "biliran", "tacloban"]],
  ["western-visayas", ["iloilo", "guimaras", "antique", "aklan", "boracay"]],
  ["palawan-mimaropa", ["palawan", "coron", "mindoro", "romblon"]],
  ["mindanao", ["mindanao", "davao", "surigao", "siargao", "camiguin", "bukidnon", "cagayan de oro", "cotabato"]],
  ["north-luzon", ["baguio", "benguet", "ifugao", "mountain province", "ilocos", "batanes", "la union", "pangasinan", "zambales", "pampanga", "aurora"]],
  ["south-luzon", ["manila", "intramuros", "taguig", "mckinley", "rizal", "angono", "tagaytay", "batangas", "albay", "bicol", "camarines", "sorsogon", "marinduque"]],
];
const NEIGHBOURS = {
  cebu: ["bohol", "negros-oriental", "eastern-visayas"],
  "negros-oriental": ["siquijor", "cebu", "negros-occidental"],
  siquijor: ["negros-oriental", "bohol"],
  bohol: ["cebu", "siquijor", "mindanao"],
  "negros-occidental": ["negros-oriental", "western-visayas"],
  "eastern-visayas": ["cebu"],
  "western-visayas": ["negros-occidental", "palawan-mimaropa"],
  "palawan-mimaropa": ["western-visayas"],
  mindanao: ["bohol"],
  "north-luzon": ["south-luzon"],
  "south-luzon": ["north-luzon"],
};

function regionsOf(post) {
  const text = String(post.location || "").toLowerCase();
  return new Set(REGIONS.filter(([, words]) => words.some((w) => text.includes(w))).map(([key]) => key));
}
// The town or city, e.g. "oslob" from "Oslob, Cebu"
const placeOf = (post) => String(post.location || "").split(",")[0].trim().toLowerCase();

// What kind of trip a story is about, from its title and slug.
const TOPICS = {
  islands: /\b(island|islands|sandbar|island-hopping)\b/,
  beaches: /\b(beach|beaches|cove|coves|resort)\b/,
  festivals: /\b(festival|fiesta|sinulog|masskara|buglasan|panagbenga|ati-atihan|dinagyang|higantes|artfest|oktoberfest)\b/,
  food: /\b(food|eat|eats|lechon|breakfast|sisig|cafe|kapehan|siomai|pasalubong|inasal)\b/,
  waterfalls: /\b(falls|waterfall|waterfalls|canyoneering)\b/,
  diving: /\b(diving|dive|snorkelling|snorkeling|sardine|whale|thresher|wreck)\b/,
  heritage: /\b(heritage|historic|ruins|intramuros|church|old houses)\b/,
  mountains: /\b(peak|trek|mount|volcano|terraces|hills|lookout|look-out)\b/,
  surf: /\b(surf|surfing)\b/,
  planning: /\b(itinerary|budget|cost|costs|arrival|safety|best time|month by month|peak season)\b/,
};
const topicsOf = (post) => {
  const text = `${post.title} ${slugOf(post).replace(/-/g, " ")}`.toLowerCase();
  return Object.keys(TOPICS).filter((k) => TOPICS[k].test(text));
};

// Small, stable number from two slugs, used only to break ties evenly.
function tieBreak(a, b) {
  let h = 0;
  for (const c of a + "|" + b) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function relatedScore(from, to) {
  const a = regionsOf(from);
  const b = regionsOf(to);
  let score = 0;
  if (placeOf(from) && placeOf(from) === placeOf(to)) score += 6;
  if ([...a].some((r) => b.has(r))) score += 4;
  else if ([...a].some((r) => (NEIGHBOURS[r] || []).some((n) => b.has(n)))) score += 2;
  if (!a.size && !b.size) score += 3; // two nationwide stories (budgets, arrival tips)
  if (from.category === to.category && from.category !== "Travel") score += 1;
  const fromTopics = topicsOf(from);
  if (topicsOf(to).some((t) => fromTopics.includes(t))) score += 2;
  return score;
}

// Slugs an article already links to inside its text.
function linkedFromBody(html) {
  const body = (html.match(/<article class="full-content">([\s\S]*?)<\/article>/) || [])[1] || "";
  return new Set([...body.matchAll(/href="\.\/([a-z0-9-]+)(?:\.html)?(?:#[^"]*)?"/g)].map((m) => m[1]));
}

function planRelated(site) {
  const inbound = new Map(site.posts.map((p) => [slugOf(p), 0]));
  const plan = new Map();
  for (const from of site.posts) {
    const slug = slugOf(from);
    const file = slug + ".html";
    if (!fs.existsSync(path.join(root, file))) continue;
    const skip = linkedFromBody(readFile(file));
    const candidates = site.posts
      .filter((to) => slugOf(to) !== slug && !skip.has(slugOf(to)))
      .map((to) => ({ to, score: relatedScore(from, to) }));
    const picks = [];
    while (picks.length < RELATED_COUNT && candidates.length) {
      candidates.sort(
        (x, y) =>
          y.score - x.score ||
          inbound.get(slugOf(x.to)) - inbound.get(slugOf(y.to)) ||
          tieBreak(slug, slugOf(x.to)) - tieBreak(slug, slugOf(y.to))
      );
      const { to } = candidates.shift();
      picks.push(to);
      inbound.set(slugOf(to), inbound.get(slugOf(to)) + 1);
    }
    plan.set(slug, picks);
  }
  // Second pass: a story nobody picked takes the weakest slot on the page that
  // matches it best, as long as the story it replaces is linked from elsewhere.
  const bySlug = new Map(site.posts.map((p) => [slugOf(p), p]));
  for (const [target, count] of inbound) {
    if (count > 0) continue;
    const to = bySlug.get(target);
    const options = [...plan]
      .filter(([from, picks]) => from !== target && !picks.includes(to) && !linkedFromBody(readFile(from + ".html")).has(target))
      .map(([from, picks]) => {
        const source = bySlug.get(from);
        const slot = picks
          .map((p, i) => ({ i, score: relatedScore(source, p), spare: inbound.get(slugOf(p)) > 1 }))
          .filter((s) => s.spare)
          .sort((a, b) => a.score - b.score)[0];
        return slot ? { from, slot, gain: relatedScore(source, to) - slot.score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.gain - a.gain || tieBreak(a.from, target) - tieBreak(b.from, target));
    if (!options.length) continue;
    const { from, slot } = options[0];
    const picks = plan.get(from);
    inbound.set(slugOf(picks[slot.i]), inbound.get(slugOf(picks[slot.i])) - 1);
    picks[slot.i] = to;
    inbound.set(target, 1);
  }
  const missed = [...inbound].filter(([, n]) => n === 0).map(([s]) => s);
  if (missed.length) warnings.push(`"Keep reading" links nowhere to: ${missed.join(", ")}`);
  return plan;
}

function relatedBlock(picks) {
  if (!picks || !picks.length) return "";
  const items = picks
    .map(
      (p) => `
    <a class="related__item" href="${p.link}">
      <span class="related__img"><img src="${String(p.imagesrc || "").replace(/sz=s\d+/, "sz=w600")}" alt="" loading="lazy" decoding="async"></span>
      <span class="related__meta">${escapeHtml(p.location || p.category)}</span>
      <span class="related__title">${escapeHtml(p.title)}</span>
    </a>`
    )
    .join("");
  return `
<section class="related" aria-labelledby="related-heading">
  <h2 id="related-heading">Keep reading</h2>
  <div class="related__grid">${items}
  </div>
</section>
`;
}

// Adds the "Keep reading" markers right after the article text the first time.
function ensureRelatedMarkers(html) {
  if (html.includes("<!-- build:related -->")) return html;
  const start = html.indexOf('<article class="full-content">');
  const end = start < 0 ? -1 : html.indexOf("</article>", start);
  if (end < 0) return html;
  const at = end + "</article>".length;
  return html.slice(0, at) + "\n              <!-- build:related --><!-- /build:related -->" + html.slice(at);
}

// IMAGE SIZES ----------------------------------------------------------------------
// Photos inside an article get width and height from the image file itself, so
// the browser reserves the right space before the photo arrives and the text
// does not jump (better Core Web Vitals). The CSS keeps them responsive.
const sizeCache = new Map();
function imageSize(file) {
  if (sizeCache.has(file)) return sizeCache.get(file);
  let size = null;
  try {
    const buf = fs.readFileSync(file);
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
      size = { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }; // PNG
    } else if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2; // JPEG: walk the markers to the frame header
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          size = { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
          break;
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    } else if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
      const kind = buf.toString("ascii", 12, 16);
      if (kind === "VP8X") size = { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      else if (kind === "VP8 ") size = { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      else if (kind === "VP8L") {
        const b = buf.readUInt32LE(21);
        size = { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
    }
  } catch {
    size = null;
  }
  sizeCache.set(file, size);
  return size;
}

function withImageSizes(html) {
  return html.replace(/(<article class="full-content">)([\s\S]*?)(<\/article>)/, (_m, open, body, close) => {
    const sized = body.replace(/<img\b[^>]*>/g, (tag) => {
      if (/\swidth=/.test(tag) || /\sheight=/.test(tag)) return tag;
      const src = (tag.match(/\ssrc=["']([^"']+)["']/) || [])[1] || "";
      if (!/^\.?\/?Images\//.test(src)) return tag; // only files hosted in the repo
      const size = imageSize(path.join(root, decodeURIComponent(src.replace(/^\.?\//, ""))));
      if (!size || !size.width || !size.height) return tag;
      return tag.replace(/<img\b/, `<img width="${size.width}" height="${size.height}"`);
    });
    return open + sized + close;
  });
}

// STEP: every page --------------------------------------------------------------------
// 1) The menu, sidebar and footer, written into the page as plain HTML.
//    layout.js still draws them in the browser; this is what a crawler (or a
//    visitor without JavaScript) sees first, so every page links to the
//    destinations, the contact page and the rest of the site.
// 2) The canonical address (the clean /slug form, so /slug and /slug.html count
//    as one page) and the Open Graph / Twitter tags that control how a link
//    looks when it is shared on Facebook or X. Posts whose featured image lives
//    in the repo (./Images/...) get og:image and a large-image X card.
//
// A page that already has one of these tags keeps it; only missing tags are added.

// Marks the current page in the menu, like layout.js does in the browser.
function withCurrentMarker(headerHtml, slug, destinationSlugs) {
  let attribute = null;
  if (slug === "index") attribute = 'data-nav="home"';
  else if (slug === "contact") attribute = 'data-nav="contact"';
  else if (destinationSlugs.includes(slug)) attribute = `data-page="${slug}"`;
  if (!attribute) return headerHtml;
  return headerHtml.replace(new RegExp(`(<a [^>]*${attribute}[^>]*)>`), '$1 aria-current="page">');
}

// Adds the empty placeholders the first time a page is seen, so a new article
// made from the old page template needs no manual step.
function ensureMarkers(html) {
  for (const [tag, name] of [["my-header", "header"], ["my-sidebar", "sidebar"], ["my-footer", "footer"]]) {
    html = html.replace(
      new RegExp(`<${tag}>\\s*</${tag}>`),
      `<${tag}><!-- build:${name} --><!-- /build:${name} --></${tag}>`
    );
  }
  if (!html.includes("<!-- build:analytics -->")) {
    // Take over the hand-pasted Google tag (the homepage had one) so there is only ever one.
    html = html.replace(/\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"><\/script>\s*<script>[\s\S]*?<\/script>/, "");
    html = html.replace(/(\s*)<\/body>/, "\n    <!-- build:analytics --><!-- /build:analytics -->$1</body>");
  }
  if (!html.includes("<!-- build:seo -->")) {
    html = html.replace(/(\s*)<\/head>/, "\n    <!-- build:seo --><!-- /build:seo -->$1</head>");
  }
  return html;
}

// Google Analytics 4. Change the ID here and rebuild to update every page.
const GA_ID = "G-1K13C294LJ";
const analyticsSnippet = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    </script>
    `;

// Structured data (JSON-LD) -------------------------------------------------------
// Tells Google what each page is: an article with its dates and author, where it
// sits on the site (breadcrumbs), and what the site itself is called.
// Optional in allPost.js: dateModified: "20 October 2026" when you update a post.
const SITE_NAME = "Ren Calago Blog";
const AUTHOR = { "@type": "Person", name: "Ren Calago", url: `${BASE}/about` };

function jsonLdScript(data) {
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">\n${json}\n    </script>`;
}

function pageUrl(slug) {
  return slug === "index" ? `${BASE}/` : `${BASE}/${slug}`;
}

function breadcrumbs(trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}

// An article's place on the site: Home > destination page (when it has one) > article.
// Used for both the BreadcrumbList data and the visible trail, so the two always match.
function postTrail(post, slug, destinationPages) {
  const hub = destinationPages.find((d) => d.members.has(slug));
  return [
    { name: "Home", url: `${BASE}/`, href: "./" },
    ...(hub ? [{ name: hub.name, url: pageUrl(hub.slug), href: `./${hub.slug}` }] : []),
    { name: post.title, url: pageUrl(slug) },
  ];
}

// The visible breadcrumb trail above an article's title.
function breadcrumbNav(trail) {
  const items = trail
    .map((item, i) =>
      i === trail.length - 1
        ? `<li aria-current="page">${escapeHtml(item.name)}</li>`
        : `<li><a href="${item.href}">${escapeHtml(item.name)}</a></li>`
    )
    .join("");
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items}</ol></nav>`;
}

// Adds the breadcrumb markers at the top of the title block the first time.
function ensureBreadcrumbMarkers(html) {
  if (html.includes("<!-- build:breadcrumbs -->")) return html;
  return html.replace(/(<div class="title">)(\s*)(<h1)/, "$1$2<!-- build:breadcrumbs --><!-- /build:breadcrumbs -->$2$3");
}

function structuredData(html, slug, site, destinationPages) {
  const home = { name: "Home", url: `${BASE}/` };
  const post = site.posts.find((p) => slugOf(p) === slug);
  const graph = [];

  if (slug === "index") {
    graph.push({ "@type": "WebSite", name: SITE_NAME, url: `${BASE}/` });
  } else if (post) {
    const published = isoDate(post.datePublished);
    const modified = post.dateModified ? isoDate(post.dateModified) : published;
    const article = {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.desc,
      datePublished: published,
      dateModified: modified,
      author: post.author ? { ...AUTHOR, name: post.author } : AUTHOR,
      publisher: { "@type": "Organization", name: SITE_NAME, url: `${BASE}/` },
      mainEntityOfPage: pageUrl(slug),
    };
    if (post.imagesrc) article.image = absoluteImage(post.imagesrc);
    graph.push(article);
    graph.push(breadcrumbs(postTrail(post, slug, destinationPages)));
  } else {
    const title = String((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || slug)
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\s*\|\s*Ren Calago( blog| Blog)?$/, "")
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'");
    graph.push(breadcrumbs([home, { name: title, url: pageUrl(slug) }]));
  }
  return jsonLdScript({ "@context": "https://schema.org", "@graph": graph });
}

// A featured image as a full https address. Social sites need an absolute URL.
function absoluteImage(src) {
  if (!src) return "";
  if (/^https?:\/\//.test(src)) return src;
  return `${BASE}/${src.replace(/^\.?\//, "")}`;
}

// Only images hosted on the site itself are used for share cards. Google Drive
// thumbnail links redirect and often fail for Facebook and X, so those posts
// keep the small "summary" card until the image is moved into Images/.
function shareImage(post) {
  return post && post.imagesrc && /^\.?\/?Images\//.test(post.imagesrc) ? absoluteImage(post.imagesrc) : "";
}

function seoTags(html, slug, isPost, post) {
  // Look for existing tags everywhere except our own block.
  const outside = html.replace(/<!-- build:seo -->[\s\S]*?<!-- \/build:seo -->/, "");
  const has = (attribute, value) => new RegExp(`${attribute}=["']${value}["']`).test(outside);
  const clean = (text) => String(text || "").replace(/\s+/g, " ").trim().replace(/"/g, "&quot;");

  const url = slug === "index" ? `${BASE}/` : `${BASE}/${slug}`;
  const title = clean((outside.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).replace(/\s*\|\s*Ren Calago( blog| Blog)?$/, "");
  // The quote that opens the content must also close it, so an apostrophe inside
  // a double-quoted description does not cut it short.
  const description = clean((outside.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/) || [])[2]);

  const tags = [];
  if (!has("rel", "canonical")) tags.push(`<link rel="canonical" href="${url}" />`);
  if (!has("property", "og:type")) tags.push(`<meta property="og:type" content="${isPost ? "article" : "website"}" />`);
  if (!has("property", "og:site_name")) tags.push(`<meta property="og:site_name" content="Ren Calago Blog" />`);
  if (title && !has("property", "og:title")) tags.push(`<meta property="og:title" content="${title}" />`);
  if (description && !has("property", "og:description")) tags.push(`<meta property="og:description" content="${description}" />`);
  if (!has("property", "og:url")) tags.push(`<meta property="og:url" content="${url}" />`);
  const image = shareImage(post);
  if (image && !has("property", "og:image")) {
    tags.push(`<meta property="og:image" content="${image}" />`);
    const alt = clean((html.match(/<div class="inside-image">\s*<img[^>]*\balt=(["'])([\s\S]*?)\1/) || [])[2]);
    if (alt) tags.push(`<meta property="og:image:alt" content="${alt}" />`);
  }
  if (!has("name", "twitter:card")) tags.push(`<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`);
  if (title && !has("name", "twitter:title")) tags.push(`<meta name="twitter:title" content="${title}" />`);
  if (description && !has("name", "twitter:description")) tags.push(`<meta name="twitter:description" content="${description}" />`);
  if (image && !has("name", "twitter:image")) tags.push(`<meta name="twitter:image" content="${image}" />`);
  return tags;
}

// Author and dates written into the page as plain HTML, so search engines see
// them without running JavaScript. post.js draws the same markup in the browser.
function withPostingMeta(html, post) {
  if (!post) return html;
  const updated = post.dateModified
    ? `<span class="postDate"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Updated ${escapeHtml(post.dateModified)}</span>`
    : "";
  const meta = `<p><span class="author"><i class="fa-solid fa-user" aria-hidden="true"></i> ${escapeHtml(post.author)}</span><span class="postDate"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(post.datePublished)}</span>${updated}</p>`;
  return html.replace(/<div class="posting-meta">[\s\S]*?<\/div>/, `<div class="posting-meta">${meta}</div>`);
}

// Search-result snippet guideline for articles: title up to 60 characters,
// meta description 140-160. Only a warning; the page is still built.
function checkSearchSnippet(html, file) {
  const decode = (text) => String(text || "").replace(/\s+/g, " ").trim().replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
  const description = decode((html.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/) || [])[2]);
  if (title.length > 60) warnings.push(`${file}: title is ${title.length} characters (aim for 60 or fewer)`);
  if (description.length < 140 || description.length > 160) {
    warnings.push(`${file}: meta description is ${description.length} characters (aim for 140-160)`);
  }
}

function buildPages(site, destinationPages) {
  const postSlugs = new Set(site.posts.map(slugOf));
  const destinationSlugs = destinationPages.map((p) => p.slug);
  const related = planRelated(site);
  const files = new Set([
    ...fs.readdirSync(root).filter((f) => f.endsWith(".html")),
    ...[...pending.keys()].filter((f) => f.endsWith(".html")),
  ]);
  let count = 0;

  for (const file of [...files].sort()) {
    if (file === "404.html") continue; // standalone error page
    let html = readFile(file);
    if (/http-equiv=["']refresh["']/i.test(html)) continue; // redirect pages such as the old Negros Oriental URL
    const slug = file.replace(/\.html$/, "");

    html = ensureMarkers(html);

    if (html.includes("<!-- build:header -->")) {
      const layout = site.layoutFor(slug === "index" ? "" : slug);
      html = fillBlock(html, "header", withCurrentMarker(layout.header, slug, destinationSlugs), file);
      if (html.includes("<!-- build:sidebar -->")) html = fillBlock(html, "sidebar", layout.sidebar, file);
      if (html.includes("<!-- build:footer -->")) html = fillBlock(html, "footer", layout.footer, file);
    }

    if (postSlugs.has(slug)) {
      checkSearchSnippet(html, file);
      const post = site.posts.find((p) => slugOf(p) === slug);
      html = withPostingMeta(html, post);
      html = ensureBreadcrumbMarkers(html);
      if (html.includes("<!-- build:breadcrumbs -->")) {
        html = fillBlock(html, "breadcrumbs", breadcrumbNav(postTrail(post, slug, destinationPages)), file);
      } else {
        warnings.push(`${file}: no <div class="title"><h1> block, so no breadcrumb trail was added`);
      }
      html = withImageSizes(html);
      html = ensureRelatedMarkers(html);
      if (html.includes("<!-- build:related -->")) html = fillBlock(html, "related", relatedBlock(related.get(slug)), file);
    }
    const tags = seoTags(html, slug, postSlugs.has(slug), site.posts.find((p) => slugOf(p) === slug));
    tags.push(structuredData(html, slug, site, destinationPages));
    html = fillBlock(html, "seo", tags.length ? "\n    " + tags.join("\n    ") + "\n    " : "", file);

    html = fillBlock(html, "analytics", analyticsSnippet, file);

    putFile(file, html);
    count++;
  }
  return count;
}

// STEP: sitemap --------------------------------------------------------------------
function buildSitemap(site, destinationPages, archivePages) {
  // Keep the <lastmod> values that are already there.
  const existing = new Map();
  const oldXml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  for (const m of oldXml.matchAll(/<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)) {
    existing.set(m[1].trim().replace(/\/$/, ""), m[2] ? m[2].trim() : undefined);
  }

  const entries = [];
  const newestPost = site.posts.map((p) => isoDate(p.datePublished)).sort().pop();
  entries.push({ loc: BASE + "/", lastmod: newestPost }); // the homepage changes with every post

  for (const page of [...destinationPages, ...archivePages]) entries.push({ loc: `${BASE}/${page.slug}`, lastmod: page.lastmod });

  for (const page of STATIC_PAGES) {
    if (!fs.existsSync(path.join(root, page + ".html"))) throw new Error(`STATIC_PAGES lists "${page}" but ${page}.html does not exist`);
    entries.push({ loc: `${BASE}/${page}`, lastmod: existing.get(`${BASE}/${page}`) });
  }

  for (const post of site.posts) {
    const slug = slugOf(post);
    if (!fs.existsSync(path.join(root, slug + ".html"))) throw new Error(`allPost.js links to "${slug}" but ${slug}.html does not exist`);
    const loc = `${BASE}/${slug}`;
    entries.push({ loc, lastmod: [existing.get(loc) || isoDate(post.datePublished), post.dateModified ? isoDate(post.dateModified) : ""].sort().pop() });
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
let archivePages = [];
let pageCount = 0;
try {
  if (!Array.isArray(site.posts) || site.posts.length === 0) throw new Error("allPost.js has no posts");
  buildHomepage(site);
  destinationPages = buildDestinationPages(site);
  archivePages = buildArchivePages(site);
  pageCount = buildPages(site, destinationPages);
  sitemapCount = buildSitemap(site, destinationPages, archivePages);
} finally {
  site.cleanup();
}

const stale = [];
for (const [file, content] of pending) {
  const target = path.join(root, file);
  const onDisk = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null; // null = a new file
  // The footer's copyright year changes every January. The browser shows the
  // current year anyway, so a different year alone is not a reason to rewrite a page.
  const sameButYear = (text) => (text === null ? null : text.replace(/Copyright © \d{4}/g, "Copyright © YEAR"));
  if (sameButYear(onDisk) === sameButYear(content)) continue;
  stale.push(file);
  if (!checkOnly) fs.writeFileSync(path.join(root, file), content);
}

for (const warning of warnings) console.warn("Warning: " + warning);

if (checkOnly) {
  if (stale.length) {
    console.error("Out of date: " + stale.join(", ") + "\nRun: node _tools/build-site.mjs");
    process.exit(1);
  }
  console.log(`Up to date (${site.posts.length} posts, ${destinationPages.length} destination pages, ${pageCount} pages checked, ${sitemapCount} sitemap URLs).`);
} else {
  console.log(
    (stale.length ? "Updated " + stale.join(", ") : "No changes") +
      `. ${site.posts.length} posts, ${destinationPages.length} destination pages (${destinationPages.map((p) => p.count).join("/")} stories), ${pageCount} pages processed, ${sitemapCount} sitemap URLs.`
  );
}
