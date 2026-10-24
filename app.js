// Homepage: hero, editor's picks, destination tiles, filterable story feed.
import { newPostTwo } from "./allPost.js";
import { regionsOf } from "./regions.js";
import { registerLayout, thumb, escapeHtml as esc, metaLine, storyCard } from "./layout.js";

registerLayout();

// SETTINGS you may want to edit -----------------------------------------------
const PER_PAGE = 6; // stories per page in "Latest stories"
// (The "Start here" list and the menu are in layout.js)

// Destination tiles / menu filters. A story belongs to a destination when its
// location contains one of the keywords (lower case), or when its location is
// in one of the destination's official "regions" (see regions.js). Only the
// location is used, so a story that mentions "from Cebu" in its description is
// not listed under Cebu.
// "href" is where a tile goes. Without it the tile opens the homepage filtered
// to that destination. "cta" is the small line under the name.
const DESTINATIONS = [
  { key: "cebu", name: "Cebu", tile: true, tone: "#2F6F8F", keywords: ["cebu", "bantayan", "malapascua", "camotes", "oslob", "moalboal", "badian"], href: "./cebu-travel-guides" },
  { key: "dumaguete", name: "Dumaguete", tile: true, tone: "#3F7A5A", keywords: ["dumaguete"], href: "./dumaguete-travel-guides" },
  {
    key: "negros-oriental",
    name: "Negros Oriental",
    tile: true,
    tone: "#8A5A2B",
    keywords: ["negros oriental", "dumaguete", "bais", "tanjay", "pamplona", "san jose", "la libertad"],
    href: "./negros-oriental-travel-guides",
  },
  {
    key: "baguio",
    name: "Baguio",
    tile: true,
    tone: "#5B6B3A",
    keywords: ["baguio"],
    intro: [
      'Baguio is the highland city of northern Luzon, known for its cool weather and for being a popular escape from the lowland heat. The stories below look at <a href="./baguio-quieter-cheaper-right-now">how crowds, hotel prices and attractions such as Burnham Lake stand in 2026</a> and at <a href="./travel-to-baguio-city-places-to-visit">places to visit on a family trip</a>.',
      "Prices, opening hours and weather change through the year, so check current details before you go.",
    ],
  },
  {
    key: "metro-manila",
    name: "Metro Manila",
    tile: true,
    tone: "#6B4A7A",
    keywords: ["mckinley", "taguig", "manila"],
    intro: [
      'Metro Manila coverage here is just getting started. For now there is <a href="./venice-grand-canal-mckinley-hill">the Venice Grand Canal in McKinley Hill, Taguig</a>, a canal-side spot for dining, a boat ride or an easy stroll.',
      "Opening hours and prices change, so confirm current details before you visit.",
    ],
  },
  {
    key: "luzon",
    name: "Luzon",
    tile: false,
    tone: "#5B6B3A",
    keywords: [],
    regions: [
      "National Capital Region", "Cordillera Administrative Region", "Ilocos Region", "Cagayan Valley",
      "Central Luzon", "CALABARZON", "Bicol Region",
    ],
    href: "./luzon-travel-guides",
  },
  {
    key: "palawan-mimaropa",
    name: "Palawan & MIMAROPA",
    tile: false,
    tone: "#2E7D74",
    keywords: [],
    regions: ["MIMAROPA Region"],
    href: "./palawan-mimaropa-travel-guides",
  },
  {
    key: "visayas",
    name: "Visayas",
    tile: false,
    tone: "#3D6E8C",
    // Cebu, Dumaguete and Negros Oriental stories have their own pages and are
    // left off this one (see "excludeDestinations" in _tools/destinations.json).
    keywords: [],
    regions: ["Western Visayas", "Negros Island Region", "Central Visayas", "Eastern Visayas"],
    href: "./visayas-travel-guides",
  },
  {
    key: "mindanao",
    name: "Mindanao",
    tile: false,
    tone: "#7A5A2E",
    keywords: [],
    regions: ["Zamboanga Peninsula", "Northern Mindanao", "Davao Region", "SOCCSKSARGEN", "Caraga", "BARMM"],
    href: "./mindanao-travel-guides",
  },
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
const feedIntro = $("feed-intro");
const feedList = $("feed-list");
const feedEmpty = $("feed-empty");
const pagination = $("pagination");
const searchInput = $("q");
const clearBtn = $("clear-filter");

function haystack(p) {
  return [p.title, p.location, p.desc, p.category].join(" ").toLowerCase();
}

function matchesFilter(p, filter) {
  if (filter.type === "cat") return p.category === filter.value;
  const d = DESTINATIONS.find((x) => x.key === filter.value);
  if (!d) return true;
  const location = String(p.location || "").toLowerCase();
  if (d.keywords.some((k) => location.includes(k))) return true;
  return Boolean(d.regions) && regionsOf(p.location).some((r) => d.regions.includes(r));
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
    .slice(1, 5) // four picks, leaving room for the free-guides card below them
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
      <a class="dest" href="${d.href || "./#dest=" + d.key}" style="--tone:${d.tone}">
        <strong>${esc(d.name)}</strong>
        <span>${esc(d.cta || "View stories →")}</span>
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

// Page numbers to show: the first four, the last two, and the current page
// with its neighbours. Gaps become a "…" marker, e.g. 1 2 3 4 … 16 17.
function pageList(current, pages) {
  const wanted = new Set([1, 2, 3, 4, pages - 1, pages, current - 1, current, current + 1]);
  const nums = [...wanted].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev === 2) out.push(prev + 1); // one hidden page: show it rather than a gap
    else if (n - prev > 2) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
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

  // A destination's short introduction shows above its stories (not while searching).
  const introDest = state.filter && state.filter.type === "dest" && !q ? DESTINATIONS.find((d) => d.key === state.filter.value) : null;
  feedIntro.innerHTML = introDest && introDest.intro ? introDest.intro.map((t) => `<p>${t}</p>`).join("") : "";
  feedIntro.hidden = !feedIntro.innerHTML;

  feedList.innerHTML = slice.map(storyCard).join("");
  feedEmpty.hidden = list.length > 0;

  if (pages <= 1) {
    pagination.innerHTML = "";
    return;
  }
  let buttons = "";
  for (const item of pageList(state.page, pages)) {
    buttons +=
      item === "…"
        ? `<span class="pagination__gap" aria-hidden="true">…</span>`
        : `<button type="button" data-page="${item}"${item === state.page ? ' aria-current="page"' : ""}>${item}</button>`;
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
export { DESTINATIONS, matchesFilter };
