// Article pages (and the contact page): shared layout, labels, author/date,
// lazy-loaded images, the share bar and the comment form.
import { newPostTwo } from "./allPost.js";
import * as config from "./config.js";
import { ADSENSE_CLIENT, SQUARE_AD } from "./ad-codes.js";
import { KLOOK_PLACES } from "./klook-codes.js";
import { AGODA_PLACES, AGODA_TEMPLATE, STAY_KEYWORDS } from "./agoda-codes.js";
import { registerLayout, currentSlug, escapeHtml as esc } from "./layout.js";

// Read the settings defensively: an old config.js (without these names) must
// never stop the page from loading. Comments simply stay off until it is updated.
const COMMENTS_ENDPOINT = (config.COMMENTS_ENDPOINT || "").trim();

registerLayout();

const newPost = newPostTwo;

// The file name of this page, e.g. "tops-cebu-look-out" (works with or without .html)
const slug = currentSlug();
const post = newPost.find((item) => item.link.replace("./", "") === slug);

articleEssential();
buildArticleHeader();
cleanOldSidebar();
insertArticleAd();
insertKlookWidget();
insertAgodaWidget();
improveImages();
setUpComments();
setUpShareBar();

// The title, author and date sit in a band right under the menu (above both
// the article and the sidebar). The page's own HTML is not changed: the
// existing title block is simply moved here.
function buildArticleHeader() {
  const title = document.querySelector(".mainPostTwo .title");
  const page = document.querySelector(".full-page");
  if (!title || !page) return;
  const band = document.createElement("div");
  band.className = "article-header";
  const inner = document.createElement("div");
  inner.className = "article-header__inner";
  // The build adds a breadcrumb trail inside the title block; when it is there
  // it replaces the category label, which says "Travel" on every post.
  if (post && !title.querySelector(".breadcrumbs")) {
    inner.insertAdjacentHTML(
      "beforeend",
      `<a class="kicker" href="./#cat=${encodeURIComponent(post.category)}">${esc(post.category)}</a>`
    );
  }
  inner.appendChild(title);
  // Articles get the free-guides sign-up in the empty space beside the title
  // (wide screens only; see .article-header--signup in style.css).
  if (post) {
    inner.classList.add("article-header--signup");
    inner.insertAdjacentHTML("beforeend", headerSignupHtml());
  }
  band.appendChild(inner);
  page.parentNode.insertBefore(band, page);
  if (post) loadGuidesSignup();
}

// Same card as the homepage one under Editor's picks (classes from style.css).
function headerSignupHtml() {
  const cover = (file) =>
    `<img src="./Images/free-guides/${file}-cover-small.jpg" alt="" width="38" height="54" loading="lazy" decoding="async">`;
  return `<section class="guides-promo article-header__signup" aria-labelledby="ah-gp-title">
  <div class="gp-head">
    <div>
      <p class="gp-eyebrow">3 free PDF guides</p>
      <h2 class="gp-title" id="ah-gp-title">Plan your next <em>escape</em></h2>
    </div>
    <a class="gp-covers" href="./free-travel-guides" tabindex="-1" aria-hidden="true">${cover("visayas-food-passport")}${cover("bisaya-phrasebook")}${cover("weekend-escapes-from-cebu")}</a>
  </div>
  <form class="gp-form js-guides-form" data-source="article-header" data-success="ah-gp-done" novalidate>
    <label class="sr-only" for="ah-gp-email">Email address</label>
    <div class="gp-row">
      <input id="ah-gp-email" type="email" name="email" placeholder="Your email" autocomplete="email" required>
      <button type="submit">Get them free</button>
    </div>
    <input type="text" name="website" class="gs-trap" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p class="gs-error" role="alert" hidden></p>
    <p class="gp-fine">By signing up you agree to get the guides and occasional travel tips. <a href="./free-travel-guides#privacy">Privacy</a></p>
  </form>
  <div class="gp-done" id="ah-gp-done" hidden>
    <h3 class="gp-done__title">Your guides are ready</h3>
    <div class="gp-done__links">
      <a data-guide="weekend-escapes" href="./downloads/weekend-escapes-from-cebu.pdf" download>Weekend Escapes</a>
      <a data-guide="bisaya-phrasebook" href="./downloads/bisaya-phrasebook.pdf" download>Phrasebook</a>
      <a data-guide="food-passport" href="./downloads/visayas-food-passport.pdf" download>Food Passport</a>
    </div>
    <p class="gp-fine">A copy of the links is on its way to your inbox.</p>
  </div>
</section>`;
}

