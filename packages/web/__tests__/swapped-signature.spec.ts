import { MAX_JSON_BODY_BYTES } from "~/server/api-handlers/request-body";
import { swappedSignatureHandler } from "~/server/api-handlers/swapped-signature";

const VALID_WALLET = "osmo1pasgjwaqy8sarsgw7a0plrwlauaqx8jxrqymd3";

function postRequest(body: string) {
  return new Request("http://localhost/api/swapped-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/swapped-signature", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      SWAPPED_COM_SK: "test-swapped-secret",
    };
  });

  afterEach(() => {
    process.env = env;
  });

  it("rejects malformed JSON request bodies with 400", async () => {
    const res = await swappedSignatureHandler(postRequest("{not-json"));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Malformed JSON request body",
    });
  });

  it("rejects request bodies over the size limit with 413", async () => {
    const res = await swappedSignatureHandler(
      postRequest("x".repeat(MAX_JSON_BODY_BYTES + 1))
    );

    expect(res.status).toBe(413);
  });

  it("rejects invalid wallet addresses that were previously accepted", async () => {
    const res = await swappedSignatureHandler(
      postRequest(JSON.stringify({ walletAddress: "not-a-wallet" }))
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: expect.stringContaining("valid Osmosis address"),
    });
  });

  it("returns a signed URL for valid Osmosis wallet addresses", async () => {
    const res = await swappedSignatureHandler(
      postRequest(JSON.stringify({ walletAddress: VALID_WALLET }))
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      url: expect.stringContaining("widget.swapped.com"),
    });
  });
});
