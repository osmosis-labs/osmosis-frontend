import { Readable } from "node:stream";

import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Pages-router API routes on the Node runtime use `(req, res)`, while our former edge routes are
 * written against the Fetch API. This adapts a Fetch handler to a Node API route so the handler
 * bodies stay runtime-agnostic.
 *
 * Routes using this must export `config = { api: { bodyParser: false } }` (inline — Next parses page
 * config statically) so the request body is left unparsed and can be forwarded as a stream.
 */
export function toNodeApiHandler(handler: (req: Request) => Promise<Response>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const response = await handler(toFetchRequest(req));

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (!response.body) {
      res.end();
      return;
    }

    const body = Readable.fromWeb(
      response.body as import("node:stream/web").ReadableStream
    );
    await new Promise<void>((resolve, reject) => {
      body.on("error", reject);
      res.on("error", reject);
      res.on("finish", resolve);
      body.pipe(res);
    });
  };
}

function toFetchRequest(req: NextApiRequest): Request {
  const protocol =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] ??
    "http";
  const url = new URL(req.url ?? "/", `${protocol}://${req.headers.host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else if (value !== undefined) headers.set(key, value);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody
      ? (Readable.toWeb(req) as unknown as ReadableStream<Uint8Array>)
      : undefined,
    // Required by undici when the body is a stream.
    ...(hasBody ? { duplex: "half" } : {}),
  } as RequestInit);
}
