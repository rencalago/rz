#!/usr/bin/env node
// Downloads the approved comments from the comments Google Apps Script and
// saves them to _data/comments.json, which build-site.mjs writes into the
// article pages. Run by .github/workflows/publish-comments.yml every few
// hours; you can also run it yourself:
//
//   node _tools/fetch-comments.mjs && node _tools/build-site.mjs
//
// Prints "changed" or "unchanged" so the workflow knows whether to commit.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COMMENTS_ENDPOINT } from "../config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "_data", "comments.json");

const endpoint = String(COMMENTS_ENDPOINT || "").trim();
if (!endpoint) {
  console.log("unchanged (COMMENTS_ENDPOINT in config.js is empty)");
  process.exit(0);
}

const res = await fetch(endpoint, { redirect: "follow" });
if (!res.ok) throw new Error(`Comments feed answered ${res.status}`);
const data = await res.json();
if (!data || !Array.isArray(data.comments)) throw new Error("Comments feed did not return a comments list");

const str = (v, max) => String(v == null ? "" : v).slice(0, max);
const comments = data.comments
  .filter((c) => c && /^[a-z0-9-]{1,120}$/.test(String(c.post)) && /^[a-z0-9]{4,40}$/.test(String(c.id)) && String(c.comment).trim())
  .map((c) => ({
    id: str(c.id, 40),
    post: str(c.post, 120),
    name: str(c.name, 60).trim() || "Reader",
    date: str(c.date, 40),
    comment: str(c.comment, 2000).trim(),
    reply: str(c.reply, 4000).trim(),
  }))
  .sort((a, b) => (a.post === b.post ? a.date.localeCompare(b.date) || a.id.localeCompare(b.id) : a.post.localeCompare(b.post)));

const next = JSON.stringify({ comments }, null, 2) + "\n";
const before = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
if (next === before) {
  console.log(`unchanged (${comments.length} approved comments)`);
} else {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, next);
  console.log(`changed (${comments.length} approved comments)`);
}
