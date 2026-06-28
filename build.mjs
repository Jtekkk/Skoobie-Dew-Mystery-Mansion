/* Build a single self-contained index.html from the modular sources in src/.
   Inlines local <link rel="stylesheet"> and <script src> so the game runs from
   one file anywhere — double-clicked, served, or dropped in a preview pane.
   External (https) refs (e.g. Google Fonts) are left untouched.

   Usage:  node build.mjs   →  writes ./index.html
*/
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");
const isLocal = (p) => p && !/^https?:\/\//i.test(p);

let html = readFileSync(join(src, "index.html"), "utf8");

// Inline local stylesheets.
html = html.replace(/[ \t]*<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, (tag) => {
  const m = tag.match(/href=["']([^"']+)["']/i);
  if (!m || !isLocal(m[1])) return tag; // keep font CDN links
  const css = readFileSync(join(src, m[1]), "utf8");
  return `<style>\n${css}\n</style>`;
});

// Inline local scripts.
html = html.replace(/[ \t]*<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, (tag, srcPath) => {
  if (!isLocal(srcPath)) return tag;
  const js = readFileSync(join(src, srcPath), "utf8");
  return `<script>\n${js}\n</script>`;
});

writeFileSync(join(root, "index.html"), html);
const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
console.log(`Built self-contained index.html (${kb} KB)`);
