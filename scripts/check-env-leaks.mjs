#!/usr/bin/env node
/**
 * Guards against server-only env vars reaching the browser.
 *
 * Next.js inlines the *value* of any `NEXT_PUBLIC_*` variable into the client
 * bundle at build time, but only where it is referenced from code that ships to
 * the browser. Several secrets in this project carry the `NEXT_PUBLIC_` prefix
 * (see .env.example), so a single import from a client component would publish
 * the database URL or the SMTP password to every visitor.
 *
 * This script walks the module graph that actually reaches the browser — every
 * `"use client"` file plus everything it imports, transitively — and fails if a
 * server-only variable is read anywhere inside it.
 *
 * Modules marked `"use server"` are boundaries: their code stays on the server
 * and only a reference is sent to the client, so traversal stops there.
 *
 * Run with `node scripts/check-env-leaks.mjs` (no dependencies, no build step).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const ENV_EXAMPLE = join(ROOT, ".env.example");

/**
 * Secrets. These must never be read from client-reachable code, regardless of
 * their `NEXT_PUBLIC_` prefix.
 */
const SERVER_ONLY = new Set([
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  // Deprecated NEXT_PUBLIC_-prefixed spellings, still read as a fallback in
  // src/env.ts so existing deployments keep working. Listed here so they are
  // treated as secrets for as long as they are supported.
  "NEXT_PUBLIC_DATABASE_URL",
  "NEXT_PUBLIC_CLERK_WEBHOOK_SECRET",
  "NEXT_PUBLIC_EMAIL_USR",
  "NEXT_PUBLIC_EMAIL_PWD",
]);

/**
 * Safe to inline into the browser bundle: public identifiers and URLs.
 */
const CLIENT_SAFE = new Set([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_FRONTEND_URL",
  "NEXT_PUBLIC_APP_URL",
]);

/**
 * Provided by the runtime rather than by .env.example.
 */
const BUILTIN = new Set([
  "NODE_ENV",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_URL",
  "ANALYZE",
]);

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];

const errors = [];
const addError = (file, line, message) =>
  errors.push({ file: relative(ROOT, file), line, message });

// --- file helpers ------------------------------------------------------------

function listSourceFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      found.push(...listSourceFiles(path));
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      found.push(path);
    }
  }
  return found;
}

const fileCache = new Map();
function read(file) {
  if (!fileCache.has(file)) fileCache.set(file, readFileSync(file, "utf8"));
  return fileCache.get(file);
}

/** A directive only counts when it precedes every statement in the file. */
function directiveOf(file) {
  for (const raw of read(file).split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("//") || line.startsWith("/*") || line.startsWith("*")) {
      continue;
    }
    const match = line.match(/^["'](use (?:client|server))["'];?$/);
    return match ? match[1] : null;
  }
  return null;
}

/** Comments are skipped so a commented-out reference is not reported. */
function isComment(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")
  );
}

// --- module graph ------------------------------------------------------------

const IMPORT_PATTERNS = [
  /(?:^|\n)\s*import\s[^;]*?from\s*["']([^"']+)["']/g,
  /(?:^|\n)\s*import\s*["']([^"']+)["']/g,
  /(?:^|\n)\s*export\s[^;]*?from\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
];

function importsOf(file) {
  const source = read(file);
  const specifiers = new Set();
  for (const pattern of IMPORT_PATTERNS) {
    for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
  }
  return [...specifiers];
}

/** Resolves relative and `@/*` specifiers to a file on disk; ignores packages. */
function resolveImport(specifier, fromFile) {
  let base;
  if (specifier.startsWith("@/")) {
    base = join(SRC, specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    base = resolve(dirname(fromFile), specifier);
  } else {
    return null;
  }

  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((ext) => base + ext),
    ...SOURCE_EXTENSIONS.map((ext) => join(base, "index" + ext)),
  ];
  for (const candidate of candidates) {
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      // Not on disk — try the next candidate.
    }
  }
  return null;
}