// Pages with an in-article guides box already load guides-signup.js (it runs
// after this module and wires up every form). Other articles get it here.
function loadGuidesSignup() {
  if (typeof window.rcBindGuidesForms === "function") return window.rcBindGuidesForms();
  if (document.querySelector('script[src*="guides-signup.js"]')) return;
  const s = document.createElement("script");
  s.src = "./guides-signup.js";
  s.defer = true;
  document.body.appendChild(s);
}

// Older pages have their own "Labels" box under the sidebar; the shared
// sidebar already includes "Browse by label", so remove the old one.
function cleanOldSidebar() {
  document.querySelectorAll(".sidebar > .topheader-container").forEach((box) => box.remove());
}

//author and datePublished (only for pages listed in allPost.js)
function articleEssential() {
  const postingMeta = document.querySelector(".posting-meta");
  if (!postingMeta || !post) return;
  // Keep the comment button the build wrote after the date.
  const commentsLink = postingMeta.querySelector(".meta-comments");
  postingMeta.innerHTML = `<p><span class="author"><i class="fa-solid fa-user" aria-hidden="true"></i> ${esc(
    post.author
  )}</span><span class="postDate"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${esc(
    post.datePublished
  )}</span>${
    post.dateModified
      ? `<span class="postDate"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Updated ${esc(post.dateModified)}</span>`
      : ""
  }</p>`;
  if (commentsLink) postingMeta.querySelector("p").append(commentsLink);
}

// SQUARE AD: only added when SQUARE_AD in ad-codes.js has code in it.
// If it is empty, the article is shown exactly as it was before (no box).
// The ad sits at the top right of the article text, and the text wraps around it.
function insertArticleAd() {
  if (!post) return; // listed articles only (not the contact page)
  const hasCode = (SQUARE_AD || "").trim() !== "";
  if (!hasCode) return; // IF no ad code: regular article layout

  const body = document.querySelector(".full-content");
  if (!body) return;

  const box = document.createElement("aside");
  box.className = "ad-square";
  box.setAttribute("aria-label", "Advertisement");
  box.innerHTML = SQUARE_AD;
  body.insertBefore(box, body.firstChild);

  loadAdSense();
  collapseIfUnfilled(box);
}

// KLOOK WIDGET: one horizontal Klook widget per article, from klook-codes.js.
// 1. A manual spot in the article HTML wins: <div class="klook-here"></div>,
//    optionally with data-place="negros" (a match word) and
//    data-widget="tours" or "activities".
// 2. Otherwise the article's location in allPost.js picks the place (the place
//    named first wins), and the widget goes after the first paragraph that
//    mentions one of its keywords, or at the bottom when nothing matches.
// 3. Nationwide stories (location "Philippines") use their section headings:
//    the first H2/H3 that names a place with codes gets the widget at the end
//    of its section.
function insertKlookWidget() {
  if (!post) return;
  const body = document.querySelector(".full-content");
  if (!body) return;
  const location = String(post.location || "").toLowerCase();

  // 1. Manual spot.
  const spot = body.querySelector(".klook-here");
  if (spot) {
    const wanted = (spot.dataset.place || "").toLowerCase();
    const place = placeIn(wanted || location, { headings: true, usableOnly: true });
    if (!place) return;
    const widgets = usableWidgets(place);
    const kind = (spot.dataset.widget || "").toLowerCase();
    const chosen = widgets.find((w) => kind && w.name.toLowerCase().startsWith(kind)) || widgets[0];
    spot.replaceWith(makeKlookBox(chosen.code));
    return;
  }

  // 2. Place from the article's location.
  const place = placeIn(location, { headings: false, usableOnly: false });
  if (place) {
    const widgets = usableWidgets(place);
    if (!widgets.length) return;
    // Paragraphs of the article itself (not image captions or the ad box).
    // The first two (the intro, beside the AdSense square) are skipped so the
    // two ads never sit together at the top.
    const paragraphs = Array.from(body.children).filter((el) => el.tagName === "P").slice(2);
    const hit = firstKeywordParagraph(paragraphs, widgets);
    const box = makeKlookBox((hit ? hit.widget : widgets[0]).code);
    if (hit) hit.paragraph.after(box);
    else placeAtBottom(body, box);
    return;
  }

  // 3. Nationwide story: look for a section heading that names a place.
  if (keywordAt(location, "philippines") < 0) return;
  for (const heading of Array.from(body.children).filter((el) => /^H[23]$/.test(el.tagName))) {
    const hp = placeIn(heading.textContent.toLowerCase(), { headings: true, usableOnly: true });
    if (!hp) continue;
    const widgets = usableWidgets(hp);
    // The section runs to the next heading of the same or a higher level.
    const level = Number(heading.tagName[1]);
    const section = [];
    for (let el = heading.nextElementSibling; el; el = el.nextElementSibling) {
      if (/^H[1-6]$/.test(el.tagName) && Number(el.tagName[1]) <= level) break;
      section.push(el);
    }
    const paragraphs = section.filter((el) => el.tagName === "P");
    const hit = firstKeywordParagraph(paragraphs, widgets);
    const box = makeKlookBox((hit ? hit.widget : widgets[0]).code);
    const lastP = paragraphs[paragraphs.length - 1];
    (lastP || heading).after(box);
    return;
  }
}

