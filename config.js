// Comment settings shared by app.js and post.js.

// Base address used so every post has one stable comment thread,
// no matter if it is opened as /post or /post.html
export const SITE_URL = "https://www.rencalago.com";

// OPTIONAL: your Facebook App ID. Comments work without it, but you need one
// to moderate/reply from Facebook's tools (developers.facebook.com > My Apps).
// Leave as "" if you don't have one yet.
export const FB_APP_ID = "";

// Facebook SDK version. Facebook retires old versions every couple of years
// and upgrades plugins automatically, so this rarely needs changing.
export const FB_SDK_VERSION = "v21.0";
