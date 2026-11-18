/**
 * @jest-environment node
 */
import { readBodyText, readJsonBody } from "~/server/api-handlers/request-body";

/** A POST whose body arrives as `chunks`, with no `content-length` unless
 *  given, like a chunked upload. Counts the chunks pulled from it. */
function streamedPost(
  chunks: Uint8Array[],
  headers: Record<string, string> = {}
) {
  let pulled = 0;
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        const chunk = chunks[pulled];
        if (chunk === undefined) {
          controller.close();
          return;
        }
        pulled++;
        controller.enqueue(chunk);
      },
    },
    // Pull only when the reader asks, so `pulled` counts what was read.
    { highWaterMark: 0 }
  );
  const request = new Request("https://app.test/api/x", {
    method: "POST",
    headers,
    body,
    duplex: "half",
  } as RequestInit);
  return { request, pulled: () => pulled };
}

const bytes = (text: string) => new TextEncoder().encode(text);

describe("readBodyText", () => {
  it("returns a body within the limit", async () => {
    const { request } = streamedPost([bytes('{"a":'), bytes("1}")]);
    expect(await readBodyText(request, 16)).toBe('{"a":1}');
  });

  it("refuses a declared oversize body without reading it", async () => {
    const { request, pulled } = streamedPost([bytes("x")], {
      "content-length": "17",
    });
    expect(await readBodyText(request, 16)).toBeUndefined();
    expect(pulled()).toBe(0);
  });

  it("stops reading a chunked body once it passes the limit", async () => {
    const chunk = bytes("x".repeat(10));
    const { request, pulled } = streamedPost([chunk, chunk, chunk, chunk]);
    expect(await readBodyText(request, 16)).toBeUndefined();
    expect(pulled()).toBe(2);
  });

  it("counts the bytes received, not the declared length", async () => {
    const { request } = streamedPost([bytes("x".repeat(32))], {
      "content-length": "4",
    });
    expect(await readBodyText(request, 16)).toBeUndefined();
  });

  it("measures the limit in UTF-8 bytes", async () => {
    // Six characters, 18 bytes.
    const { request } = streamedPost([bytes("€".repeat(6))]);
    expect(await readBodyText(request, 16)).toBeUndefined();
  });

  it("decodes a character split across chunks", async () => {
    const euro = bytes("€");
    const { request } = streamedPost([euro.slice(0, 1), euro.slice(1)]);
    expect(await readBodyText(request, 16)).toBe("€");
  });

  it("returns an empty string for a request without a body", async () => {
    const request = new Request("https://app.test/api/x", { method: "POST" });
    expect(await readBodyText(request)).toBe("");
  });
});

describe("readJsonBody", () => {
  it("parses a JSON body", async () => {
    const { request } = streamedPost([bytes('{"chainId":"osmosis-1"}')]);
    expect(await readJsonBody(request)).toEqual({
      body: { chainId: "osmosis-1" },
    });
  });

  it("answers malformed JSON with a 400", async () => {
    const { request } = streamedPost([bytes("{not json")]);
    const result = await readJsonBody(request);
    expect("errorResponse" in result && result.errorResponse.status).toBe(400);
  });
});
