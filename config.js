// Disqus settings shared by app.js (comment counts) and post.js (comment section).
// Put your own shortname from disqus.com (Admin > Settings > General) on the next line.
export const DISQUS_SHORTNAME = "rencalago";

// Base address used so every post has one stable comment thread,
// no matter if it is opened as /post or /post.html
export const SITE_URL = "https://www.rencalago.com";

// Comments are switched on as long as a shortname is filled in.
// (Nothing to edit here.)
export const disqusReady =
  DISQUS_SHORTNAME.trim() !== "" && !DISQUS_SHORTNAME.startsWith("YOUR-");
