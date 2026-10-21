// Philippines travel map (philippines-travel-map.html).
//
// Click a province to list every story about it. Stories come from allPost.js, so a
// new post shows up on the map by itself, as long as its "location" names a place
// listed in PLACES below (for example "Moalboal, Cebu" or "Siquijor").
//
// To put a post on the map somewhere its location does not say, add
//   mapAreas: ["cavite", "batangas"]
// to the post in allPost.js. The ids are the province ids in PLACES.
//
// A post whose location is just "Philippines" goes in the "Across the Philippines" list.
import { newPostTwo as posts } from "./allPost.js";
import { AREAS, VIEWBOX } from "./philippines-travel-map-data.js";

(function () {
  "use strict";

  // Province id -> words that, found in a post's location, place it there.
  var PLACES = {
    "cebu": ["cebu", "oslob", "moalboal", "malapascua", "bantayan", "cordova", "dumanjug", "badian", "dalaguete", "mactan", "lapu-lapu", "mandaue"],
    "negros-oriental": ["negros oriental", "dumaguete", "bais", "pamplona", "tanjay", "sibulan", "mabinay", "apo island", "la libertad", "canlaon", "manjuyod", "dauin", "valencia", "siaton", "zamboanguita"],
    "negros-occidental": ["negros occidental", "bacolod", "sipalay", "silay"],
    "siquijor": ["siquijor"],
    "bohol": ["bohol", "panglao", "corella"],
    "palawan": ["palawan", "coron", "el nido", "puerto princesa", "san vicente", "port barton"],
    "metro-manila": ["manila", "intramuros", "taguig", "makati", "bgc", "binondo", "quezon city", "pasay"],
    "benguet": ["baguio", "benguet"],
    "ifugao": ["ifugao", "banaue", "batad"],
    "mountain-province": ["mountain province", "sagada"],
    "ilocos-norte": ["ilocos norte", "laoag", "pagudpud"],
    "ilocos-sur": ["ilocos sur", "vigan"],
    "la-union": ["la union"],
    "pangasinan": ["pangasinan"],
    "pampanga": ["pampanga"],
    "zambales": ["zambales"],
    "aurora": ["aurora", "baler"],
    "batanes": ["batanes"],
    "rizal": ["rizal", "angono"],
    "batangas": ["batangas", "anilao"],
    "cavite": ["cavite", "tagaytay"],
    "albay": ["albay", "legazpi"],
    "sorsogon": ["sorsogon", "donsol"],
    "camarines-sur": ["camarines sur", "caramoan"],
    "aklan": ["aklan", "boracay", "kalibo"],
    "iloilo": ["iloilo"],
    "guimaras": ["guimaras"],
    "romblon": ["romblon", "sibuyan"],
    "oriental-mindoro": ["oriental mindoro", "puerto galera"],
    "camiguin": ["camiguin"],
    "surigao-del-norte": ["surigao del norte", "siargao"],
    "davao-del-sur": ["davao"]
  };

  // Posts whose location field does not tell the whole story (or says the wrong
  // province). Slug -> province ids. A mapAreas field in allPost.js does the same.
  var OVERRIDES = {
    "tagaytay-taal-day-trip-manila": ["cavite", "batangas"],
    "ati-atihan-dinagyang-2027": ["aklan", "iloilo"]
  };

  var mapEl = document.getElementById("ph-map");
  var panel = document.getElementById("ph-map-panel");
  var chipsEl = document.getElementById("ph-map-places");
  var nationEl = document.getElementById("ph-map-nationwide");
  if (!mapEl || !panel) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function slugOf(p) { return String(p.link || "").replace(/^\.\//, ""); }

  // Sort words longest first so "negros oriental" is tested before shorter words.
  var RULES = [];
  Object.keys(PLACES).forEach(function (id) {
    PLACES[id].forEach(function (w) { RULES.push({ id: id, w: w }); });
  });
  RULES.sort(function (a, b) { return b.w.length - a.w.length; });

  function areasFor(post) {
    if (post.mapAreas && post.mapAreas.length) return post.mapAreas.slice();
    var o = OVERRIDES[slugOf(post)];
    if (o) return o.slice();
    var loc = " " + String(post.location || "").toLowerCase() + " ";
    var found = [];
    RULES.forEach(function (r) {
      if (loc.indexOf(r.w) > -1 && found.indexOf(r.id) < 0) found.push(r.id);
    });
    return found;
  }

  // Build: area id -> posts (newest first, as in allPost.js).
  var byArea = {}, nationwide = [];
  (posts || []).forEach(function (post) {
    if (!post || !post.link) return;
    var ids = areasFor(post);
    if (!ids.length) {
      if (post.category !== "News") nationwide.push(post);
      return;
    }
    ids.forEach(function (id) { (byArea[id] = byArea[id] || []).push(post); });
  });

  var AREA_BY_ID = {};
  AREAS.forEach(function (a) { AREA_BY_ID[a.id] = a; });

  function level(n) { return n >= 15 ? 4 : n >= 6 ? 3 : n >= 2 ? 2 : 1; }

  // Draw the map.
  var svgNS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", VIEWBOX);
  svg.setAttribute("class", "phmap__svg");
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", "Map of the Philippines. Shaded provinces have stories.");
  var pathById = {};
  AREAS.forEach(function (a) {
    var path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", a.d);
    var list = byArea[a.id];
    if (list) {
      path.setAttribute("class", "phmap__area phmap__area--has phmap__area--l" + level(list.length));
      path.setAttribute("tabindex", "0");
      path.setAttribute("role", "button");
      path.setAttribute("aria-label", a.name + ", " + list.length + (list.length === 1 ? " story" : " stories"));
      path.addEventListener("click", function () { select(a.id, true); });
      path.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(a.id, true); }
      });
    } else {
      path.setAttribute("class", "phmap__area");
    }
    path.dataset.id = a.id;
    path.addEventListener("mouseenter", function (e) { tip(a, e); });
    path.addEventListener("mousemove", function (e) { tip(a, e); });
    path.addEventListener("mouseleave", hideTip);
    pathById[a.id] = path;
    svg.appendChild(path);
  });
  mapEl.innerHTML = "";
  mapEl.appendChild(svg);

  // Small islands are hard to hit, so give them a ring you can click too.
  ["siquijor", "camiguin", "batanes", "guimaras"].forEach(function (id) {
    var a = AREA_BY_ID[id];
    if (!a || !byArea[id]) return;
    var c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", a.cx); c.setAttribute("cy", a.cy); c.setAttribute("r", 16);
    c.setAttribute("class", "phmap__ring");
    c.dataset.id = id;
    c.addEventListener("click", function () { select(id, true); });
    c.addEventListener("mouseenter", function (e) { tip(a, e); });
    c.addEventListener("mousemove", function (e) { tip(a, e); });
    c.addEventListener("mouseleave", hideTip);
    svg.insertBefore(c, svg.firstChild);
  });

  // Hover label.
  var tipEl = document.createElement("div");
  tipEl.className = "phmap__tip";
  tipEl.hidden = true;
  mapEl.appendChild(tipEl);
  function tip(a, e) {
    var n = (byArea[a.id] || []).length;
    tipEl.innerHTML = "<strong>" + esc(a.name) + "</strong><span>" + (n ? n + (n === 1 ? " story" : " stories") : "No stories yet") + "</span>";
    var box = mapEl.getBoundingClientRect();
    tipEl.style.left = (e.clientX - box.left) + "px";
    tipEl.style.top = (e.clientY - box.top) + "px";
    tipEl.hidden = false;
  }
  function hideTip() { tipEl.hidden = true; }

  // Place chips: the same choices as the map, easier to tap on a phone.
  var placeIds = Object.keys(byArea).filter(function (id) { return AREA_BY_ID[id]; });
  placeIds.sort(function (a, b) { return byArea[b].length - byArea[a].length || AREA_BY_ID[a].name.localeCompare(AREA_BY_ID[b].name); });
  if (chipsEl) {
    chipsEl.innerHTML = placeIds.map(function (id) {
      return '<button type="button" class="phmap__chip" data-id="' + id + '" aria-pressed="false">' + esc(AREA_BY_ID[id].name) +
        ' <span class="phmap__count">' + byArea[id].length + "</span></button>";
    }).join("");
    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".phmap__chip");
      if (b) select(b.dataset.id, true);
    });
  }

  function storyItem(p) {
    var img = p.imagesrc ? '<img src="' + esc(p.imagesrc) + '" alt="" loading="lazy" width="96" height="72">' : "";
    return '<li class="phmap__story"><a href="' + esc(p.link) + '">' + img +
      '<span class="phmap__story-text"><span class="phmap__story-title">' + esc(p.title) + "</span>" +
      '<span class="phmap__story-meta">' + esc([p.location, p.datePublished].filter(Boolean).join(" · ")) + "</span></span></a></li>";
  }

  function intro() {
    var total = placeIds.reduce(function (s, id) { return s + byArea[id].length; }, 0);
    panel.innerHTML = '<p class="phmap__eyebrow">Pick a place</p><h2 class="phmap__place">Where to?</h2>' +
      '<p class="phmap__lead">Click a shaded province on the map, or a place name below it, to see the stories about it. ' +
      "Darker shading means more stories. Right now the map covers " + placeIds.length + " provinces.</p>";
    return total;
  }

  var current = null;
  function select(id, scroll) {
    var a = AREA_BY_ID[id], list = byArea[id];
    if (!a || !list) return;
    if (current && pathById[current]) pathById[current].classList.remove("is-active");
    current = id;
    pathById[id].classList.add("is-active");
    // Bring the chosen shape to the front so its outline is not hidden.
    pathById[id].parentNode.appendChild(pathById[id]);
    if (chipsEl) {
      Array.prototype.forEach.call(chipsEl.querySelectorAll(".phmap__chip"), function (b) {
        b.setAttribute("aria-pressed", b.dataset.id === id ? "true" : "false");
      });
    }
    panel.innerHTML = '<p class="phmap__eyebrow">' + esc(a.region) + "</p>" +
      '<h2 class="phmap__place">' + esc(a.name) + "</h2>" +
      '<p class="phmap__lead">' + list.length + (list.length === 1 ? " story" : " stories") + " about this area</p>" +
      '<ul class="phmap__stories">' + list.map(storyItem).join("") + "</ul>" +
      '<button type="button" class="phmap__clear">Show all places</button>';
    panel.querySelector(".phmap__clear").addEventListener("click", clear);
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* ignore */ }
    if (scroll && window.matchMedia("(max-width: 760px)").matches) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function clear() {
    if (current && pathById[current]) pathById[current].classList.remove("is-active");
    current = null;
    if (chipsEl) Array.prototype.forEach.call(chipsEl.querySelectorAll(".phmap__chip"), function (b) { b.setAttribute("aria-pressed", "false"); });
    intro();
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* ignore */ }
  }

  if (nationEl) {
    nationEl.innerHTML = nationwide.length ? '<ul class="phmap__stories phmap__stories--grid">' + nationwide.map(storyItem).join("") + "</ul>" : "";
  }

  intro();
  var start = (location.hash || "").replace("#", "");
  if (byArea[start]) select(start, false);
})();
