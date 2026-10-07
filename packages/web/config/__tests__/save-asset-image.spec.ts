import fs from "fs";
import os from "os";
import path from "path";

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
});
