// Shared layout: header, footer and sidebar used by the homepage AND every
// article page. Edit the menu, social links or footer in ONE place (here).
import { newPostTwo } from "./allPost.js";
import { svgIcon } from "./icons.js";
import { IMAGE_VARIANTS } from "./image-variants.js";
import { whenNear, nameFrames } from "./third-party.js";

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// MENU -------------------------------------------------------------------
// key  = how the link is matched to the current page (for the underline)
// group = "more" puts the link in the "More places" dropdown, so the menu stays
//        on one row on laptops. The footer still lists every destination.
// href = where it goes. Each destination (Cebu, Dumaguete, Luzon...) has its own
//        pages (set "page" to that page's file name so the menu can underline
//        it). "./#dest=..." and "./#cat=..." open the homepage with the stories
//        filtered (see DESTINATIONS in app.js).
const NAV = [
  { key: "home", label: "Home", href: "./" },
  { key: "dest=cebu", label: "Cebu", href: "./cebu-travel-guides", page: "cebu-travel-guides" },
  { key: "dest=dumaguete", label: "Dumaguete", href: "./dumaguete-travel-guides", page: "dumaguete-travel-guides" },
  { key: "dest=negros-oriental", label: "Negros Oriental", href: "./negros-oriental-travel-guides", page: "negros-oriental-travel-guides" , group: "more"},
  { key: "dest=baguio", label: "Baguio", href: "./baguio-travel-guides", page: "baguio-travel-guides" , group: "more"},
  { key: "dest=luzon", label: "Luzon", href: "./luzon-travel-guides", page: "luzon-travel-guides" , group: "more"},
  { key: "dest=palawan-mimaropa", label: "Palawan", href: "./palawan-mimaropa-travel-guides", page: "palawan-mimaropa-travel-guides" , group: "more"},
  { key: "dest=visayas", label: "Visayas", href: "./visayas-travel-guides", page: "visayas-travel-guides" , group: "more"},
  { key: "dest=mindanao", label: "Mindanao", href: "./mindanao-travel-guides", page: "mindanao-travel-guides" , group: "more"},
  { key: "cat=Cafes & Restaurant", label: "Food & Cafes", href: "./#cat=Cafes%20%26%20Restaurant" },
  { key: "cat=Beach Resort", label: "Resorts", href: "./#cat=Beach%20Resort" },
  { key: "map", label: "Map", href: "./philippines-travel-map", page: "philippines-travel-map" },
  { key: "contact", label: "Contact", href: "./contact" },
];

// SOCIAL LINKS -------------------------------------------------------------
// Also used by the build for the author schema (sameAs), so keep these to
// profiles that are live and yours.
export const SOCIAL = [
  { label: "Facebook", short: "Facebook", href: "https://www.facebook.com/rencalago", icon: "brands/facebook" },
  { label: "Instagram", short: "Instagram", href: "https://www.instagram.com/rencalago", icon: "brands/instagram" },
  { label: "YouTube", short: "YouTube", href: "https://www.youtube.com/rencalago", icon: "brands/youtube" },
  { label: "Twitter", short: "X", href: "https://www.twitter.com/rencalago", icon: "brands/twitter" },
];

// Category chips keep a fixed order, so a new post in another category
// does not reshuffle the menu on every page. Unlisted categories follow.
const CATEGORY_ORDER = ["Travel", "News"];
const usedCategories = new Set(newPostTwo.map((p) => p.category));
export const CATEGORIES = CATEGORY_ORDER.filter((c) => usedCategories.has(c)).concat(
  Array.from(usedCategories).filter((c) => !CATEGORY_ORDER.includes(c))
);

// "Start here" box in the sidebar: the "link" of each post you want to feature
export const START_HERE = [
  "./cebu-3-day-itinerary",
  "./dumaguete-vs-cebu-which-to-visit-first",
  "./philippines-itinerary-7-10-14-days",
];

