/**
 * @jest-environment node
 */
import { Readable, Writable } from "node:stream";

import type { NextApiRequest, NextApiResponse } from "next";

import { toNodeApiHandler } from "~/utils/fetch-api-handler";

function nodeRequest({
  method,
  url,
  headers = {},
  body,
}: {
  method: string;
  url: string;
  headers?: Record<string, string | string[]>;
  body?: string;
}): NextApiRequest {
  return Object.assign(Readable.from(body ? [Buffer.from(body)] : []), {
    method,
    url,
    headers: { host: "app.osmosis.zone", ...headers },
  }) as unknown as NextApiRequest;
}

/** Collects what the adapter writes, like Node's ServerResponse would send. */
class RecordingResponse extends Writable {
  statusCode = 200;
  headers: Record<string, string> = {};
  chunks: Uint8Array[] = [];

  setHeader(name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
  }

  override _write(
    chunk: Uint8Array,
    _encoding: BufferEncoding,
    callback: () => void
  ) {
    this.chunks.push(new Uint8Array(chunk));
    callback();
  }

  get text() {
    return this.chunks.map((chunk) => new TextDecoder().decode(chunk)).join("");
  }
}

async function run(
  handler: (req: Request) => Promise<Response>,
  req: NextApiRequest
) {
  const res = new RecordingResponse();
  await toNodeApiHandler(handler)(req, res as unknown as NextApiResponse);
  return res;
}

describe("toNodeApiHandler", () => {
  it("forwards method, URL, headers and the streamed POST body", async () => {
    let seen: { method: string; url: string; header: string | null } = {
      method: "",
      url: "",
      header: null,
    };
    let seenBody: unknown;

    await run(
      async (req) => {
        seen = {
          method: req.method,
          url: req.url,
          header: req.headers.get("content-type"),
        };
        seenBody = await req.json();
        return new Response(null, { status: 204 });
      },
      nodeRequest({
        method: "POST",
        url: "/api/estimate-gas-fee?x=1",
        headers: {
          "content-type": "application/json",
          "x-forwarded-proto": "https",
        },
        body: JSON.stringify({ chainId: "osmosis-1" }),
      })
    );

    expect(seen).toEqual({
      method: "POST",
      url: "https://app.osmosis.zone/api/estimate-gas-fee?x=1",
      header: "application/json",
    });
    expect(seenBody).toEqual({ chainId: "osmosis-1" });
  });

  it("writes the handler's status, headers and body", async () => {
    const res = await run(
      async () =>
        Response.json(
          { error: "Invalid JSON" },
          { status: 400, headers: { "Cache-Control": "s-maxage=60" } }
        ),
      nodeRequest({ method: "GET", url: "/api/active-gauges" })
    );

    expect(res.statusCode).toBe(400);
    expect(res.headers["cache-control"]).toBe("s-maxage=60");
    expect(res.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(res.text)).toEqual({ error: "Invalid JSON" });
  });

  it("ends the response when the handler returns no body", async () => {
    const res = await run(
      async () => new Response(null, { status: 204 }),
      nodeRequest({ method: "GET", url: "/api/skip-tx-status" })
    );

    expect(res.statusCode).toBe(204);
    expect(res.writableEnded).toBe(true);
  });
});
