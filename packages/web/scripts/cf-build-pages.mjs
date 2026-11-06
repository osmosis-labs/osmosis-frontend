/**
 * OpenNext build for the pages Worker, without `pages/api` or `middleware.ts`.
 *
 * Vercel runs `next build` with those files in place. This script only wraps
 * `cf:build`: it moves them aside, builds, and moves them back, including when
 * the build is interrupted. A failed restore exits non-zero and names the paths.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const webRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const asideDir = path.join(webRoot, ".cf-pages-aside");

/** Source path and where it sits during the build. */
const moves = [
  {
    from: path.join(webRoot, "pages/api"),
    to: path.join(asideDir, "api"),
  },
  {
    from: path.join(webRoot, "middleware.ts"),
    to: path.join(asideDir, "middleware.ts"),
  },
];

let child;
let receivedSignal;

/**
 * The package `exports` map hides `package.json`, so resolve the main entry and
 * walk up to the package root that owns the CLI bin.
 */
function opennextBin() {
  let dir = path.dirname(require.resolve("@opennextjs/cloudflare"));
  while (true) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (pkg.name === "@opennextjs/cloudflare") {
        const bin = pkg.bin?.["opennextjs-cloudflare"];
        if (!bin) throw new Error("opennextjs-cloudflare bin is missing");
        return path.join(dir, bin);
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("could not find @opennextjs/cloudflare");
    }
    dir = parent;
  }
}

function assertReadyToMove() {
  if (fs.existsSync(asideDir)) {
    throw new Error(
      `${asideDir} already exists. A previous cf:build did not restore; move it back before retrying.`
    );
  }
  for (const { from } of moves) {
    if (!fs.existsSync(from)) {
      throw new Error(`refusing to build: ${from} is not there to set aside`);
    }
  }
}

function moveAside() {
  fs.mkdirSync(asideDir, { recursive: false });
  for (const { from, to } of moves) fs.renameSync(from, to);
}

/**
 * Next reuses `.next` across builds. Leaving it would keep the API routes that
 * were compiled before this script moved them.
 */
function clearNextOutput() {
  fs.rmSync(path.join(webRoot, ".next"), { recursive: true, force: true });
  fs.rmSync(path.join(webRoot, ".open-next"), { recursive: true, force: true });
}

function restoreOne(from, to) {
  const hasFrom = fs.existsSync(from);
  const hasTo = fs.existsSync(to);
  if (hasFrom && hasTo) return `${from} and ${to} both exist`;
  if (!hasTo) return hasFrom ? undefined : `missing ${from} and ${to}`;
  fs.mkdirSync(path.dirname(from), { recursive: true });
  fs.renameSync(to, from);
  return undefined;
}

function restore() {
  const failures = [];
  for (const { from, to } of moves) {
    try {
      const failure = restoreOne(from, to);
      if (failure) failures.push(failure);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (fs.existsSync(asideDir)) {
    const left = fs.readdirSync(asideDir);
    if (left.length === 0) fs.rmdirSync(asideDir);
    else failures.push(`${asideDir} still holds ${left.join(", ")}`);
  }
  if (failures.length === 0) return;
  console.error("FAILED TO RESTORE pages/api and middleware.ts:");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Aside directory: ${asideDir}`);
  process.exitCode = 1;
  throw new Error("restore failed");
}

function runBuild() {
  return new Promise((resolve) => {
    child = spawn(
      process.execPath,
      [opennextBin(), "build", "--dangerouslyUseUnsupportedNextVersion"],
      { cwd: webRoot, stdio: "inherit", env: process.env }
    );
    child.on("exit", (code, signal) => {
      resolve({ code: code ?? 1, signal });
    });
  });
}

function onSignal(signal) {
  receivedSignal = signal;
  if (child && child.exitCode === null) child.kill(signal);
}

process.on("SIGINT", () => onSignal("SIGINT"));
process.on("SIGTERM", () => onSignal("SIGTERM"));

try {
  assertReadyToMove();
  moveAside();
  clearNextOutput();
  const { code, signal } = await runBuild();
  if (signal || receivedSignal) process.exitCode = 1;
  else if (code !== 0) process.exitCode = code;
} finally {
  restore();
}

if (receivedSignal) {
  process.removeAllListeners("SIGINT");
  process.removeAllListeners("SIGTERM");
  process.kill(process.pid, receivedSignal);
} else {
  process.exit(process.exitCode ?? 0);
}
