// Runs the site's OWN app.js and layout.js inside Node, with a tiny fake
// browser, and hands back the HTML they produce.
//
// Why: the build script has to write exactly what the browser would draw. If it
// kept its own copy of those templates, the two copies would drift apart the
// first time you edit the menu, the footer or a story card. Running the real
// files means there is only ever one version.
//
// Used by build-site.mjs. You normally never need to open this file.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// A very small stand-in for a DOM element. It only needs to survive the code in
// app.js and layout.js; it does not try to be a real browser.
class FakeElement {
  constructor() {
    this.innerHTML = "";
    this.textContent = "";
    this.hidden = false;
    this.value = "";
    this.dataset = {};
    this.style = {};
    this.classList = { add() {}, remove() {}, toggle: () => false, contains: () => false };
    this._bySelectorCache = {};
  }
  addEventListener() {}
  removeEventListener() {}
  setAttribute() {}
  removeAttribute() {}
  getAttribute() {
    return null;
  }
  focus() {}
  scrollIntoView() {}
  closest() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
  // Same selector always returns the same element, so code that fills a child
  // (such as the label chips in the sidebar) can be read back afterwards.
  querySelector(selector) {
    return (this._bySelectorCache[selector] ||= new FakeElement());
  }
}

// Written as "&amp;" so the generated HTML is valid ("...?id=1&sz=w700" in a
// src attribute becomes "...?id=1&amp;sz=w700"; the browser reads both the same).
const fixAmpersands = (html) =>
  html.replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#[0-9]+|#x[0-9a-fA-F]+);)/g, "&amp;");

export async function loadSite(root) {
  // Copy the three browser modules to a temp folder as .mjs so Node treats them
  // as ES modules on any version, then point their imports at the copies.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rencalago-build-"));
  for (const name of ["allPost", "layout", "app", "regions"]) {
    const source = fs.readFileSync(path.join(root, name + ".js"), "utf8");
    const rewritten = source.replace(/(from\s+["'])\.\/(allPost|layout|regions)\.js(["'])/g, "$1./$2.mjs$3");
    fs.writeFileSync(path.join(tmp, name + ".mjs"), rewritten);
  }

  // The fake browser ---------------------------------------------------------
  const elementsById = {};
  const location = { pathname: "/", hash: "", search: "" };
  const registry = {};
  globalThis.HTMLElement = FakeElement;
  globalThis.customElements = { get: (name) => registry[name], define: (name, cls) => (registry[name] = cls) };
  globalThis.location = location;
  globalThis.history = { replaceState() {} };
  globalThis.HashChangeEvent = class {};
  globalThis.window = {
    location,
    addEventListener() {},
    dispatchEvent() {},
  };
  globalThis.document = {
    getElementById: (id) => (elementsById[id] ||= new FakeElement()),
    addEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => new FakeElement(),
  };

  // Importing app.js runs it: it draws the homepage sections into the fake
  // elements above and registers my-header, my-sidebar and my-footer.
  let app;
  try {
    app = await import(pathToFileURL(path.join(tmp, "app.mjs")).href);
  } catch (error) {
    throw new Error(
      "Could not run app.js in Node (it probably uses a browser feature the build does not fake yet).\n" +
        "Original error: " + (error && error.message ? error.message : error)
    );
  }
  const allPost = await import(pathToFileURL(path.join(tmp, "allPost.mjs")).href);
  const layout = await import(pathToFileURL(path.join(tmp, "layout.mjs")).href);

  const home = {
    hero: fixAmpersands(elementsById["hero"].innerHTML),
    picks: fixAmpersands(elementsById["picks"].innerHTML),
    dest: fixAmpersands(elementsById["dest-grid"].innerHTML),
    feed: fixAmpersands(elementsById["feed-list"].innerHTML),
  };

  // Draws my-header, my-sidebar and my-footer for one page, exactly as the
  // browser would. The page's own address matters: the sidebar leaves out the
  // article you are already reading.
  function layoutFor(slug) {
    location.pathname = "/" + slug;
    const out = {};
    for (const [tag, key] of [["my-header", "header"], ["my-sidebar", "sidebar"], ["my-footer", "footer"]]) {
      const Component = registry[tag];
      if (!Component) throw new Error(`layout.js did not register <${tag}>`);
      const element = new Component();
      element.connectedCallback();
      let html = element.innerHTML;
      // The sidebar fills its "Browse by label" box after drawing itself.
      const chips = element._bySelectorCache[".labels-container"];
      if (chips && chips.innerHTML) {
        html = html.replace('<div class="labels-container"></div>', `<div class="labels-container">${chips.innerHTML}</div>`);
      }
      out[key] = fixAmpersands(html);
    }
    return out;
  }

  return {
    posts: allPost.newPostTwo,
    destinations: app.DESTINATIONS,
    // The same rule the homepage filter uses to decide which stories belong to a destination.
    matchesFilter: app.matchesFilter,
    home,
    layoutFor,
    // The story card used on the homepage feed (exported by layout.js).
    storyCard: (post) => fixAmpersands(layout.storyCard(post)),
    cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }),
  };
}
