// Third-party scripts (AdSense, the Agoda and Klook widgets) load after the page
// has drawn, so the story, its photo and the menu appear first. Used by
// layout.js, app.js and post.js. Every function does nothing outside a browser,
// because the build also runs layout.js and app.js (in Node).

const inBrowser = typeof window !== "undefined" && typeof document !== "undefined" && typeof document.createElement === "function" && "IntersectionObserver" in window;

// Runs fn once: on the reader's first scroll, tap, click or key press, or a few
// seconds after the page has finished loading, whichever comes first.
const DELAY_AFTER_LOAD = 4000;
const pending = [];
let fired = false;
let armed = false;

function fire() {
  if (fired) return;
  fired = true;
  for (const evt of ["scroll", "pointerdown", "keydown", "touchstart"]) window.removeEventListener(evt, fire, { passive: true });
  pending.splice(0).forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn(e);
    }
  });
}

export function afterFirstInteraction(fn) {
  if (!inBrowser) return;
  if (fired) return void fn();
  pending.push(fn);
  if (armed) return;
  armed = true;
  for (const evt of ["scroll", "pointerdown", "keydown", "touchstart"]) window.addEventListener(evt, fire, { passive: true });
  const startTimer = () => setTimeout(fire, DELAY_AFTER_LOAD);
  if (document.readyState === "complete") startTimer();
  else window.addEventListener("load", startTimer, { once: true });
}

// Runs fn once the element is within about a screen of the viewport. The check
// waits a frame, so the element may be created and placed on the page first.
export function whenNear(el, fn, margin = "800px") {
  if (!inBrowser || !el) return;
  requestAnimationFrame(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          fn();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
  });
}

// Adds the AdSense script once. Ad slots already pushed to window.adsbygoogle
// are filled as soon as it arrives; Auto ads start then too.
export function loadAdSenseScript(client) {
  if (!inBrowser || !client) return;
  if (document.querySelector('script[data-adsense-loader], script[src*="adsbygoogle.js"]')) return;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  s.dataset.adsenseLoader = "1";
  document.head.appendChild(s);
}

// Ad and widget frames arrive without a title, which screen readers announce
// as an unnamed frame. Give each one a short name as it appears.
export function nameFrames() {
  if (!inBrowser || window.__rcFramesNamed) return;
  window.__rcFramesNamed = true;
  const label = (src) => {
    if (/agoda|tpemb|travelpayouts/i.test(src)) return "Hotel deals";
    if (/klook/i.test(src)) return "Tours and activities";
    if (/google|doubleclick|adtrafficquality/i.test(src)) return "Advertisement";
    return "Embedded content";
  };
  const fix = (root) => {
    root.querySelectorAll("iframe:not([title])").forEach((f) => f.setAttribute("title", label(f.src || "")));
  };
  new MutationObserver((records) => {
    for (const r of records) {
      for (const node of r.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.tagName === "IFRAME") fix(node.parentNode || document);
        else if (node.querySelector) fix(node);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
  fix(document);
}