// Agoda hotel ad (sidebar, below "Browse by label"). Scripts written through
// innerHTML never run, so the Agoda loader is added as real script elements once
// the sidebar is on the page. The library must load before its config runs.
const AGODA_LIBRARY_SRC = "https://cdn0.agoda.net/images/sherpa/js/init-dynamic_v8.min.js";
const AGODA_CONFIG = `var stg = new Object(); stg.crt="10006486859977";stg.version="1.05"; stg.id=stg.name="adgshp545693965"; stg.Width="160px"; stg.Height="600px";stg.RefKey="ynSCj/jmH6Y9AQrODGh5Rg==";stg.AutoScrollSpeed=3000;stg.AutoScrollToggle=true;stg.SearchboxShow=true;stg.DiscountedOnly=true;stg.Layout="thindynamic"; stg.Language="en-us";stg.ApiKey="636f6ea1-d6d4-4031-ac81-841baef60b1a";stg.Cid="1941279";  stg.City="18871";stg.Currency="USD";stg.OverideConf=false; new AgdDynamic('adgshp545693965').initialize(stg);`;

// The widget (about half a megabyte of scripts, fonts and photos) loads only
// when the sidebar box comes near the screen.
function loadAgodaAd(host) {
  whenNear(host, () => startAgodaAd(host));
}

function startAgodaAd(host) {
  if (!host || !host.parentNode || host.dataset.loaded) return;
  host.dataset.loaded = "1";
  const lib = document.createElement("script");
  lib.src = AGODA_LIBRARY_SRC;
  lib.async = false;
  lib.onload = () => {
    const cfg = document.createElement("script");
    cfg.textContent = AGODA_CONFIG;
    host.parentNode.appendChild(cfg);
  };
  host.parentNode.appendChild(lib);
}

// Google Drive thumbnails are requested at s4000 (huge). Ask for a sensible width.
export function thumb(url, width) {
  return String(url).replace(/sz=s\d+/, "sz=w" + width);
}

