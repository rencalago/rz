#!/usr/bin/env node
// Pre-renders the homepage into index.html as plain HTML.
//
// Why: the hero, editor's picks, destination tiles and story feed used to be
// built only by app.js in the browser. A crawler that reads the raw HTML (or a
// visitor with JavaScript off) saw empty boxes and no links to any article.
// This script writes the same markup straight into index.html, plus an
// "All stories" list that links every post. app.js still runs on top of it, so
// search, filters and pagination work exactly as before.
//
// Usage (from the repo root):
//   node _tools/build-home.mjs          rewrite index.html
//   node _tools/build-home.mjs --check  exit 1 if index.html is out of date
//
// Run it after adding or editing a post in allPost.js. Posts, destinations and
// PER_PAGE are read from allPost.js and app.js, so there is nothing to copy.
//
// The markup in the templates below mirrors app.js (renderHero, renderPicks,
// renderDestinations, renderFeed). If you change that markup in app.js, change
// it here too.
//
// This folder starts with "_" so GitHub Pages (Jekyll) does not publish it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checkOnly = process.argv.includes("--check");

// DATA -----------------------------------------------------------------------
const posts = new Function(
  read("allPost.js").replace(/export\s*\{[^}]*\};?/, "") + "\nreturn newPostTwo;"
)();

const appSrc = read("app.js");
const destinations = new Function(
  "return " + appSrc.match(/const DESTINATIONS = (\[[\s\S]*?\n\]);/)[1]
)();
const perPage = Number(appSrc.match(/const PER_PAGE = (\d+)/)[1]);

if (!Array.isArray(posts) || posts.length === 0) throw new Error("allPost.js has no posts");

// HELPERS (same as layout.js) --------------------------------------------------
const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const thumb = (url, width) => String(url).replace(/sz=s\d+/, "sz=w" + width);
// "&" must be written as "&amp;" inside HTML attributes.
const attr = (value) => String(value).replace(/&/g, "&amp;");
const metaLine = (p) => [p.location, p.datePublished].filter(Boolean).map(esc).join(" · ");
const filterStyle = (p) => (p.imageFilter ? ` style="filter: ${p.imageFilter}"` : "");

// TEMPLATES (mirror app.js) -----------------------------------------------------
function hero(p) {
  return `
    <a class="hero__img" href="${p.link}" tabindex="-1" aria-hidden="true">
      <img src="${attr(thumb(p.imagesrc, 1400))}" alt="${esc(p.title)}" fetchpriority="high" decoding="async"${filterStyle(p)}>
    </a>
    <div class="hero__body">
      <p class="kicker">${esc(p.category)}</p>
      <h2><a href="${p.link}">${esc(p.title)}</a></h2>
      <p class="hero__desc">${esc(p.desc)}</p>
      <p class="meta">${metaLine(p)}</p>
    </div>`;
}

function picks(list) {
  const items = list
    .slice(1, 6)
    .map(
      (p) => `
      <div class="pick">
        <p class="kicker">${esc(p.category)}</p>
        <a href="${p.link}">${esc(p.title)}</a>
      </div>`
    )
    .join("");
  return `<h2>Editor's picks</h2>${items}`;
}

function dest() {
  return destinations
    .filter((d) => d.tile)
    .map(
      (d) => `
      <a class="dest" href="./#dest=${d.key}" style="--tone:${d.tone}">
        <strong>${esc(d.name)}</strong>
        <span>View stories →</span>
      </a>`
    )
    .join("");
}

function feed(list) {
  // Same rule as app.js: no filter and no search means the hero is not repeated.
  return list
    .slice(1, 1 + perPage)
    .map(
      (p) => `
      <article class="story">
        <a class="story__img" href="${p.link}" tabindex="-1" aria-hidden="true">
          <img src="${attr(thumb(p.imagesrc, 700))}" alt="${esc(p.title)}" loading="lazy" decoding="async"${filterStyle(p)}>
        </a>
        <div class="story__body">
          <p class="kicker">${esc(p.category)}</p>
          <h3><a href="${p.link}">${esc(p.title)}</a></h3>
          <p class="story__desc">${esc(p.desc)}</p>
          <p class="meta">${metaLine(p)}</p>
        </div>
      </article>`
    )
    .join("");
}

function archive(list) {
  const items = list
    .map(
      (p) => `
      <li><a href="${p.link}">${esc(p.title)}</a> <span class="meta">${metaLine(p)}</span></li>`
    )
    .join("");
  return `
    <ul class="archive-list">${items}
    </ul>`;
}

// WRITE INTO index.html --------------------------------------------------------
const blocks = {
  hero: hero(posts[0]),
  picks: picks(posts),
  dest: dest(),
  feed: feed(posts),
  archive: archive(posts),
};

let html = read("index.html");
const original = html;

for (const [name, content] of Object.entries(blocks)) {
  const pattern = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
  if (!pattern.test(html)) throw new Error(`index.html is missing the "build:${name}" markers`);
  html = html.replace(pattern, (_m, open, close) => `${open}${content}${close}`);
}

if (checkOnly) {
  if (html !== original) {
    console.error("index.html is out of date. Run: node _tools/build-home.mjs");
    process.exit(1);
  }
  console.log("index.html is up to date (" + posts.length + " posts).");
} else {
  if (html !== original) fs.writeFileSync(path.join(root, "index.html"), html);
  console.log(
    (html !== original ? "Updated" : "No changes to") + " index.html: " + posts.length + " posts, " +
      Math.min(perPage, posts.length - 1) + " in the feed, " + destinations.filter((d) => d.tile).length + " destination tiles."
  );
}
