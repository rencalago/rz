// Article pages (and the contact page): shared layout, labels, author/date,
// lazy-loaded images and the Cusdis comment box.
import { newPostTwo } from "./allPost.js";
import * as config from "./config.js";
import { registerLayout, currentSlug, escapeHtml as esc } from "./layout.js";

// Read the settings defensively: an old config.js (without these names) must
// never stop the page from loading. Comments simply stay off until it is updated.
const SITE_URL = config.SITE_URL || "https://www.rencalago.com";
const CUSDIS_APP_ID = (config.CUSDIS_APP_ID || "").trim();
const cusdisReady = CUSDIS_APP_ID !== "";

registerLayout();

const newPost = newPostTwo;

// The file name of this page, e.g. "tops-cebu-look-out" (works with or without .html)
const slug = currentSlug();
const post = newPost.find((item) => item.link.replace("./", "") === slug);

articleEssential();
buildArticleHeader();
cleanOldSidebar();
improveImages();
loadComments();

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
  if (post) {
    inner.insertAdjacentHTML(
      "beforeend",
      `<a class="kicker" href="./#cat=${encodeURIComponent(post.category)}">${esc(post.category)}</a>`
    );
  }
  inner.appendChild(title);
  band.appendChild(inner);
  page.parentNode.insertBefore(band, page);
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
  postingMeta.innerHTML = `<p><span class="author"><i class="fa-solid fa-user" aria-hidden="true"></i> ${esc(
    post.author
  )}</span><span class="postDate"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${esc(
    post.datePublished
  )}</span></p>`;
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

//CUSDIS COMMENTS
// Pages not listed in allPost.js (contact, 404, leftover copies) get no comments.
function loadComments() {
  const container = document.querySelector(".post-container");
  if (!post || !container) return;
  if (!cusdisReady) {
    console.warn("Comments: set CUSDIS_APP_ID in config.js to enable comments.");
    return;
  }

  // Every post gets one stable address, so its comments never get split
  // between /post and /post.html
  const postUrl = `${SITE_URL}/${slug}`;

  const section = document.createElement("section");
  section.id = "comments";
  section.className = "comments-section";
  section.innerHTML = `<h2 class="comments-heading">Comments</h2>
    <div id="cusdis_thread"
      data-host="https://cusdis.com"
      data-app-id="${esc(CUSDIS_APP_ID)}"
      data-page-id="post-${post.postNumber}"
      data-page-url="${postUrl}"
      data-page-title="${esc(post.title)}"
      data-theme="light"></div>
    <noscript>Please enable JavaScript to view the comments.</noscript>`;
  container.appendChild(section);

  // If the visitor arrived through a link ending in #comments, the section did
  // not exist yet when the browser tried to jump to it.
  if (window.location.hash === "#comments") {
    section.scrollIntoView();
    window.addEventListener("load", function () {
      section.scrollIntoView();
    });
  }

  function showBlockedNotice() {
    if (section.querySelector(".comments-notice")) return;
    const note = document.createElement("p");
    note.className = "comments-notice";
    note.textContent =
      "The comment box could not load. If you use an ad blocker or strict tracking protection, try turning it off for this site, or open this page in another browser.";
    section.appendChild(note);
  }

  // The Cusdis script loads in the background (async), so it does not slow the article down.
  console.info("Comments: loading Cusdis comment box for", postUrl);
  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = "https://cusdis.com/js/cusdis.es.js";
  script.onerror = showBlockedNotice;
  document.body.appendChild(script);

  // If nothing has been drawn after a few seconds, tell the reader why.
  setTimeout(function () {
    if (!section.querySelector("iframe")) showBlockedNotice();
  }, 8000);
}
