import { Readable, Writable } from "node:stream";

// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";
import type { NextApiRequest, NextApiResponse } from "next";

import { server } from "~/__tests__/msw";
import nodeEvmRpcHandler, { config } from "~/pages/api/evm-rpc";
import { evmRpcHandler } from "~/server/api-handlers/evm-rpc";
import { resetServerFlagCache } from "~/utils/server-flags";

const LD_CLIENT_ID = "ld-client-id";
const LD_EVALX = `https://clientsdk.launchdarkly.com/sdk/evalx/${LD_CLIENT_ID}/contexts/:context`;
const KEYED_RPC = "https://polygon-provider.test/v2/secret-key";
const PUBLIC_RPC = "https://polygon-bor-rpc.publicnode.com";
const APP_HOST = "app.test";

/** A same-origin browser POST for Polygon, as the app's pages send it. */
function post(
  body: unknown,
  { origin = `https://${APP_HOST}`, chainId = "137" } = {}
) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new Request(`https://${APP_HOST}/api/evm-rpc?chainId=${chainId}`, {
    method: "POST",
    headers: { host: APP_HOST, origin },
    body: text,
  });
}

const balanceOf = {
  jsonrpc: "2.0",
  id: 3,
  method: "eth_call",
  params: [{ to: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" }, "latest"],
};

function upstreamAnswers(
  url: string,
  respond: () => Response = () =>
    HttpResponse.json({ jsonrpc: "2.0", id: 3, result: "0x2a" })
) {
  const calls: unknown[] = [];
  server.use(
    http.post(url, async ({ request }) => {
      calls.push(await request.json());
      return respond();
    })
  );
  return calls;
}

function launchDarklyServes(flagOn: boolean) {
  server.use(
    http.get(LD_EVALX, () =>
      HttpResponse.json({ "evm-rpc-proxy": { value: flagOn } })
    )
  );
}

beforeEach(() => {
  process.env.EVM_RPC_URL_137 = KEYED_RPC;
  // Every test runs as a deployed build with the flag on unless it says
  // otherwise.
  resetServerFlagCache();
  process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID = LD_CLIENT_ID;
  launchDarklyServes(true);
});

afterEach(() => {
  delete process.env.EVM_RPC_URL_137;
  delete process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;
});

it("answers 404 and never contacts an upstream while the flag is off", async () => {
  launchDarklyServes(false);
  const keyed = upstreamAnswers(KEYED_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect(result.status).toBe(404);
  expect(keyed).toHaveLength(0);
});

it("forwards an allowed read to the keyed provider", async () => {
  const keyed = upstreamAnswers(KEYED_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({
    jsonrpc: "2.0",
    id: 3,
    result: "0x2a",
  });
  expect(keyed).toHaveLength(1);
});

it("answers 404 for a chain with no keyed provider", async () => {
  delete process.env.EVM_RPC_URL_137;
  const publicCalls = upstreamAnswers(PUBLIC_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect(result.status).toBe(404);
  expect(publicCalls).toHaveLength(0);
});

it("answers 404 for a chain outside EthereumChainInfo", async () => {
  const result = await evmRpcHandler(post(balanceOf, { chainId: "999999" }));
  expect(result.status).toBe(404);
});

it("refuses cross-origin requests", async () => {
  const keyed = upstreamAnswers(KEYED_RPC);

  const result = await evmRpcHandler(
    post(balanceOf, { origin: "https://evil.test" })
  );

  expect(result.status).toBe(403);
  expect(keyed).toHaveLength(0);
});

it.each(["eth_sendRawTransaction", "eth_getLogs", "debug_traceCall"])(
  "refuses %s",
  async (method) => {
    const keyed = upstreamAnswers(KEYED_RPC);

    const result = await evmRpcHandler(post({ ...balanceOf, method }));

    expect(result.status).toBe(400);
    expect(keyed).toHaveLength(0);
  }
);

it("refuses batches", async () => {
  const result = await evmRpcHandler(post([balanceOf, balanceOf]));
  expect(result.status).toBe(400);
});

it("falls back to the public endpoint when the provider rate-limits", async () => {
  upstreamAnswers(KEYED_RPC, () => new HttpResponse(null, { status: 429 }));
  const publicCalls = upstreamAnswers(PUBLIC_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect(result.status).toBe(200);
  expect(publicCalls).toHaveLength(1);
});

it("falls back when an exhausted quota is reported inside a 200", async () => {
  upstreamAnswers(KEYED_RPC, () =>
    HttpResponse.json({
      jsonrpc: "2.0",
      id: 3,
      error: { code: -32005, message: "daily request count exceeded" },
    })
  );
  const publicCalls = upstreamAnswers(PUBLIC_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect(result.status).toBe(200);
  expect(publicCalls).toHaveLength(1);
});

it("falls back on a -32603 internal error", async () => {
  upstreamAnswers(KEYED_RPC, () =>
    HttpResponse.json({
      jsonrpc: "2.0",
      id: 3,
      error: { code: -32603, message: "header not found" },
    })
  );
  const publicCalls = upstreamAnswers(PUBLIC_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect((await result.json()).result).toBeDefined();
  expect(publicCalls).toHaveLength(1);
});

it("returns the -32603 answer when no upstream answers better", async () => {
  const internalError = () =>
    HttpResponse.json({
      jsonrpc: "2.0",
      id: 3,
      error: { code: -32603, message: "execution reverted" },
    });
  server.use(
    http.post(KEYED_RPC, internalError),
    http.post(PUBLIC_RPC, internalError),
    http.post("https://polygon.drpc.org", internalError)
  );

  const result = await evmRpcHandler(post(balanceOf));

  expect(result.status).toBe(200);
  expect((await result.json()).error.code).toBe(-32603);
});

it("passes a chain answer such as a revert through without falling back", async () => {
  upstreamAnswers(KEYED_RPC, () =>
    HttpResponse.json({
      jsonrpc: "2.0",
      id: 3,
      error: { code: 3, message: "execution reverted" },
    })
  );
  const publicCalls = upstreamAnswers(PUBLIC_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect((await result.json()).error.message).toBe("execution reverted");
  expect(publicCalls).toHaveLength(0);
});

it("never echoes the keyed URL when every upstream fails", async () => {
  server.use(
    http.post(KEYED_RPC, () => HttpResponse.error()),
    http.post("https://polygon-bor-rpc.publicnode.com", () =>
      HttpResponse.error()
    ),
    http.post("https://polygon.drpc.org", () => HttpResponse.error())
  );

  const result = await evmRpcHandler(post(balanceOf));
  const text = await result.text();

  expect(result.status).toBe(502);
  expect(text).not.toContain("secret-key");
});

it("falls back when the provider can't route the call to a node", async () => {
  upstreamAnswers(KEYED_RPC, () =>
    HttpResponse.json({
      jsonrpc: "2.0",
      id: 3,
      error: {
        code: 12,
        message:
          "Can't route your request to suitable provider, if you specified certain providers revise the list",
      },
    })
  );
  const publicCalls = upstreamAnswers(PUBLIC_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect(result.status).toBe(200);
  expect(publicCalls).toHaveLength(1);
});

it("falls back when the key is not enabled for the chain", async () => {
  upstreamAnswers(KEYED_RPC, () =>
    HttpResponse.json({
      jsonrpc: "2.0",
      id: 3,
      error: {
        code: -32600,
        message:
          "MATIC_MAINNET is not enabled for this app. Visit this page to enable the network",
      },
    })
  );
  const publicCalls = upstreamAnswers(PUBLIC_RPC);

  const result = await evmRpcHandler(post(balanceOf));

  expect(result.status).toBe(200);
  expect(publicCalls).toHaveLength(1);
});

describe("Node API route", () => {
  async function callNodeRoute(body: string) {
    const req = Object.assign(Readable.from([Buffer.from(body)]), {
      method: "POST",
      url: "/api/evm-rpc?chainId=137",
      headers: {
        host: APP_HOST,
        "x-forwarded-proto": "https",
        "content-type": "application/json",
        origin: `https://${APP_HOST}`,
      },
    });
    const chunks: Uint8Array[] = [];
    const res = Object.assign(
      new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(new Uint8Array(chunk));
          callback();
        },
      }),
      { statusCode: 200, setHeader: jest.fn() }
    );

    await nodeEvmRpcHandler(
      req as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );

    return {
      status: res.statusCode,
      body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    };
  }

  it("disables Next's body parser to preserve the raw request stream", () => {
    expect(config).toEqual({ api: { bodyParser: false } });
  });

  it("forwards a streamed request, query string included", async () => {
    const keyed = upstreamAnswers(KEYED_RPC);

    const result = await callNodeRoute(JSON.stringify(balanceOf));

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ jsonrpc: "2.0", id: 3, result: "0x2a" });
    expect(keyed).toHaveLength(1);
  });
});
