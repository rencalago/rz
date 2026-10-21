// Shared layout: header, footer and sidebar used by the homepage AND every
// article page. Edit the menu, social links or footer in ONE place (here).
import { newPostTwo } from "./allPost.js";

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// MENU -------------------------------------------------------------------
// key  = how the link is matched to the current page (for the underline)
// href = where it goes. Cebu, Dumaguete and Negros Oriental have their own
//        pages (set "page" to that page's file name so the menu can underline
//        it). "./#dest=..." and "./#cat=..." open the homepage with the stories
//        filtered (see DESTINATIONS in app.js).
const NAV = [
  { key: "home", label: "Home", href: "./" },
  { key: "dest=cebu", label: "Cebu", href: "./cebu-travel-guides", page: "cebu-travel-guides" },
  { key: "dest=dumaguete", label: "Dumaguete", href: "./dumaguete-travel-guides", page: "dumaguete-travel-guides" },
  { key: "dest=negros-oriental", label: "Negros Oriental", href: "./negros-oriental-travel-guides", page: "negros-oriental-travel-guides" },
  { key: "dest=luzon", label: "Luzon", href: "./#dest=luzon" },
  { key: "cat=Cafes & Restaurant", label: "Food & Cafes", href: "./#cat=Cafes%20%26%20Restaurant" },
  { key: "cat=Beach Resort", label: "Resorts", href: "./#cat=Beach%20Resort" },
  { key: "map", label: "Map", href: "./philippines-travel-map", page: "philippines-travel-map" },
  { key: "contact", label: "Contact", href: "./contact" },
];

// SOCIAL LINKS -------------------------------------------------------------
const SOCIAL = [
  { label: "Facebook", short: "Facebook", href: "https://www.facebook.com/rencalago", icon: "fa-brands fa-facebook" },
  { label: "Instagram", short: "Instagram", href: "https://www.instagram.com/rencalago", icon: "fa-brands fa-instagram" },
  { label: "YouTube", short: "YouTube", href: "https://www.youtube.com/rencalago", icon: "fa-brands fa-youtube" },
  { label: "Twitter", short: "X", href: "https://www.twitter.com/rencalago", icon: "fa-brands fa-twitter" },
];

export const CATEGORIES = Array.from(new Set(newPostTwo.map((p) => p.category)));

// "Start here" box in the sidebar: the "link" of each post you want to feature
export const START_HERE = [
  "./tops-cebu-look-out",
  "./travel-to-baguio-city-places-to-visit",
  "./travel-to-dumaguete-places-to-visit",
];

// Agoda hotel ad (sidebar, below "Browse by label"). Scripts written through
// innerHTML never run, so the Agoda loader is added as real script elements once
// the sidebar is on the page. The library must load before its config runs.
const AGODA_LIBRARY_SRC = "https://cdn0.agoda.net/images/sherpa/js/init-dynamic_v8.min.js";
const AGODA_CONFIG = `var stg = new Object(); stg.crt="10006486859977";stg.version="1.05"; stg.id=stg.name="adgshp545693965"; stg.Width="160px"; stg.Height="600px";stg.RefKey="ynSCj/jmH6Y9AQrODGh5Rg==";stg.AutoScrollSpeed=3000;stg.AutoScrollToggle=true;stg.SearchboxShow=true;stg.DiscountedOnly=true;stg.Layout="thindynamic"; stg.Language="en-us";stg.ApiKey="636f6ea1-d6d4-4031-ac81-841baef60b1a";stg.Cid="1941279";  stg.City="18871";stg.Currency="USD";stg.OverideConf=false; new AgdDynamic('adgshp545693965').initialize(stg);`;

