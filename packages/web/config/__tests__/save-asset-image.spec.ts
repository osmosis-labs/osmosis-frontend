import fs from "fs";
import os from "os";
import path from "path";

import { getImageRelativeFilePath } from "../keplr-chain";
import { saveAssetImageToTokensDir } from "../utils";

const IMAGE_URL = "https://example.com/logo.svg";

describe("saveAssetImageToTokensDir", () => {
  const originalFetch = global.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  let tempDir: string;
  let imagePath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "asset-images-"));
    // utils resolves the package root with a bare `path.resolve()`.
    const resolve = path.resolve;
    jest
      .spyOn(path, "resolve")
      .mockImplementation((...segments) =>
        segments.length ? resolve(...segments) : tempDir
      );
    // The function skips downloads under NODE_ENV=test.
    (process.env as Record<string, string>).NODE_ENV = "development";
    imagePath = path.join(tempDir, "public", "tokens", "generated", "abc.svg");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    (process.env as Record<string, string | undefined>).NODE_ENV =
      originalNodeEnv;
    jest.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const mockBody = (chunks: string[], failAfterChunks?: boolean) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      body: new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          if (failAfterChunks) controller.error(new Error("connection reset"));
          else controller.close();
        },
      }),
    } as unknown as Response);
  };

  const save = () =>
    saveAssetImageToTokensDir({
      imageUrl: IMAGE_URL,
      asset: { symbol: "ABC" },
      currentAssetListHash: "not-the-stored-hash",
    });

  it("writes the downloaded image", async () => {
    mockBody(["<svg>", "</svg>"]);

    await save();
    expect(fs.readFileSync(imagePath, "utf-8")).toBe("<svg></svg>");
    expect(fs.existsSync(`${imagePath}.download`)).toBe(false);
  });

  it("leaves no truncated file when the download fails part-way", async () => {
    mockBody(["<svg>"], true);

    await expect(save()).rejects.toThrow("connection reset");
    expect(fs.existsSync(imagePath)).toBe(false);
    expect(fs.existsSync(`${imagePath}.download`)).toBe(false);
  });

  it("keeps the previous image when a re-download fails", async () => {
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    fs.writeFileSync(imagePath, "<svg>old</svg>");
    mockBody(["<svg>"], true);

    await expect(save()).rejects.toThrow();
    expect(fs.readFileSync(imagePath, "utf-8")).toBe("<svg>old</svg>");
  });

  it("sanitizes executable content from downloaded SVGs", async () => {
    mockBody([
      '<svg onload="alert(1)"><scr<script>ipt>evil()</script><script>evil()</script><foreignObject><b>x</b></foreignObject><a href="javascript:alert(2)"></a><a xlink:href="java&#x73;cript:alert(3)"></a><circle r="1"/></svg>',
    ]);

    await save();
    const content = fs.readFileSync(imagePath, "utf-8");
    expect(content).not.toContain("<script");
    expect(content).not.toContain("<foreignObject");
    expect(content).not.toContain("onload=");
    expect(content).not.toContain("javascript:");
    expect(content).not.toContain("java&#x73;cript:");
    expect(content).toContain('<circle r="1"/>');
  });

  it("matches lowercased extension casing between downloads and generated references", async () => {
    mockBody(["<svg></svg>"]);
    const saved = await saveAssetImageToTokensDir({
      imageUrl: "https://example.com/logo.SVG",
      asset: { symbol: "ABC" },
      currentAssetListHash: "not-the-stored-hash",
    });
    expect(saved).toBe("abc.svg");
    expect(
      getImageRelativeFilePath("https://example.com/logo.SVG", "ABC")
    ).toBe("/tokens/generated/abc.svg");
  });

  it("rejects path traversal symbols and unsupported extensions", async () => {
    await expect(
      saveAssetImageToTokensDir({
        imageUrl: IMAGE_URL,
        asset: { symbol: "../../evil" },
        currentAssetListHash: "not-the-stored-hash",
      })
    ).rejects.toThrow("Unsafe asset symbol");

    await expect(
      saveAssetImageToTokensDir({
        imageUrl: "https://example.com/evil.html",
        asset: { symbol: "ABC" },
        currentAssetListHash: "not-the-stored-hash",
      })
    ).rejects.toThrow("Unsupported image extension");
  });
});
