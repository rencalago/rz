// Disqus settings shared by app.js (comment counts) and post.js (comment section).
// Replace the value below with your own shortname from disqus.com (Admin > Settings > General).
export const DISQUS_SHORTNAME = "YOUR-DISQUS-SHORTNAME";

// Base address used so every post has one stable comment thread,
// no matter if it is opened as /post or /post.html
export const SITE_URL = "https://www.rencalago.com";

export const disqusReady = DISQUS_SHORTNAME !== "YOUR-DISQUS-SHORTNAME";