function loadAgodaAd(host) {
  // The build renders this layout without a real DOM; only load the ad in a browser.
  if (typeof document === "undefined" || !host || !host.parentNode || host.dataset.loaded) return;
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

// Festival results card at the top of the sidebar, with one tab per festival.
// The tab named in DEFAULT_RESULTS_TAB opens first. Add each confirmed result to
// "winners" (contest, winner, place) and the card fills in by itself on the next
// build. Leave a list empty until a result is confirmed from an official or
// news source.
export const DEFAULT_RESULTS_TAB = "masskara";

export const BUGLASAN = {
  label: "Buglasan 2026",
  eyebrow: "Buglasan Festival 2026",
  dates: "15 to 25 October 2026, Dumaguete",
  guide: "./buglasan-festival-2026-events-schedule",
  guideLabel: "Read the festival guide",
  note: "Results will appear here once they are confirmed.",
  winners: [
    { contest: "Major winners", winner: "Bais City", place: "Champion" },
    { contest: "Major winners", winner: "Dumaguete City", place: "2nd place" },
    { contest: "Major winners", winner: "Tanjay City", place: "3rd place" },
    { contest: "Major winners", winner: "Bayawan City", place: "4th place" },
    { contest: "Major winners", winner: "Mabinay", place: "5th place" },
    { contest: "Buglasan Festival King", winner: "San Jose" },
    { contest: "Buglasan Festival Queen", winner: "Bayawan City" },
    { contest: "Best in streetdancing", winner: "Bais City" },
    { contest: "Best identification arch", winner: "Bayawan City" },
    { contest: "Best in costume", winner: "Dumaguete City" },
  ],
};

// MassKara Festival 2026 (Bacolod City) barangay results, from the official
// results sheet shared by the owner. The guide link is the festival article.
export const MASSKARA = {
  label: "MassKara 2026",
  eyebrow: "MassKara Festival 2026",
  dates: "Barangay competition, 18 October 2026, Bacolod City",
  guide: "./masskara-festival-2026-bacolod-final-weekend",
  guideLabel: "Read the festival guide",
  note: "Results will appear here once they are confirmed.",
  winners: [
    { contest: "Major awards", winner: "Brgy. Taculing", place: "Champion" },
    { contest: "Major awards", winner: "Brgy. Mandalagan", place: "1st runner-up" },
    { contest: "Major awards", winner: "Brgy. Handumanan", place: "2nd runner-up" },
    { contest: "Merry making competition", winner: "Brgy. Alangilan", place: "Champion" },
    { contest: "Merry making competition", winner: "Brgy. 6", place: "1st runner-up" },
    { contest: "Merry making competition", winner: "Brgy. Taculing", place: "2nd runner-up" },
    { contest: "Best in mask and costume", winner: "Brgy. Mandalagan" },
    { contest: "Best in theme and concept", winner: "Brgy. Taculing" },
    { contest: "Best in music", winner: "Brgy. Taculing" },
    { contest: "Best in introduction", winner: "Brgy. Taculing" },
    { contest: "Most disciplined", winner: "Brgy. Bata" },
    { contest: "Pocari Sweat special award", winner: "Brgy. Taculing" },
    { contest: "Casino Plus Choice Award", winner: "Brgy. Handumanan" },
  ],
};

// Google Drive thumbnails are requested at s4000 (huge). Ask for a sensible width.
export function thumb(url, width) {
  return String(url).replace(/sz=s\d+/, "sz=w" + width);
}

// "Cebu City · 13 October 2026"
export function metaLine(p) {
  return [p.location, p.datePublished].filter(Boolean).map(escapeHtml).join(" · ");
}

// One story card. Used by the homepage feed (app.js) and the destination pages.
export function storyCard(p) {
  return `
      <article class="story">
        <a class="story__img" href="${p.link}" tabindex="-1" aria-hidden="true">
          <img src="${thumb(p.imagesrc, 700)}" alt="${escapeHtml(p.title)}" loading="lazy" decoding="async"${p.imageFilter ? ` style="filter: ${p.imageFilter}"` : ""}>
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

export function registerLayout() {
  defineOnce(
    "my-header",
    class extends HTMLElement {
      connectedCallback() {
        const social = SOCIAL.map(
          (s) => `<a href="${s.href}" aria-label="${s.label}">${s.short}</a>`
        ).join("");
        const links = NAV.map(
          (n) => `<a href="${n.href}" data-nav="${escapeHtml(n.key)}"${n.page ? ` data-page="${n.page}"` : ""}>${escapeHtml(n.label)}</a>`
        ).join("");
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
      <a class="site-nav__search" href="./#search" aria-label="Search stories"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></a>
    </nav>
  </div>
</header>`;

        const toggle = this.querySelector(".nav-toggle");
        const nav = this.querySelector(".site-nav");
        toggle.addEventListener("click", function () {
          const open = nav.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", String(open));
        });
        nav.addEventListener("click", function (e) {
          if (e.target.closest("a")) {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
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
    <nav class="site-footer__col" aria-label="Blog"><h2>Blog</h2><a href="./about">About</a><a href="./trip-budget-calculator">Trip budget calculator</a><a href="./festival-calendar">Festival calendar</a><a href="./packing-checklist">Packing checklist</a><a href="./where-to-go-philippines-quiz">Where to go quiz</a><a href="./philippines-travel-map">Travel map</a><a href="./contact">Contact</a><a href="./contact">Advertise</a></nav>
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
        const icons = SOCIAL.map(
          (s) => `<a href="${s.href}" aria-label="${s.label}"><i class="${s.icon}" aria-hidden="true"></i></a>`
        ).join("");
        // Don't suggest the article the reader is already on
        const here = "./" + currentSlug();
        const startItems = START_HERE.filter((link) => link !== here)
          .map((link) => newPostTwo.find((p) => p.link === link))
          .filter(Boolean)
          .map(
            (p) => `
    <a class="start-item" href="${p.link}">
      <img src="${thumb(p.imagesrc, 300)}" alt="" loading="lazy" decoding="async" width="96" height="64"${p.imageFilter ? ` style="filter: ${p.imageFilter}"` : ""}>
      <span>${escapeHtml(p.title)}</span>
    </a>`
          )
          .join("");
        // Festival results card: one tab per festival, the default tab open first
        const resultsTabs = [
          { id: "masskara", set: MASSKARA },
          { id: "buglasan", set: BUGLASAN },
        ];
        const isDefault = (id) => id === DEFAULT_RESULTS_TAB;
        const tabButtons = resultsTabs
          .map(
            ({ id, set }) => `
    <button type="button" role="tab" id="bw-${id}-tab" class="bw__tab${isDefault(id) ? " is-active" : ""}" aria-selected="${isDefault(id)}" aria-controls="bw-${id}" tabindex="${isDefault(id) ? 0 : -1}">${escapeHtml(set.label)}</button>`
          )
          .join("");
        const panels = resultsTabs
          .map(({ id, set }) => {
            const body = set.winners.length
              ? `<ul class="bw__list">${set.winners
                  .map(
                    (w) => `
      <li class="bw__row">
        <span class="bw__contest">${escapeHtml(w.contest)}</span>
        <span class="bw__winner">${escapeHtml(w.winner)}</span>
        ${w.place ? `<span class="bw__place">${escapeHtml(w.place)}</span>` : ""}
      </li>`
                  )
                  .join("")}</ul>`
              : `<p class="bw__note">${escapeHtml(set.note)}</p>`;
            return `
  <div class="bw__panel" id="bw-${id}" role="tabpanel" aria-labelledby="bw-${id}-tab"${isDefault(id) ? "" : " hidden"}>
    <div class="bw__head">
      <span class="bw__eyebrow"><i class="fa-solid fa-star" aria-hidden="true"></i> ${escapeHtml(set.eyebrow)}</span>
      <h2>Festival winners</h2>
      <p class="bw__dates"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${escapeHtml(set.dates)}</p>
    </div>
    ${body}
    <a class="bw__link" href="${set.guide}">${escapeHtml(set.guideLabel)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
  </div>`;
          })
          .join("");
        const resultsCard = `
<section class="card bw" data-results-tabs>
  <div class="bw__tabs" role="tablist" aria-label="Festival results">${tabButtons}
  </div>${panels}
</section>`;
        this.innerHTML = `
${resultsCard}
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
        // Switch the festival results tabs (buttons are keyboard operable)
        const tabs = this.querySelectorAll(".bw__tab");
        tabs.forEach((tab) =>
          tab.addEventListener("click", () => {
            tabs.forEach((t) => {
              const on = t === tab;
              t.classList.toggle("is-active", on);
              t.setAttribute("aria-selected", String(on));
              t.tabIndex = on ? 0 : -1;
              const panel = this.querySelector("#" + t.getAttribute("aria-controls"));
              if (panel) panel.hidden = !on;
            });
          })
        );
        renderLabels(this.querySelector(".labels-container"));
        loadAgodaAd(this.querySelector("#adgshp545693965"));
      }
    }
  );
}
