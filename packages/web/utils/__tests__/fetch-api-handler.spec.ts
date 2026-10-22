/**
 * @jest-environment node
 */
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { connect } from "node:net";
import { Readable, Writable } from "node:stream";

import type { NextApiRequest, NextApiResponse } from "next";

import { readBodyText } from "~/server/api-handlers/request-body";
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
  headers: Record<string, string | string[]> = {};
  chunks: Uint8Array[] = [];

  setHeader(name: string, value: string | string[]) {
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

  it("sends every Set-Cookie header", async () => {
    const headers = new Headers();
    headers.append("Set-Cookie", "a=1; Path=/");
    headers.append("Set-Cookie", "b=2; Path=/");

    const res = await run(
      async () => new Response(null, { status: 204, headers }),
      nodeRequest({ method: "GET", url: "/api/trpc" })
    );

    expect(res.headers["set-cookie"]).toEqual(["a=1; Path=/", "b=2; Path=/"]);
  });

  it("ends the response when the handler returns no body", async () => {
    const res = await run(
      async () => new Response(null, { status: 204 }),
      nodeRequest({ method: "GET", url: "/api/skip-tx-status" })
    );

    expect(res.statusCode).toBe(204);
    expect(res.writableEnded).toBe(true);
  });

  it("delivers a 413 over a real socket when it stops reading an oversized upload", async () => {
    const server = createServer((req, res) =>
      toNodeApiHandler(async (request) =>
        (await readBodyText(request)) === undefined
          ? Response.json({ error: "Request too large" }, { status: 413 })
          : new Response(null, { status: 204 })
      )(req as NextApiRequest, res as NextApiResponse)
    );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve)
    );
    const { port } = server.address() as AddressInfo;

    // A raw socket (msw intercepts http clients): a chunked 2.5MB upload with
    // no content-length, well past the 1MB limit.
    const socket = connect(port, "127.0.0.1");
    try {
      const response = await new Promise<string>((resolve) => {
        let received = "";
        socket.on("data", (data) => {
          received += data.toString();
          if (received.includes("\r\n\r\n")) resolve(received);
        });
        // The server may reset the connection once it has answered.
        socket.on("error", () => resolve(received));
        socket.on("close", () => resolve(received));

        socket.write(
          "POST /api/estimate-gas-fee HTTP/1.1\r\nHost: localhost\r\n" +
            "Content-Type: application/json\r\nTransfer-Encoding: chunked\r\n\r\n"
        );
        const chunk = "x".repeat(64 * 1024);
        const writeChunk = (index: number) => {
          if (socket.destroyed) return;
          if (index >= 40) {
            socket.end("0\r\n\r\n");
            return;
          }
          socket.write(`${chunk.length.toString(16)}\r\n${chunk}\r\n`, () =>
            writeChunk(index + 1)
          );
        };
        writeChunk(0);
      });

      expect(response.startsWith("HTTP/1.1 413")).toBe(true);
    } finally {
      socket.destroy();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
