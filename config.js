// Comment settings shared by app.js and post.js.

// Base address used so every post has one stable comment thread,
// no matter if it is opened as /post or /post.html
export const SITE_URL = "https://www.rencalago.com";

// Paste your Cusdis App ID between the quotes (see the steps in the chat).
// It looks like a long string of letters, numbers and dashes.
// Leave it empty ("") and no comment box is shown.
export const CUSDIS_APP_ID = "";

export const cusdisReady = CUSDIS_APP_ID.trim() !== "";
