// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";

import { server } from "~/__tests__/msw";
import solanaRpcHandler, {
  resetSolanaRpcFlagCache,
} from "~/pages/api/solana-rpc";

const PUBLIC_RPC = "https://api.mainnet-beta.solana.com";
const KEYED_RPC = "https://solana-provider.test/?api-key=secret";
const APP_HOST = "app.test";
const LD_CLIENT_ID = "ld-client-id";
const LD_EVALX = `https://clientsdk.launchdarkly.com/sdk/evalx/${LD_CLIENT_ID}/contexts/:context`;

/** A same-origin browser POST, as the app's pages send it. */
function post(
  body: unknown,
  headers: Record<string, string> = {},
  { origin = `https://${APP_HOST}` }: { origin?: string | null } = {}
) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    url: `https://${APP_HOST}/api/solana-rpc`,
    headers: new Headers({
      host: APP_HOST,
      ...(origin ? { origin } : {}),
      ...headers,
    }),
    text: () => Promise.resolve(text),
  } as unknown as Request;
}

const allowedRequest = {
  jsonrpc: "2.0",
  id: 7,
  method: "getSignatureStatuses",
  params: [["sig"]],
};

/** Captures whether anything reached the public RPC. */
function spyOnPublicRpc() {
  const calls: unknown[] = [];
  server.use(
    http.post(PUBLIC_RPC, async ({ request }) => {
      calls.push(await request.json());
      return HttpResponse.json({ jsonrpc: "2.0", id: 7, result: { ok: true } });
    })
  );
  return calls;
}

function launchDarklyServes(flags: Record<string, unknown>) {
  server.use(
    http.get(LD_EVALX, () =>
      HttpResponse.json(
        Object.fromEntries(
          Object.entries(flags).map(([key, value]) => [key, { value }])
        )
      )
    )
  );
}

beforeEach(() => {
  resetSolanaRpcFlagCache();
});

afterEach(() => {
  delete process.env.SOLANA_RPC_URL;
  delete process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;
});

it("rejects non-POST requests", async () => {
  const result = await solanaRpcHandler({ method: "GET" } as Request);
  expect(result.status).toBe(405);
});

describe("solana-skip-routes flag gate", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID = LD_CLIENT_ID;
  });

  it("answers 404 and never contacts the RPC while the flag is off", async () => {
    launchDarklyServes({ "solana-skip-routes": false });
    const calls = spyOnPublicRpc();

    const result = await solanaRpcHandler(post(allowedRequest));

    expect(result.status).toBe(404);
    expect(calls).toHaveLength(0);
  });

  it("forwards once the flag is on", async () => {
    launchDarklyServes({ "solana-skip-routes": true });
    spyOnPublicRpc();

    const result = await solanaRpcHandler(post(allowedRequest));

    expect(result.status).toBe(200);
  });

  it("reuses the flag read instead of asking LaunchDarkly per request", async () => {
    let reads = 0;
    server.use(
      http.get(LD_EVALX, () => {
        reads++;
        return HttpResponse.json({ "solana-skip-routes": { value: true } });
      })
    );
    spyOnPublicRpc();

    await solanaRpcHandler(post(allowedRequest));
    await solanaRpcHandler(post(allowedRequest));

    expect(reads).toBe(1);
  });

  it("fails closed when LaunchDarkly is unreachable and nothing is cached", async () => {
    server.use(http.get(LD_EVALX, () => HttpResponse.error()));
    const calls = spyOnPublicRpc();

    const result = await solanaRpcHandler(post(allowedRequest));

    expect(result.status).toBe(404);
    expect(calls).toHaveLength(0);
  });

  it("stays open without a client-side id (local development)", async () => {
    delete process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;
    spyOnPublicRpc();

    const result = await solanaRpcHandler(post(allowedRequest));

    expect(result.status).toBe(200);
  });
});

describe("same-origin check", () => {
  it("refuses a request without an Origin", async () => {
    const calls = spyOnPublicRpc();

    const result = await solanaRpcHandler(
      post(allowedRequest, {}, { origin: null })
    );

    expect(result.status).toBe(403);
    expect(calls).toHaveLength(0);
  });

  it("refuses a request from another site", async () => {
    const calls = spyOnPublicRpc();

    const result = await solanaRpcHandler(
      post(allowedRequest, {}, { origin: "https://evil.test" })
    );

    expect(result.status).toBe(403);
    expect(calls).toHaveLength(0);
  });

  it("accepts the public host forwarded by the CDN", async () => {
    spyOnPublicRpc();

    const result = await solanaRpcHandler(
      post(
        allowedRequest,
        { "x-forwarded-host": "app.osmosis.zone", host: "deployment.internal" },
        { origin: "https://app.osmosis.zone" }
      )
    );

    expect(result.status).toBe(200);
  });

  it("falls back to a same-origin Referer", async () => {
    spyOnPublicRpc();

    const result = await solanaRpcHandler(
      post(
        allowedRequest,
        { referer: `https://${APP_HOST}/?tab=deposit` },
        { origin: null }
      )
    );

    expect(result.status).toBe(200);
  });
});

it("rejects a method outside the allowlist", async () => {
  const result = await solanaRpcHandler(
    post({ jsonrpc: "2.0", id: 1, method: "getProgramAccounts", params: [] })
  );
  expect(result.status).toBe(400);
  expect(await result.json()).toEqual({ error: "Method not allowed" });
});

it("rejects batch requests", async () => {
  const result = await solanaRpcHandler(
    post([{ jsonrpc: "2.0", id: 1, method: "getAccountInfo", params: [] }])
  );
  expect(result.status).toBe(400);
});

it("rejects invalid JSON and oversized bodies", async () => {
  expect((await solanaRpcHandler(post("{not json"))).status).toBe(400);
  expect((await solanaRpcHandler(post("x".repeat(17 * 1024)))).status).toBe(
    413
  );
});

it("rejects a declared oversize body without reading it", async () => {
  const text = jest.fn(() => Promise.resolve("{}"));
  const request = {
    method: "POST",
    url: `https://${APP_HOST}/api/solana-rpc`,
    headers: new Headers({
      host: APP_HOST,
      origin: `https://${APP_HOST}`,
      "content-length": String(17 * 1024),
    }),
    text,
  } as unknown as Request;
  expect((await solanaRpcHandler(request)).status).toBe(413);
  expect(text).not.toHaveBeenCalled();
});

it("measures the body limit in bytes, not UTF-16 code units", async () => {
  // 6k three-byte characters: under the limit in string length (6144),
  // over it in UTF-8 bytes (18432).
  expect((await solanaRpcHandler(post("€".repeat(6 * 1024)))).status).toBe(413);
});

it("forwards an allowed request to the public RPC when no provider is configured", async () => {
  const calls = spyOnPublicRpc();

  const result = await solanaRpcHandler(post(allowedRequest));

  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({
    jsonrpc: "2.0",
    id: 7,
    result: { ok: true },
  });
  expect(calls).toEqual([allowedRequest]);
});

it("uses SOLANA_RPC_URL when set and never echoes it on failure", async () => {
  process.env.SOLANA_RPC_URL = KEYED_RPC;
  server.use(
    http.post("https://solana-provider.test/", () =>
      HttpResponse.json({}, { status: 503 })
    )
  );

  const result = await solanaRpcHandler(
    post({ jsonrpc: "2.0", id: 1, method: "getAccountInfo", params: ["x"] })
  );

  expect(result.status).toBe(502);
  const body = JSON.stringify(await result.json());
  expect(body).not.toContain("secret");
  expect(body).not.toContain("solana-provider.test");
});