// AGODA WIDGET: one hotel search box per article, from agoda-codes.js.
// A manual <div class="agoda-here"></div> wins (optional data-place="clark").
// Otherwise the article's location picks the place, and the box goes after the
// first paragraph (third on) that mentions a stay keyword, or at the bottom.
function insertAgodaWidget() {
  if (!post) return;
  const body = document.querySelector(".full-content");
  if (!body) return;
  const usable = (AGODA_PLACES || []).filter((pl) => (pl.code || "").trim() !== "");
  const placeFor = (text) => {
    let place = null;
    let placeAt = Infinity;
    for (const pl of usable) {
      for (const m of pl.match || []) {
        const at = keywordAt(text, m);
        if (at >= 0 && at < placeAt) {
          placeAt = at;
          place = pl;
        }
      }
    }
    return place;
  };
  const location = String(post.location || "").toLowerCase();

  // Fallback for articles with no Klook box: the template, searching the
  // article's own place (agodaDestination, else the first part of location).
  const fallbackCode = () => {
    // agodaAlways: true in allPost.js keeps the box even when a Klook box is on the page.
    if (body.querySelector(".klook-widget") && !post.agodaAlways) return "";
    if (!AGODA_TEMPLATE) return "";
    let dest = String(post.agodaDestination || "").trim();
    if (!dest && keywordAt(location, "philippines") < 0) dest = String(post.location || "").split(",")[0].trim();
    if (!dest) return "";
    return AGODA_TEMPLATE.replace("{DESTINATION}", encodeURIComponent(`${dest}, Philippines`));
  };

  const spot = body.querySelector(".agoda-here");
  if (spot) {
    const place = placeFor((spot.dataset.place || "").toLowerCase() || location);
    const code = place ? place.code : fallbackCode();
    if (code) spot.replaceWith(makeAgodaBox(code));
    return;
  }

  const place = placeFor(location);
  const code = place ? place.code : fallbackCode();
  if (!code) return;
  const box = makeAgodaBox(code);
  const paragraphs = Array.from(body.children).filter((el) => el.tagName === "P").slice(2);
  const hit = paragraphs.find((p) => STAY_KEYWORDS.some((k) => keywordAt(p.textContent.toLowerCase(), k) >= 0));
  if (!hit) {
    placeAtBottom(body, box);
    return;
  }
  // Keep the two boxes stacked rather than splitting one around the other.
  let after = hit;
  while (after.nextElementSibling && after.nextElementSibling.classList.contains("klook-widget")) {
    after = after.nextElementSibling;
  }
  after.after(box);
}

function makeAgodaBox(code) {
  const box = document.createElement("aside");
  box.className = "agoda-widget";
  box.setAttribute("aria-label", "Hotels");
  setHtmlWithScripts(box, code);
  fitAgodaWidth(box);
  return box;
}

// The Agoda (Travelpayouts) form sets its bordered box to the full column
// width plus a 1px border each side, so its right edge is cut off. The form
// lives in a shadow root, which outside CSS cannot reach, so a small style is
// added inside it once the widget script has drawn it.
function fitAgodaWidth(box) {
  const css = ".cascoon-widget-resize-container{box-sizing:border-box!important;max-width:100%!important}";
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    const root = box.querySelector("tp-cascoon")?.shadowRoot;
    if (root) {
      const style = document.createElement("style");
      style.textContent = css;
      root.appendChild(style);
      clearInterval(timer);
    } else if (tries > 60) {
      clearInterval(timer);
    }
  }, 250);
}

// The place named first in the text. "headings" also counts each place's
// extra heading words (e.g. "negros"); "usableOnly" skips places with no codes.
function placeIn(text, { headings, usableOnly }) {
  let place = null;
  let placeAt = Infinity;
  for (const pl of KLOOK_PLACES || []) {
    if (usableOnly && !usableWidgets(pl).length) continue;
    const words = (pl.match || []).concat(headings ? pl.headings || [] : []);
    for (const m of words) {
      const at = keywordAt(text, m);
      if (at >= 0 && at < placeAt) {
        placeAt = at;
        place = pl;
      }
    }
  }
  return place;
}

