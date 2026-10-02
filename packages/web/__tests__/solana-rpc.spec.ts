// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";

import { server } from "~/__tests__/msw";
import solanaRpcHandler from "~/pages/api/solana-rpc";

const PUBLIC_RPC = "https://api.mainnet-beta.solana.com";
const KEYED_RPC = "https://solana-provider.test/?api-key=secret";

function post(body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: new Headers(headers),
    text: () => Promise.resolve(text),
  } as unknown as Request;
}

afterEach(() => {
  delete process.env.SOLANA_RPC_URL;
});

it("rejects non-POST requests", async () => {
  const result = await solanaRpcHandler({ method: "GET" } as Request);
  expect(result.status).toBe(405);
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
    headers: new Headers({ "content-length": String(17 * 1024) }),
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
  let forwarded: unknown;
  server.use(
    http.post(PUBLIC_RPC, async ({ request }) => {
      forwarded = await request.json();
      return HttpResponse.json({ jsonrpc: "2.0", id: 7, result: { ok: true } });
    })
  );

  const result = await solanaRpcHandler(
    post({
      jsonrpc: "2.0",
      id: 7,
      method: "getSignatureStatuses",
      params: [["sig"]],
    })
  );

  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({
    jsonrpc: "2.0",
    id: 7,
    result: { ok: true },
  });
  expect(forwarded).toEqual({
    jsonrpc: "2.0",
    id: 7,
    method: "getSignatureStatuses",
    params: [["sig"]],
  });
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
