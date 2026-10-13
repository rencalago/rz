// Homepage: hero, editor's picks, destination tiles, filterable story feed.
import { newPostTwo } from "./allPost.js";
import { registerLayout, thumb, escapeHtml as esc } from "./layout.js";

registerLayout();

// SETTINGS you may want to edit -----------------------------------------------
const PER_PAGE = 6; // stories per page in "Latest stories"
// (The "Start here" list and the menu are in layout.js)

// Destination tiles / menu filters. A story belongs to a destination when its
// title, location or description contains one of the keywords (lower case).
const DESTINATIONS = [
  { key: "cebu", name: "Cebu", tile: true, tone: "#2F6F8F", keywords: ["cebu"] },
  { key: "dumaguete", name: "Dumaguete", tile: true, tone: "#3F7A5A", keywords: ["dumaguete"] },
  {
    key: "negros-oriental",
    name: "Negros Oriental",
    tile: true,
    tone: "#8A5A2B",
    keywords: ["negros oriental", "dumaguete", "bais", "tanjay", "pamplona", "san jose", "la libertad"],
  },
  { key: "baguio", name: "Baguio", tile: true, tone: "#5B6B3A", keywords: ["baguio"] },
  { key: "metro-manila", name: "Metro Manila", tile: true, tone: "#6B4A7A", keywords: ["mckinley", "taguig", "manila"] },
  { key: "luzon", name: "Luzon", tile: false, tone: "#5B6B3A", keywords: ["baguio", "mckinley", "taguig", "manila"] },
];
// -------------------------------------------------------------------------------

const posts = newPostTwo;
const hero = posts[0]; // the newest post
const state = { filter: null, query: "", page: 1 };

const $ = (id) => document.getElementById(id);
const heroEl = $("hero");
const picksEl = $("picks");
const destEl = $("dest-grid");
const feedTitle = $("feed-title");
const feedList = $("feed-list");
const feedEmpty = $("feed-empty");
const pagination = $("pagination");
const searchInput = $("q");
const clearBtn = $("clear-filter");

function metaLine(p) {
  return [p.location, p.datePublished].filter(Boolean).map(esc).join(" · ");
}

function haystack(p) {
  return [p.title, p.location, p.desc, p.category].join(" ").toLowerCase();
}

function matchesFilter(p, filter) {
  if (filter.type === "cat") return p.category === filter.value;
  const d = DESTINATIONS.find((x) => x.key === filter.value);
  if (!d) return true;
  const text = haystack(p);
  return d.keywords.some((k) => text.includes(k));
}

// RENDERERS ---------------------------------------------------------------------
function renderHero() {
  if (!hero) return;
  heroEl.innerHTML = `
    <a class="hero__img" href="${hero.link}" tabindex="-1" aria-hidden="true">
      <img src="${thumb(hero.imagesrc, 1400)}" alt="${esc(hero.title)}" fetchpriority="high" decoding="async"${hero.imageFilter ? ` style="filter: ${hero.imageFilter}"` : ""}>
    </a>
    <div class="hero__body">
      <p class="kicker">${esc(hero.category)}</p>
      <h2><a href="${hero.link}">${esc(hero.title)}</a></h2>
      <p class="hero__desc">${esc(hero.desc)}</p>
      <p class="meta">${metaLine(hero)}</p>
    </div>`;
}

function renderPicks() {
  const items = posts
    .slice(1, 6)
    .map(
      (p) => `
      <div class="pick">
        <p class="kicker">${esc(p.category)}</p>
        <a href="${p.link}">${esc(p.title)}</a>
      </div>`
    )
    .join("");
  picksEl.innerHTML = `<h2>Editor's picks</h2>${items}`;
}

function renderDestinations() {
  destEl.innerHTML = DESTINATIONS.filter((d) => d.tile)
    .map(
      (d) => `
      <a class="dest" href="./#dest=${d.key}" style="--tone:${d.tone}">
        <strong>${esc(d.name)}</strong>
        <span>View stories →</span>
      </a>`
    )
    .join("");
}

function visiblePosts() {
  const q = state.query.trim().toLowerCase();
  // With no filter and no search, the hero story is not repeated in the feed.
  let list = state.filter || q ? posts : posts.slice(1);
  if (state.filter) list = list.filter((p) => matchesFilter(p, state.filter));
  if (q) list = list.filter((p) => haystack(p).includes(q));
  return list;
}

function renderFeed() {
  const q = state.query.trim();
  const list = visiblePosts();
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if (state.page > pages) state.page = pages;
  const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

  feedTitle.textContent = state.filter
    ? "Stories: " + state.filter.label
    : q
    ? "Search results"
    : "Latest stories";
  clearBtn.hidden = !(state.filter || q);

  feedList.innerHTML = slice
    .map(
      (p) => `
      <article class="story">
        <a class="story__img" href="${p.link}" tabindex="-1" aria-hidden="true">
          <img src="${thumb(p.imagesrc, 700)}" alt="${esc(p.title)}" loading="lazy" decoding="async"${p.imageFilter ? ` style="filter: ${p.imageFilter}"` : ""}>
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
  feedEmpty.hidden = list.length > 0;

  if (pages <= 1) {
    pagination.innerHTML = "";
    return;
  }
  let buttons = "";
  for (let i = 1; i <= pages; i++) {
    buttons += `<button type="button" data-page="${i}"${i === state.page ? ' aria-current="page"' : ""}>${i}</button>`;
  }
  if (state.page < pages) {
    buttons += `<button type="button" data-page="${state.page + 1}">Next »</button>`;
  }
  pagination.innerHTML = buttons;
}

function scrollToStories() {
  $("stories").scrollIntoView();
}

// FILTERS (read from the address: #cat=Travel, #dest=cebu, #search, #all) ------
function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  let filter = null;
  if (params.get("cat")) {
    filter = { type: "cat", value: params.get("cat"), label: params.get("cat") };
  } else if (params.get("dest")) {
    const d = DESTINATIONS.find((x) => x.key === params.get("dest"));
    if (d) filter = { type: "dest", value: d.key, label: d.name };
  }
  state.filter = filter;
  state.page = 1;
  renderFeed();
  if (filter || params.has("all")) scrollToStories();
  if (params.has("search")) {
    scrollToStories();
    searchInput.focus({ preventScroll: true });
  }
}

pagination.addEventListener("click", function (e) {
  const btn = e.target.closest("button[data-page]");
  if (!btn) return;
  state.page = Number(btn.dataset.page);
  renderFeed();
  scrollToStories();
});

searchInput.addEventListener("input", function () {
  state.query = searchInput.value;
  state.page = 1;
  renderFeed();
});

$("search-form").addEventListener("submit", function (e) {
  e.preventDefault();
});

clearBtn.addEventListener("click", function () {
  searchInput.value = "";
  state.query = "";
  history.replaceState(null, "", location.pathname + location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});

window.addEventListener("hashchange", readHash);

// Clicking the header search icon while the address already ends in #search
// does not fire hashchange, so handle that case here.
document.addEventListener("click", function (e) {
  const icon = e.target.closest(".site-nav__search");
  if (!icon || !$("stories")) return;
  if (location.hash === "#search") {
    e.preventDefault();
    scrollToStories();
    searchInput.focus({ preventScroll: true });
  }
});

// START --------------------------------------------------------------------------
renderHero();
renderPicks();
renderDestinations();
readHash();

// Read by _tools/build-site.mjs (the destination list is defined once, here).
export { DESTINATIONS };
