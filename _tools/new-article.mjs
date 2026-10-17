// Make a new article page from _tools/article-template.html.
//   node _tools/new-article.mjs <slug> <meta.json> <body.html>
// meta.json: { "title": "...", "description": "...", "keywords": "...", "postNumber": 73 }
// body.html: only the article body (paragraphs, <br>, h2/h3). Writes <slug>.html in the repo root.
// Then add the entry to allPost.js and run: node _tools/build-site.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [slug, metaFile, bodyFile] = process.argv.slice(2);
if (!slug || !metaFile || !bodyFile) {
  console.error("Usage: node _tools/new-article.mjs <slug> <meta.json> <body.html>");
  process.exit(1);
}
const out = path.join(root, slug + ".html");
if (fs.existsSync(out)) { console.error(slug + ".html already exists"); process.exit(1); }
const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
for (const k of ["title", "description", "keywords", "postNumber"]) {
  if (!meta[k]) { console.error("meta.json missing " + k); process.exit(1); }
}
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
let html = fs.readFileSync(path.join(root, "_tools", "article-template.html"), "utf8");
const body = fs.readFileSync(bodyFile, "utf8").trim();
html = html
  .replaceAll("{{TITLE}}", esc(meta.title))
  .replace("{{DESC}}", esc(meta.description))
  .replace("{{KEYWORDS}}", esc(meta.keywords))
  .replace("{{POSTNUM}}", String(meta.postNumber))
  .replace("{{BODY}}", () => body);
fs.writeFileSync(out, html);
console.log("wrote " + slug + ".html");
