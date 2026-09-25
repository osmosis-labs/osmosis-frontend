// eslint-disable-next-line import/no-extraneous-dependencies -- msw is a workspace-root dev dependency, as in the other bridge specs
import { http, HttpResponse } from "msw";

import { server } from "../../__tests__/msw";
import {
  getSolanaRpcUrls,
  getSolanaTxFeeLamports,
  solanaMessageFromTxBase64,
} from "../solana";

const RPC = "https://solana-rpc.test";

/** A serialized transaction: signature count, signatures, then message. */
const serializedTx = (signatureCountPrefix: number[], signatureCount: number) => {
  const message = Buffer.from([0x01, 0x02, 0x03, 0x04]);
  return Buffer.concat([
    Buffer.from(signatureCountPrefix),
    Buffer.alloc(signatureCount * 64, 0xaa),
    message,
  ]).toString("base64");
};

describe("solanaMessageFromTxBase64", () => {
  it("slices the message past the signatures", () => {
    // Skip's CCTP burn is two-signer: the user, plus a keypair Skip
    // pre-signs for the message account the burn creates
    expect(solanaMessageFromTxBase64(serializedTx([2], 2))).toBe(
      Buffer.from([0x01, 0x02, 0x03, 0x04]).toString("base64")
    );
  });

  it("decodes a multi-byte compact-u16 signature count", () => {
    // 0x80 0x01 encodes 128
    expect(solanaMessageFromTxBase64(serializedTx([0x80, 0x01], 128))).toBe(
      Buffer.from([0x01, 0x02, 0x03, 0x04]).toString("base64")
    );
  });

  it("rejects a transaction with no message", () => {
    const signaturesOnly = Buffer.concat([
      Buffer.from([1]),
      Buffer.alloc(64),
    ]).toString("base64");
    expect(() => solanaMessageFromTxBase64(signaturesOnly)).toThrow(
      "no message"
    );
  });
});

describe("getSolanaRpcUrls", () => {
  const original = process.env.SOLANA_RPC_URL;
  afterEach(() => {
    process.env.SOLANA_RPC_URL = original;
  });

  it("puts a configured production RPC first", () => {
    process.env.SOLANA_RPC_URL = "https://prod-rpc.example";
    expect(getSolanaRpcUrls()[0]).toBe("https://prod-rpc.example");
  });

  it("falls back to the public endpoint only, never publicnode", () => {
    delete process.env.SOLANA_RPC_URL;
    const urls = getSolanaRpcUrls();
    expect(urls).toEqual(["https://api.mainnet-beta.solana.com"]);
    expect(urls.some((url) => url.includes("publicnode"))).toBe(false);
  });
});

describe("getSolanaTxFeeLamports", () => {
  it("returns the fee the cluster reports for the exact message", async () => {
    let requestedMessage: string | undefined;
    server.use(
      http.post(RPC, async ({ request }) => {
        const body = (await request.json()) as {
          method: string;
          params: [string];
        };
        requestedMessage = body.params[0];
        return HttpResponse.json({ result: { value: 14030 } });
      })
    );

    await expect(
      getSolanaTxFeeLamports(serializedTx([2], 2), [RPC])
    ).resolves.toBe(BigInt(14030));
    // the message was sent, not the whole signed transaction
    expect(requestedMessage).toBe(
      Buffer.from([0x01, 0x02, 0x03, 0x04]).toString("base64")
    );
  });

  it("returns undefined when the node cannot price the message", async () => {
    // a null value means the blockhash is unknown to the node
    server.use(
      http.post(RPC, () => HttpResponse.json({ result: { value: null } }))
    );
    await expect(
      getSolanaTxFeeLamports(serializedTx([2], 2), [RPC])
    ).resolves.toBeUndefined();
  });

  it("throws when no RPC answers, rather than reporting a zero fee", async () => {
    server.use(
      http.post(RPC, () => new HttpResponse(null, { status: 503 }))
    );
    await expect(
      getSolanaTxFeeLamports(serializedTx([2], 2), [RPC])
    ).rejects.toThrow();
  });
});
