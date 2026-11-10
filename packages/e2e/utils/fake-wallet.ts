/**
 * @file fake-wallet.ts
 * @description A stand-in for the Keplr extension that lets the wallet flows
 * run on any runner, in parallel, without a private key or funds.
 *
 * It impersonates a real, funded address read-only, so the app reads that
 * address's real balances, history and account from the chain and simulates
 * real gas. Nothing reaches the chain:
 *
 * - The page talks to Keplr through `window.postMessage` ("proxy-request"),
 *   the protocol of `@keplr-wallet/provider-extension`, which cosmos-kit
 *   uses. An init script answers it: `getKey` returns the address and its
 *   on-chain public key, and `signAmino` / `signDirect` record the sign doc
 *   and return a dummy signature.
 * - The app broadcasts through its own `/api/broadcast-transaction` route.
 *   That request is intercepted and answered as accepted, with the hash of
 *   the signed bytes.
 * - The app learns the result over the RPC websocket. Lookups and
 *   subscriptions for an intercepted hash are answered as a successful tx;
 *   everything else passes through to the real node.
 *
 * The app signs Keplr transactions in amino JSON, so a test reads the
 * messages it would have sent from `signedDocs()`.
 */

import { createHash } from "node:crypto";

import type { BrowserContext, Page } from "@playwright/test";

import { REST_ENDPOINT, lcdGet } from "./config";

/**
 * The E2E topup account. It holds every token the flows trade, and its
 * public key is on chain, which gas simulation needs. Read-only here.
 */
export const FAKE_WALLET_ADDRESS =
  process.env.FAKE_WALLET_ADDRESS ??
  "osmo1nz4a9cjyz6fg0udacuhjkmpwqr7xxsfatvzavm";

export interface AminoMsg {
  type: string;
  value: Record<string, any>;
}

export interface AminoSignDoc {
  chain_id: string;
  account_number: string;
  sequence: string;
  fee: { amount: { denom: string; amount: string }[]; gas: string };
  msgs: AminoMsg[];
  memo: string;
}