function usableWidgets(place) {
  return (place.widgets || []).filter((w) => (w.code || "").trim() !== "");
}

// The first paragraph that mentions a widget keyword, and which widget.
// Both widgets can match one paragraph: the keyword that comes first wins.
function firstKeywordParagraph(paragraphs, widgets) {
  for (const p of paragraphs) {
    const text = p.textContent.toLowerCase();
    let best = Infinity;
    let widget = null;
    for (const w of widgets) {
      for (const k of w.keywords || []) {
        const at = keywordAt(text, k);
        if (at >= 0 && at < best) {
          best = at;
          widget = w;
        }
      }
    }
    if (widget) return { paragraph: p, widget };
  }
  return null;
}

function makeKlookBox(code) {
  const box = document.createElement("aside");
  box.className = "klook-widget";
  box.setAttribute("aria-label", "Tours and activities");
  setHtmlWithScripts(box, code);
  trimKlookHeight(box);
  return box;
}

// Bottom of the article, above a closing Sources box or photo credit.
function placeAtBottom(body, box) {
  let last = body.lastElementChild;
  while (
    last &&
    (last.tagName === "BLOCKQUOTE" || last.tagName === "BR" ||
      (last.tagName === "P" && /^\s*photo( credit)?\b/i.test(last.textContent)))
  ) {
    last = last.previousElementSibling;
  }
  if (last) last.after(box);
  else body.appendChild(box);
}

// Klook's script gives its widget a fixed 470px height on wide layouts, but
// the three cards in a row only need about 375px, which left a big blank band
// under "Powered by Klook". Trim it once the widget appears. Narrow layouts
// (cards stacked in a list) really do use the full height, so they are left alone.
const KLOOK_WIDE_HEIGHT = "375px";
function trimKlookHeight(box) {
  const fix = () => {
    const frame = box.querySelector("iframe");
    if (!frame || frame.style.height !== "470px") return;
    if ((frame.parentElement.parentElement || box).clientWidth < 655) return;
    frame.style.setProperty("height", KLOOK_WIDE_HEIGHT, "important");
  };
  new MutationObserver(fix).observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
}

// Position of a whole-word match (-1 if none), so "tour" does not match "tourism".
function keywordAt(text, keyword) {
  const k = String(keyword).toLowerCase().trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (k === "") return -1;
  const m = new RegExp(`(^|[^a-z])${k}([^a-z]|$)`).exec(text);
  return m ? m.index : -1;
}

// innerHTML does not run <script> tags, so widget scripts are re-created.
function setHtmlWithScripts(el, html) {
  el.innerHTML = html;
  el.querySelectorAll("script").forEach((old) => {
    const s = document.createElement("script");
    for (const attr of old.attributes) s.setAttribute(attr.name, attr.value);
    s.text = old.text;
    old.replaceWith(s);
  });
}

// AdSense leaves an empty slot when it has no ad to show. Collapse the box in
// that case, so the article text and photos close up the space. If AdSense
// never reports back (for example, an ad blocker), collapse after 10 seconds.
function collapseIfUnfilled(box) {
  const ins = box.querySelector("ins.adsbygoogle");
  if (!ins) return;
  let tries = 0;
  const timer = setInterval(function () {
    tries += 1;
    const status = ins.getAttribute("data-ad-status");
    if (status === "filled") {
      clearInterval(timer);
    } else if (status === "unfilled" || tries > 40) {
      box.classList.add("is-empty");
      clearInterval(timer);
    }
  }, 250);
}

// Loads the AdSense script once and asks it to fill the ad slot(s) on this page.
function loadAdSense() {
  const client = (ADSENSE_CLIENT || "").trim();
  if (!client) {
    console.warn("Ads: add your publisher ID (ADSENSE_CLIENT) in ad-codes.js.");
    return;
  }
  if (!document.querySelector("script[data-adsense-loader]")) {
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    s.dataset.adsenseLoader = "1";
    document.head.appendChild(s);
  }
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.warn("Ads: could not show the ad yet.", e);
  }
}

// Photos in the article: load them lazily and make sure each has alt text.
function improveImages() {
  const heading = document.querySelector(".title h1");
  const fallbackAlt = heading ? heading.textContent.trim() : "";
  document.querySelectorAll(".full-content img").forEach(function (img) {
    img.loading = "lazy";
    img.decoding = "async";
    if (!img.getAttribute("alt")) img.alt = fallbackAlt;
  });
}

