import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { EOL, tmpdir } from "node:os";
import path from "node:path";

import { chromium, expect, test } from "@playwright/test";
import decompress from "@xhmikosr/decompress";

import { TestConfig } from "../test-config";
import { notice } from "../utils/github-notice";

test("GitHub notices escape workflow commands in test titles", () => {
  const writes: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    writes.push(String(chunk));
    return true;
  };
  try {
    notice("Test 100%\r\n::error::injected failed.");
  } finally {
    process.stdout.write = originalWrite;
  }
  expect(writes).toEqual([
    `::notice::Test 100%25%0D%0A::error::injected failed.${EOL}`,
  ]);
});

/** A single USTAR link entry, without depending on another archive writer. */
function linkArchive(type: "1" | "2", target: string): Buffer {
  const header = Buffer.alloc(512);
  header.write("escape");
  header.write("0000777\0", 100);
  header.write("0000000\0", 108);
  header.write("0000000\0", 116);
  header.write("00000000000\0", 124);
  header.write("00000000000\0", 136);
  header.fill(32, 148, 156);
  header.write(type, 156);
  header.write(target, 157);
  header.write("ustar\0", 257);
  header.write("00", 263);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(`${checksum.toString(8).padStart(6, "0")}\0 `, 148);
  return Buffer.concat([header, Buffer.alloc(1024)]);
}

for (const [name, type] of [
  ["hardlink", "1"],
  ["symlink", "2"],
] as const) {
  test(`archive extraction rejects a ${name} outside its output`, async () => {
    const temporary = await mkdtemp(path.join(tmpdir(), "e2e-archive-"));
    const outside = path.join(temporary, "outside");
    try {
      await writeFile(outside, "unchanged");
      await expect(
        decompress(linkArchive(type, "../outside"), path.join(temporary, "out"))
      ).rejects.toThrow("outside the output directory");
      expect(await readFile(outside, "utf8")).toBe("unchanged");
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });
}

test("the bundled Keplr archive loads in the upgraded Chromium", async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), "e2e-keplr-"));
  try {
    const extension = path.join(temporary, "extension");
    await decompress(
      path.join(__dirname, "../keplr-extension-manifest-v3-v0.13.39.zip"),
      extension
    );
    const manifest = JSON.parse(
      await readFile(path.join(extension, "manifest.json"), "utf8")
    );
    expect(manifest.manifest_version).toBe(3);
    const context = await chromium.launchPersistentContext(
      path.join(temporary, "profile"),
      new TestConfig().getBrowserExtensionConfig(true, extension)
    );
    try {
      const worker =
        context.serviceWorkers()[0] ??
        (await context.waitForEvent("serviceworker", { timeout: 15_000 }));
      expect(worker.url()).toMatch(/^chrome-extension:\/\//);
      const extensionId = new URL(worker.url()).hostname;
      const page = await context.newPage();
      await page.goto(`chrome-extension://${extensionId}/register.html`);
      await expect(page.locator("body")).not.toBeEmpty();
    } finally {
      await context.close();
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