/** Bech32 data part to bytes (the 20-byte account address). */
function bech32ToBytes(address: string): Uint8Array {
  const charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const data = address
    .slice(address.lastIndexOf("1") + 1, -6)
    .split("")
    .map((c) => charset.indexOf(c));
  let acc = 0;
  let bits = 0;
  const out: number[] = [];
  for (const value of data) {
    acc = (acc << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((acc >> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

export class FakeWallet {
  /** Hex hashes of the txs the page broadcast, oldest first. */
  readonly broadcasts: string[] = [];
  /** Hashes whose result the page has looked up, i.e. it saw them succeed. */
  readonly traced: string[] = [];

  private constructor(readonly address: string) {}

  static async install(
    context: BrowserContext,
    address = FAKE_WALLET_ADDRESS
  ): Promise<FakeWallet> {
    const json = await lcdGet<{
      account?: { pub_key?: { key?: string } };
    }>(`/cosmos/auth/v1beta1/accounts/${address}`);
    const pubKeyBase64 = json.account?.pub_key?.key;
    if (!pubKeyBase64) {
      throw new Error(`${address} has no public key on ${REST_ENDPOINT}`);
    }

    const wallet = new FakeWallet(address);
    await context.addInitScript(keplrResponder, {
      address,
      addressHex: Buffer.from(bech32ToBytes(address)).toString("hex"),
      pubKeyHex: Buffer.from(pubKeyBase64, "base64").toString("hex"),
      pubKeyBase64,
    });

    await context.route("**/api/broadcast-transaction", async (route) => {
      const body = route.request().postDataJSON() as { tx_bytes: string };
      const hash = createHash("sha256")
        .update(Buffer.from(body.tx_bytes, "base64"))
        .digest("hex")
        .toUpperCase();
      wallet.broadcasts.push(hash);
      await route.fulfill({
        json: {
          tx_response: {
            height: "0",
            txhash: hash,
            codespace: "",
            code: 0,
            data: "",
            raw_log: "",
            logs: [],
            info: "",
            gas_wanted: "0",
            gas_used: "0",
            tx: null,
            timestamp: "",
            events: [],
          },
        },
      });
    });

    await context.routeWebSocket(/\/websocket$/, (ws) => {
      const server = ws.connectToServer();
      ws.onMessage((message) => {
        let request: any;
        try {
          request = JSON.parse(String(message));
        } catch {
          server.send(message);
          return;
        }
        const ours = (hex: string | undefined) =>
          !!hex && wallet.broadcasts.includes(hex.toUpperCase());
        const lookupHash =
          request?.method === "tx" && typeof request.params?.hash === "string"
            ? Buffer.from(request.params.hash, "base64").toString("hex")
            : undefined;
        const subscribeHash =
          request?.method === "subscribe"
            ? /tx\.hash='([0-9A-Fa-f]+)'/.exec(request.params?.query ?? "")?.[1]
            : undefined;
        if (ours(lookupHash)) {
          wallet.traced.push(lookupHash!.toUpperCase());
          ws.send(
            JSON.stringify({
              jsonrpc: "2.0",
              id: request.id,
              result: {
                hash: lookupHash!.toUpperCase(),
                height: "1",
                index: 0,
                tx_result: {
                  code: 0,
                  codespace: "",
                  data: "",
                  log: "",
                  info: "",
                  gas_wanted: "0",
                  gas_used: "0",
                  events: [],
                },
                tx: "",
              },
            })
          );
        } else if (ours(subscribeHash)) {
          // Acknowledge; the lookup above settles the trace.
          ws.send(
            JSON.stringify({ jsonrpc: "2.0", id: request.id, result: {} })
          );
        } else {
          server.send(message);
        }
      });
    });

    return wallet;
  }

  /** Waits until the page has broadcast a tx and read back its result. */
  async waitForTx(timeout = 30_000): Promise<string> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const hash = this.broadcasts[this.broadcasts.length - 1];
      if (hash && this.traced.includes(hash)) return hash;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(
      this.broadcasts.length
        ? "The page broadcast a tx but never looked up its result."
        : "The page never broadcast a tx."
    );
  }

  /** Every sign doc the page asked the wallet to sign, oldest first. */
  async signedDocs(page: Page): Promise<AminoSignDoc[]> {
    return page.evaluate(() => (window as any).__fakeKeplrSigned ?? []);
  }

  /** The messages of the most recent sign request. */
  async lastSignedMsgs(page: Page): Promise<AminoMsg[]> {
    const docs = await this.signedDocs(page);
    if (docs.length === 0)
      throw new Error("The wallet was never asked to sign.");
    return docs[docs.length - 1].msgs;
  }
}

/**
 * Runs in the page before any app code. Kept self-contained: Playwright
 * serialises it, so it cannot close over anything in this module.
 */
function keplrResponder(key: {
  address: string;
  addressHex: string;
  pubKeyHex: string;
  pubKeyBase64: string;
}) {
  const w = window as any;
  w.__fakeKeplrSigned = [];
  // Some wallet checks only look for the object.
  w.keplr = w.keplr ?? { mode: "extension", version: "fake" };

  const bytes = (hex: string) => `__uint8array__${hex}`;
  const getKey = () => ({
    name: "E2E fake wallet",
    algo: "secp256k1",
    pubKey: bytes(key.pubKeyHex),
    address: bytes(key.addressHex),
    bech32Address: key.address,
    ethereumHexAddress: "",
    isNanoLedger: false,
    isKeystone: false,
  });
  const signature = {
    pub_key: { type: "tendermint/PubKeySecp256k1", value: key.pubKeyBase64 },
    signature: btoa(String.fromCharCode(...new Array(64).fill(0))),
  };

  window.addEventListener("message", (event) => {
    const request = event.data;
    if (!request || request.type !== "proxy-request") return;
    const respond = (result: unknown) =>
      window.postMessage(
        { type: "proxy-request-response", id: request.id, result },
        window.location.origin
      );
    const args = request.args ?? [];
    switch (request.method) {
      case "ping":
      case "enable":
      case "experimentalSuggestChain":
      case "suggestToken":
        return respond({});
      case "getKey":
        return respond({ return: getKey() });
      case "getKeysSettled":
        return respond({
          return: (args[0] ?? []).map(() => ({
            status: "fulfilled",
            value: getKey(),
          })),
        });
      case "signAmino":
        w.__fakeKeplrSigned.push(args[2]);
        return respond({ return: { signed: args[2], signature } });
      case "signDirect":
        w.__fakeKeplrSigned.push(args[2]);
        return respond({ return: { signed: args[2], signature } });
      case "signArbitrary":
        return respond({ return: signature });
      default:
        console.warn(`Fake Keplr: unhandled method ${request.method}`);
        return respond({ error: `Invalid method: ${request.method}` });
    }
  });
}
