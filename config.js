// Comment settings shared by post.js and the build tools.

// Base address used so every post has one stable address,
// no matter if it is opened as /post or /post.html
export const SITE_URL = "https://www.rencalago.com";

// Paste the Web app URL of the comments Google Apps Script between the quotes
// (set-up steps at the top of _tools/comments.gs). It ends in /exec.
// While it is empty, articles have no comment form. After pasting it, run
// node _tools/build-site.mjs so every article gets the form.
export const COMMENTS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzmiAcjgjZaDr4qxkhY4CTPiLH-Q2MB_TIxlfA_TyWRFxcMY5U29qxTy5ixcjyOb2tTeQ/exec";

export const commentsReady = COMMENTS_ENDPOINT.trim() !== "";
