/**
 * One-off codemod: replaces bare `console.log` / `console.error` calls with the
 * shared `logger`, which suppresses info-level output outside development.
 *
 * Kept in the repo as a record of the change. Files where a raw console call is
 * intentional (the logger's own implementation, tests) are skipped.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SKIP = new Set(["src/lib/utils.ts"]);
const files = [];

(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      files.push(path);
    }
  }
})("src");

let changed = 0;
let removed = 0;

for (const file of files) {
  const rel = relative(process.cwd(), file);
  if (SKIP.has(rel)) continue;

  let source = readFileSync(file, "utf8");
  const original = source;

  // Drop debug logs that only echo a value, keeping error reporting.
  source = source.replace(
    /^[ \t]*console\.log\([^;]*?\);[ \t]*\r?\n/gms,
    () => {
      removed++;
      return "";
    },
  );

  // Route error reporting through the logger.
  source = source.replace(
    /console\.error\((\s*)"([^"]*)"\s*,\s*([^)]+)\)/g,
    (_match, _ws, message, context) =>
      `logger("error", "${message.replace(/[:,]\s*$/, "")}", { error: ${context.trim()} })`,
  );
  source = source.replace(
    /console\.error\((\s*)"([^"]*)"\s*\)/g,
    (_match, _ws, message) => `logger("error", "${message}")`,
  );

  if (source !== original) {
    // Make sure the logger is imported where it is now used.
    if (
      /\blogger\(/.test(source) &&
      !/import\s*\{[^}]*\blogger\b[^}]*\}\s*from\s*"@\/lib\/utils"/.test(source)
    ) {
      const lines = source.split("\n");
      const lastImport = lines.reduce(
        (last, line, index) => (line.startsWith("import ") ? index : last),
        -1,
      );
      if (lastImport >= 0) {
        lines.splice(lastImport + 1, 0, 'import { logger } from "@/lib/utils";');
        source = lines.join("\n");
      }
    }
    writeFileSync(file, source);
    changed++;
  }
}

console.log(`Rewrote ${changed} files; removed ${removed} debug log calls.`);