// COMMENTS
// The build writes approved comments and the form into the page as plain HTML
// (see _tools/build-site.mjs). This sends the form to the comments Google
// Apps Script and shows older comments on request.
function setUpComments() {
  const section = document.getElementById("comments");
  if (!section) return;

  const olderButton = section.querySelector("[data-comments-older]");
  if (olderButton) {
    olderButton.hidden = false;
    olderButton.addEventListener("click", () => {
      section.querySelectorAll(".comment[hidden]").forEach((li) => (li.hidden = false));
      olderButton.remove();
    });
  }

  // A link to one comment (#comment-abc123) may point at an older, hidden one.
  const target = window.location.hash.startsWith("#comment-") && document.getElementById(window.location.hash.slice(1));
  if (target && target.hidden) {
    section.querySelectorAll(".comment[hidden]").forEach((li) => (li.hidden = false));
    if (olderButton) olderButton.remove();
    target.scrollIntoView();
  }

  const form = section.querySelector(".comment-form");
  if (!form || !COMMENTS_ENDPOINT) return;
  const status = form.querySelector(".comment-form__status");
  const button = form.querySelector(".comment-form__submit");
  const openedAt = Date.now();

  const say = (text, kind) => {
    status.textContent = text;
    status.className = "comment-form__status" + (kind ? " is-" + kind : "");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const comment = form.comment.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    if (comment.length < 2) {
      say("Please write your comment first.", "error");
      form.comment.focus();
      return;
    }
    if (!name) {
      say("Please add your name.", "error");
      form.name.focus();
      return;
    }
    if (email && !form.email.checkValidity()) {
      say("That email doesn't look right. You can also leave it empty.", "error");
      form.email.focus();
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";
    say("");
    const data = {
      post: form.dataset.post,
      name,
      email,
      comment,
      website: form.website.value,
      elapsed: String(Date.now() - openedAt),
      page: window.location.href,
    };
    try {
      // Apps Script does not send CORS headers, so the answer cannot be read;
      // a network failure still throws and is reported below.
      await fetch(COMMENTS_ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
      showPending(name, comment);
      form.reset();
      say("Thanks! Your comment will appear here once it has been approved.", "ok");
    } catch {
      say("Your comment could not be sent. Please check your connection and try again.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "Post Comment";
    }
  });

  // Show the reader their own comment straight away, marked as waiting.
  function showPending(name, comment) {
    let list = section.querySelector(".comments__list");
    if (!list) {
      list = document.createElement("ol");
      list.className = "comments__list";
      const empty = section.querySelector(".comments__empty");
      if (empty) empty.replaceWith(list);
      else section.querySelector(".comments__heading").after(list);
    }
    const li = document.createElement("li");
    li.className = "comment comment--pending";
    const paragraphs = comment
      .split(/\n{2,}/)
      .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
      .join("");
    li.innerHTML = `<p class="comment__head"><span class="comment__avatar" aria-hidden="true">${esc(name.charAt(0).toUpperCase())}</span><span class="comment__name">${esc(name)}</span><span class="comment__badge comment__badge--pending">Awaiting approval</span></p><div class="comment__body">${paragraphs}</div>`;
    list.appendChild(li);
  }
}

// The share bar the build writes under each article: the links work on their
// own; this adds "copy link" and, on phones, the system share sheet.
function setUpShareBar() {
  const bar = document.querySelector(".share-bar");
  if (!bar) return;
  const field = bar.querySelector(".share-bar__url");
  if (field) field.addEventListener("focus", () => field.select());

  const copy = bar.querySelector("[data-share-copy]");
  if (copy) {
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      const url = copy.dataset.shareCopy;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        if (!field) return;
        field.select();
        document.execCommand("copy");
      }
      copy.classList.add("is-copied");
      copy.setAttribute("title", "Link copied");
      copy.setAttribute("aria-label", "Link copied");
      setTimeout(() => {
        copy.classList.remove("is-copied");
        copy.setAttribute("title", "Copy link");
        copy.setAttribute("aria-label", "Copy link");
      }, 2000);
    });
  }

  const native = bar.querySelector("[data-share-native]");
  if (native && navigator.share && window.matchMedia("(pointer: coarse)").matches) {
    native.hidden = false;
    native.addEventListener("click", () => {
      navigator
        .share({ title: post ? post.title : document.title, url: copy ? copy.dataset.shareCopy : location.href })
        .catch(() => {});
    });
  }

  // The comment button only makes sense when the comment box is on the page.
  const toComments = bar.querySelector(".share-bar__btn--comment");
  if (toComments && !document.getElementById("comments")) toComments.hidden = true;
}