/**
 * Every module the browser receives, mapped to the import chain that pulls it
 * in, so a failure can name the client component responsible.
 */
function collectClientReachable(files) {
  const chains = new Map();
  const queue = [];

  for (const file of files) {
    if (directiveOf(file) === "use client") {
      chains.set(file, [file]);
      queue.push(file);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift();
    for (const specifier of importsOf(current)) {
      const target = resolveImport(specifier, current);
      if (!target || chains.has(target)) continue;
      // Server actions stay on the server; the client only gets a reference.
      if (directiveOf(target) === "use server") continue;

      chains.set(target, [...chains.get(current), target]);
      queue.push(target);
    }
  }
  return chains;
}

// --- checks ------------------------------------------------------------------

function envReferences(file) {
  const references = [];
  read(file)
    .split("\n")
    .forEach((line, index) => {
      if (isComment(line)) return;
      for (const match of line.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
        references.push({ name: match[1], line: index + 1 });
      }
    });
  return references;
}

function documentedVars() {
  let contents;
  try {
    contents = readFileSync(ENV_EXAMPLE, "utf8");
  } catch {
    errors.push({
      file: ".env.example",
      line: 0,
      message: "missing — contributors have no reference for required env vars",
    });
    return new Set();
  }

  const names = new Set();
  for (const raw of contents.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Z0-9_]+)\s*=/);
    if (match) names.add(match[1]);
  }
  return names;
}

function describeChain(chain) {
  return chain.map((file) => relative(ROOT, file)).join("\n           imports → ");
}

function main() {
  const files = listSourceFiles(SRC);
  const documented = documentedVars();
  const clientReachable = collectClientReachable(files);

  // 1. Every documented variable must be classified above, so that adding one
  //    to .env.example forces a decision about whether it may reach the client.
  for (const name of documented) {
    if (!SERVER_ONLY.has(name) && !CLIENT_SAFE.has(name)) {
      addError(
        ".env.example",
        0,
        `${name} is not classified in scripts/check-env-leaks.mjs — add it to ` +
          `SERVER_ONLY (a secret) or CLIENT_SAFE (safe to ship to the browser)`,
      );
    }
  }

  for (const file of files) {
    const chain = clientReachable.get(file);

    for (const { name, line } of envReferences(file)) {
      // 2. Every variable the code reads must be documented for contributors.
      if (!documented.has(name) && !BUILTIN.has(name)) {
        addError(file, line, `${name} is read here but not documented in .env.example`);
        continue;
      }
      if (!chain) continue;

      // 3. The leak itself: a secret read from code that ships to the browser.
      if (SERVER_ONLY.has(name)) {
        addError(
          file,
          line,
          `${name} is server-only but reaches the browser bundle via:\n           ` +
            describeChain(chain),
        );
        continue;
      }

      // 4. Without the NEXT_PUBLIC_ prefix the value is undefined in the
      //    browser, so this is a bug even when nothing leaks.
      if (!name.startsWith("NEXT_PUBLIC_") && !BUILTIN.has(name)) {
        addError(
          file,
          line,
          `${name} has no NEXT_PUBLIC_ prefix and is undefined in the browser, ` +
            `where this code runs`,
        );
      }
    }
  }

  const clientCount = clientReachable.size;
  if (errors.length === 0) {
    console.log(
      `✓ no env leaks — checked ${files.length} files ` +
        `(${clientCount} reach the browser)`,
    );
    return 0;
  }

  console.error(`✗ ${errors.length} env problem(s) found:\n`);
  for (const { file, line, message } of errors) {
    console.error(`  ${file}${line ? `:${line}` : ""}\n    ${message}\n`);
  }
  console.error(
    "Move server-only reads into a Server Component, a Route Handler, or a\n" +
      '"use server" module, and pass only the resulting data to the client.',
  );
  return 1;
}

process.exit(main());