// Smaller copies of a photo (made by _tools/resize-images.py, listed in
// image-variants.js by the build), offered to the browser with srcset so it
// downloads a file close to the size it shows. "sizes" says how wide the image
// is drawn. Photos without copies (and Google Drive images) get nothing extra.
export function srcsetAttrs(src, sizes) {
  const match = /^\.\/Images\/(([\w-]+)\/[^/?#\s,]+)$/.exec(String(src));
  const entry = match && IMAGE_VARIANTS[match[1]];
  if (!entry) return "";
  const [original, ...widths] = entry;
  const name = match[1].slice(match[2].length + 1);
  const set = widths.map((w) => `./Images/${match[2]}/w${w}/${name} ${w}w`).concat(`${src} ${original}w`);
  return ` srcset="${set.join(", ")}" sizes="${sizes}"`;
}

// How wide the story photos are drawn (see .story__img in style.css): full
// width on phones, beside the text on wider screens. Measured in a browser;
// update it if the card layout changes.
export const STORY_IMG_SIZES = "(max-width: 600px) calc(100vw - 48px), (max-width: 1199px) 40vw, 340px";

// "Cebu City · 13 October 2026"
export function metaLine(p) {
  return [p.location, p.datePublished].filter(Boolean).map(escapeHtml).join(" · ");
}

// One story card. Used by the homepage feed (app.js) and the destination pages.
export function storyCard(p) {
  return `
      <article class="story">
        <a class="story__img" href="${p.link}" tabindex="-1" aria-hidden="true">
          <img src="${thumb(p.imagesrc, 700)}"${srcsetAttrs(p.imagesrc, STORY_IMG_SIZES)} alt="${escapeHtml(p.title)}" loading="lazy" decoding="async"${p.imageFilter ? ` style="filter: ${p.imageFilter}"` : ""}>
        </a>
        <div class="story__body">
          <p class="kicker">${escapeHtml(p.category)}</p>
          <h3><a href="${p.link}">${escapeHtml(p.title)}</a></h3>
          <p class="story__desc">${escapeHtml(p.desc)}</p>
          <p class="meta">${metaLine(p)}</p>
        </div>
      </article>`;
}

// The file name of the page being viewed, e.g. "tops-cebu-look-out"
export function currentSlug() {
  return (window.location.pathname.split("/").filter(Boolean).pop() || "").replace(/\.html$/i, "");
}

// Label chips (used on the homepage sidebar and on every article page)
export function renderLabels(container) {
  if (!container) return;
  const chips = [`<a class="label-chip" href="./#all">All</a>`].concat(
    CATEGORIES.map(
      (c) => `<a class="label-chip" href="./#cat=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`
    )
  );
  container.innerHTML = chips.join("");
}

function markCurrent(nav) {
  const path = location.pathname.replace(/index\.html$/i, "");
  const onHome = path === "/" || path === "";
  let hash = location.hash.slice(1);
  try {
    hash = decodeURIComponent(hash);
  } catch (e) {}
  const filtered = /^(dest|cat)=/.test(hash);
  nav.querySelectorAll("a[data-nav]").forEach(function (a) {
    const key = a.dataset.nav;
    let current = false;
    if (key === "home") current = onHome && !filtered;
    else if (key === "contact") current = /\/contact(\.html)?\/?$/i.test(location.pathname);
    else if (a.dataset.page) current = currentSlug() === a.dataset.page;
    else current = onHome && hash === key;
    if (current) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function defineOnce(name, cls) {
  if (!customElements.get(name)) customElements.define(name, cls);
}

// The build writes the header, sidebar and footer into every page as plain HTML.
// When they are already there, the browser keeps them as they are (redrawing
// would make the page do the work twice) and only wires up the menu buttons.
// Empty elements (a page the build has not seen yet) are drawn here.
const prerendered = (el) => Boolean(el.firstElementChild);

export function registerLayout() {
  nameFrames();
  defineOnce(
    "my-header",
    class extends HTMLElement {
      connectedCallback() {
        if (!prerendered(this)) this.draw();
        this.wireUp();
      }
      draw() {
        const social = SOCIAL.map(
          (s) => `<a href="${s.href}" aria-label="${s.label}">${s.short}</a>`
        ).join("");
        const link = (n) =>
          `<a href="${n.href}" data-nav="${escapeHtml(n.key)}"${n.page ? ` data-page="${n.page}"` : ""}>${escapeHtml(n.label)}</a>`;
        const more = NAV.filter((n) => n.group === "more");
        const moreMenu = `
      <div class="nav-more">
        <button class="nav-more__toggle" type="button" aria-expanded="false" aria-controls="nav-more-list">More places <svg class="nav-more__chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="nav-more__list" id="nav-more-list">${more.map(link).join("")}</div>
      </div>`;
        // The dropdown sits right after the last top-level destination link.
        const lastDest = NAV.map((n) => !n.group && n.key.startsWith("dest=")).lastIndexOf(true);
        const links = NAV.filter((n) => !n.group)
          .map((n, i) => link(n) + (i === lastDest ? moreMenu : ""))
          .join("");
        this.innerHTML = `
<div class="topbar">
  <div class="topbar__inner">
    <span>Places, food and trips across the Philippines</span>
    <span class="topbar__social">${social}</span>
  </div>
</div>
<header class="site-header">
  <div class="site-header__inner">
    <a class="brand" href="./" aria-label="Ren Calago Blog, home">
      <span class="brand__ren">ren</span><span class="brand__calago">calago</span><span class="brand__blog">Blog</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">
      <span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      ${links}
      <a class="site-nav__search" href="./#search" aria-label="Search stories"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></a>
    </nav>
  </div>
</header>`;
      }
      wireUp() {
        const toggle = this.querySelector(".nav-toggle");
        const nav = this.querySelector(".site-nav");
        toggle.addEventListener("click", function () {
          const open = nav.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", String(open));
        });
        const moreToggle = this.querySelector(".nav-more__toggle");
        const moreBox = this.querySelector(".nav-more");
        const setMore = function (open) {
          moreBox.classList.toggle("is-open", open);
          moreToggle.setAttribute("aria-expanded", String(open));
        };
        moreToggle.addEventListener("click", function () {
          setMore(moreToggle.getAttribute("aria-expanded") !== "true");
        });
        document.addEventListener("click", function (e) {
          if (e.target && e.target.closest && !e.target.closest(".nav-more")) setMore(false);
        });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && moreToggle.getAttribute("aria-expanded") === "true") {
            setMore(false);
            moreToggle.focus();
          }
        });
        nav.addEventListener("click", function (e) {
          if (e.target.closest("a")) {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            setMore(false);
          }
        });
        markCurrent(nav);
        window.addEventListener("hashchange", function () {
          markCurrent(nav);
        });
      }
    }
  );

  defineOnce(
    "my-footer",
    class extends HTMLElement {
      connectedCallback() {
        if (prerendered(this)) return;
        const year = new Date().getFullYear();
        const dest = NAV.filter((n) => n.key.startsWith("dest="))
          .map((n) => `<a href="${n.href}">${escapeHtml(n.label)}</a>`)
          .join("");
        const cats = CATEGORIES.map(
          (c) => `<a href="./#cat=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`
        ).join("");
        const social = SOCIAL.map(
          (s) => `<a href="${s.href}" aria-label="${s.label}">${s.short}</a>`
        ).join("");
        this.innerHTML = `
<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__about">
      <div class="site-footer__brand">ren<span>calago</span></div>
      <p>A blog to inspire you to explore the unique places in the Philippines. Festivals, food trips and a few inspiring thoughts.</p>
    </div>
    <nav class="site-footer__col" aria-label="Destinations"><h2>Destinations</h2>${dest}</nav>
    <nav class="site-footer__col" aria-label="Categories"><h2>Categories</h2>${cats}</nav>
    <nav class="site-footer__col" aria-label="Blog"><h2>Blog</h2><a href="./about">About</a><a href="./trip-budget-calculator">Trip budget calculator</a><a href="./festival-calendar">Festival calendar</a><a href="./packing-checklist">Packing checklist</a><a href="./free-travel-guides">Free travel guides</a><a href="./where-to-go-philippines-quiz">Where to go quiz</a><a href="./philippines-travel-map">Travel map</a><a href="./contact">Contact</a><a href="./contact">Advertise</a></nav>
  </div>
  <div class="site-footer__bar">
    <div class="site-footer__bar-inner">
      <span>Copyright © ${year} Ren Calago Blog · All rights reserved</span>
      <span class="site-footer__social">${social}</span>
    </div>
  </div>
</footer>`;
      }
    }
  );

  defineOnce(
    "my-sidebar",
    class extends HTMLElement {
      connectedCallback() {
        if (!prerendered(this)) this.draw();
        loadAgodaAd(this.querySelector("#adgshp545693965"));
      }
      draw() {
        const icons = SOCIAL.map(
          (s) => `<a href="${s.href}" aria-label="${s.label}">${svgIcon(s.icon)}</a>`
        ).join("");
        // Don't suggest the article the reader is already on
        const here = "./" + currentSlug();
        const startItems = START_HERE.filter((link) => link !== here)
          .map((link) => newPostTwo.find((p) => p.link === link))
          .filter(Boolean)
          .map(
            (p) => `
    <a class="start-item" href="${p.link}">
      <img src="${thumb(p.imagesrc, 200)}"${srcsetAttrs(p.imagesrc, "96px")} alt="" loading="lazy" decoding="async" width="96" height="64"${p.imageFilter ? ` style="filter: ${p.imageFilter}"` : ""}>
      <span>${escapeHtml(p.title)}</span>
    </a>`
          )
          .join("");
        this.innerHTML = `
<section class="card">
  <h2>Start here</h2>${startItems}
</section>
<section class="follow">
  <h2>Follow Ren</h2>
  <p>New places, food trips and photos as they happen.</p>
  <div class="follow__icons">${icons}</div>
</section>
<section class="card advertise">
  <h2>Advertise with us</h2>
  <p>Want your business or event featured on the blog? Let's talk.</p>
  <a class="button" href="./contact">Get in touch</a>
</section>
<section class="card">
  <h2>Browse by label</h2>
  <div class="labels-container"></div>
</section>
<section class="card agoda-card">
  <div id="adgshp545693965"></div>
</section>`;
        renderLabels(this.querySelector(".labels-container"));
      }
    }
  );
}
