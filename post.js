// Article pages (and the contact page): shared layout, labels, author/date,
// lazy-loaded images, the share bar and the comment form.
import { newPostTwo } from "./allPost.js";
import * as config from "./config.js";
import { ADSENSE_CLIENT, SQUARE_AD } from "./ad-codes.js";
import { KLOOK_WIDGETS } from "./klook-codes.js";
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
// The article's destination is the middle link of its breadcrumb (written by
// the build). The widget goes after the first paragraph that mentions one of
// its keywords; with no match, the first widget with a code goes at the bottom.
function insertKlookWidget() {
  if (!post) return;
  const body = document.querySelector(".full-content");
  const hubLink = document.querySelector(".breadcrumbs li:nth-child(2) a");
  if (!body || !hubLink) return; // no destination page: no widget
  const hub = (hubLink.getAttribute("href") || "").replace("./", "").replace(/\.html$/, "");
  const widgets = (KLOOK_WIDGETS[hub] || []).filter((w) => (w.code || "").trim() !== "");
  if (!widgets.length) return;

  // Paragraphs of the article itself (not image captions or the ad box).
  // The first two (the intro, beside the AdSense square) are skipped so the
  // two ads never sit together at the top.
  const paragraphs = Array.from(body.children).filter((el) => el.tagName === "P").slice(2);
  let chosen = null;
  let after = null;
  for (const p of paragraphs) {
    const text = p.textContent.toLowerCase();
    // Both widgets can match one paragraph: the keyword that comes first wins.
    let best = Infinity;
    for (const w of widgets) {
      for (const k of w.keywords || []) {
        const at = keywordAt(text, k);
        if (at >= 0 && at < best) {
          best = at;
          chosen = w;
        }
      }
    }
    if (chosen) {
      after = p;
      break;
    }
  }

  const box = document.createElement("aside");
  box.className = "klook-widget";
  box.setAttribute("aria-label", "Tours and activities");
  setHtmlWithScripts(box, (chosen || widgets[0]).code);

  if (after) {
    after.after(box);
  } else {
    // Bottom of the article, above a closing Sources box or photo credit.
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
