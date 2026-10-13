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

// STEP: every page --------------------------------------------------------------------
// 1) The menu, sidebar and footer, written into the page as plain HTML.
//    layout.js still draws them in the browser; this is what a crawler (or a
//    visitor without JavaScript) sees first, so every page links to the
//    destinations, the contact page and the rest of the site.
// 2) The canonical address (the clean /slug form, so /slug and /slug.html count
//    as one page) and the Open Graph / Twitter tags that control how a link
//    looks when it is shared on Facebook. No image yet (see the note below).
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

function seoTags(html, slug, isPost) {
  // Look for existing tags everywhere except our own block.
  const outside = html.replace(/<!-- build:seo -->[\s\S]*?<!-- \/build:seo -->/, "");
  const has = (attribute, value) => new RegExp(`${attribute}=["']${value}["']`).test(outside);
  const clean = (text) => String(text || "").replace(/\s+/g, " ").trim().replace(/"/g, "&quot;");

  const url = slug === "index" ? `${BASE}/` : `${BASE}/${slug}`;
  const title = clean((outside.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).replace(/\s*\|\s*Ren Calago( blog| Blog)?$/, "");
  const description = clean((outside.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/) || [])[1]);

  const tags = [];
  if (!has("rel", "canonical")) tags.push(`<link rel="canonical" href="${url}" />`);
  if (!has("property", "og:type")) tags.push(`<meta property="og:type" content="${isPost ? "article" : "website"}" />`);
  if (!has("property", "og:site_name")) tags.push(`<meta property="og:site_name" content="Ren Calago Blog" />`);
  if (title && !has("property", "og:title")) tags.push(`<meta property="og:title" content="${title}" />`);
  if (description && !has("property", "og:description")) tags.push(`<meta property="og:description" content="${description}" />`);
  if (!has("property", "og:url")) tags.push(`<meta property="og:url" content="${url}" />`);
  // "summary" because there is no og:image yet. When pages get a hosted image
  // (Google Drive thumbnail links are not reliable for Facebook), add og:image
  // here and switch this to "summary_large_image".
  if (!has("name", "twitter:card")) tags.push(`<meta name="twitter:card" content="summary" />`);
  return tags;
}

function buildPages(site, destinationPages) {
  const postSlugs = new Set(site.posts.map(slugOf));
  const destinationSlugs = destinationPages.map((p) => p.slug);
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

    const tags = seoTags(html, slug, postSlugs.has(slug));
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
