// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";

import { server } from "~/__tests__/msw";
import evmRpcHandler from "~/pages/api/evm-rpc";

const KEYED_RPC = "https://polygon-provider.test/v2/secret-key";
const PUBLIC_RPC = "https://polygon-bor-rpc.publicnode.com";
const APP_HOST = "app.test";

/** A same-origin browser POST for Polygon, as the app's pages send it. */
function post(
  body: unknown,
  { origin = `https://${APP_HOST}`, chainId = "137" } = {}
) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    url: `https://${APP_HOST}/api/evm-rpc?chainId=${chainId}`,
    headers: new Headers({ host: APP_HOST, origin }),
    text: () => Promise.resolve(text),
  } as unknown as Request;
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

beforeEach(() => {
  process.env.EVM_RPC_URL_137 = KEYED_RPC;
});

afterEach(() => {
  delete process.env.EVM_RPC_URL_137;
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
