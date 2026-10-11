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
// href = where it goes. "./#dest=..." and "./#cat=..." open the homepage
//        with the stories filtered (see DESTINATIONS in app.js).
const NAV = [
  { key: "home", label: "Home", href: "./" },
  { key: "dest=cebu", label: "Cebu", href: "./#dest=cebu" },
  { key: "dest=negros-oriental", label: "Negros Oriental", href: "./#dest=negros-oriental" },
  { key: "dest=luzon", label: "Luzon", href: "./#dest=luzon" },
  { key: "cat=Cafes & Restaurant", label: "Food & Cafes", href: "./#cat=Cafes%20%26%20Restaurant" },
  { key: "cat=Beach Resort", label: "Resorts", href: "./#cat=Beach%20Resort" },
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

// Google Drive thumbnails are requested at s4000 (huge). Ask for a sensible width.
export function thumb(url, width) {
  return String(url).replace(/sz=s\d+/, "sz=w" + width);
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
          (n) => `<a href="${n.href}" data-nav="${escapeHtml(n.key)}">${escapeHtml(n.label)}</a>`
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
    <nav class="site-footer__col" aria-label="Blog"><h2>Blog</h2><a href="./contact">Contact</a><a href="./contact">Advertise</a></nav>
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
      <img src="${thumb(p.imagesrc, 300)}" alt="" loading="lazy" decoding="async" width="96" height="64">
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
</section>`;
        renderLabels(this.querySelector(".labels-container"));
      }
    }
  );
}
