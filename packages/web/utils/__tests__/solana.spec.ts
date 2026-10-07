// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";

import { server } from "~/__tests__/msw";

import {
  checkSolanaRecipient,
  checkSolanaSignatureOutcome,
  classifySolanaSimulation,
  getClientSolanaRpcUrls,
  SolanaSignatureStatus,
  waitForSolanaSignature,
} from "../solana";

/** Feeds a fixed sequence of statuses (last one repeats). */
const statuses = (...sequence: SolanaSignatureStatus[]) => {
  let call = 0;
  return jest.fn(async () => sequence[Math.min(call++, sequence.length - 1)]);
};

const fast = { intervalMs: 0, maxAttempts: 10 };

describe("waitForSolanaSignature", () => {
  it("resolves confirmed once the transaction is confirmed", async () => {
    const outcome = await waitForSolanaSignature({
      getStatus: statuses(
        null,
        { err: null, confirmationStatus: "processed" },
        { err: null, confirmationStatus: "confirmed" }
      ),
      isBlockhashValid: async () => true,
      ...fast,
    });
    expect(outcome).toBe("confirmed");
  });

  it("resolves failed when the transaction executed with an error", async () => {
    const outcome = await waitForSolanaSignature({
      getStatus: statuses({
        err: { InstructionError: [0, "Custom"] },
        confirmationStatus: "confirmed",
      }),
      isBlockhashValid: async () => true,
      ...fast,
    });
    expect(outcome).toBe("failed");
  });

  it("does not treat an error seen only at processed as final", async () => {
    // A processed status can belong to a fork that is later skipped; the
    // signature can then land cleanly on the canonical chain.
    const outcome = await waitForSolanaSignature({
      getStatus: statuses(
        {
          err: { InstructionError: [0, "Custom"] },
          confirmationStatus: "processed",
        },
        { err: null, confirmationStatus: "confirmed" }
      ),
      isBlockhashValid: async () => true,
      ...fast,
    });
    expect(outcome).toBe("confirmed");
  });

  it("resolves dropped when the blockhash expires with no status anywhere", async () => {
    const getStatus = statuses(null);
    const outcome = await waitForSolanaSignature({
      getStatus,
      isBlockhashValid: async () => false,
      ...fast,
    });
    expect(outcome).toBe("dropped");
    // the full-history lookup ran before concluding it was dropped
    expect(getStatus).toHaveBeenCalledWith(true);
  });

  it("does not call a transaction dropped when it landed at the edge of expiry", async () => {
    // absent from the recent cache, but present in full history
    const getStatus = jest.fn(async (searchHistory: boolean) =>
      searchHistory
        ? ({
            err: null,
            confirmationStatus: "finalized",
          } as SolanaSignatureStatus)
        : null
    );
    const outcome = await waitForSolanaSignature({
      getStatus,
      isBlockhashValid: async () => false,
      ...fast,
    });
    expect(outcome).toBe("confirmed");
  });

  it("returns unknown, never a failure, when the history lookup cannot answer", async () => {
    // A node that can't search history must not turn "can't tell" into
    // "dropped": marking a transfer failed that later lands strands funds.
    const getStatus = jest.fn(async (searchHistory: boolean) => {
      if (searchHistory) throw new Error("history not supported");
      return null;
    });
    const outcome = await waitForSolanaSignature({
      getStatus,
      isBlockhashValid: async () => false,
      ...fast,
    });
    expect(outcome).toBe("unknown");
  });

  it("returns unknown when the watch gives up while still unconfirmed", async () => {
    const outcome = await waitForSolanaSignature({
      getStatus: statuses({ err: null, confirmationStatus: "processed" }),
      isBlockhashValid: async () => true,
      ...fast,
    });
    expect(outcome).toBe("unknown");
  });

  it("never concludes dropped when the blockhash is unknown", async () => {
    const outcome = await waitForSolanaSignature({
      getStatus: statuses(null),
      ...fast,
    });
    expect(outcome).toBe("unknown");
  });

  it("treats transient RPC failures as undecided, not negative", async () => {
    let call = 0;
    const getStatus = jest.fn(async () => {
      call++;
      if (call < 3) throw new Error("rate limited");
      return { err: null, confirmationStatus: "confirmed" } as const;
    });
    const outcome = await waitForSolanaSignature({
      getStatus,
      isBlockhashValid: async () => true,
      ...fast,
    });
    expect(outcome).toBe("confirmed");
  });
});

describe("classifySolanaSimulation", () => {
  it("passes a clean simulation", () => {
    expect(classifySolanaSimulation(null, [])).toBe("ok");
  });

  it("reports an expired blockhash (observed live for a stale route)", () => {
    expect(classifySolanaSimulation("BlockhashNotFound", null)).toBe("expired");
  });

  it("reports a payer that has never held SOL", () => {
    expect(classifySolanaSimulation("AccountNotFound", null)).toBe("needs-sol");
  });

  it("reports a payer that cannot cover the fee", () => {
    expect(classifySolanaSimulation("InsufficientFundsForFee", null)).toBe(
      "needs-sol"
    );
  });

  it("reports a payer that cannot cover rent for a created account", () => {
    expect(
      classifySolanaSimulation(
        { InsufficientFundsForRent: { account_index: 1 } },
        []
      )
    ).toBe("needs-sol");
    expect(
      classifySolanaSimulation({ InstructionError: [0, { Custom: 1 }] }, [
        "Transfer: insufficient lamports 890880, need 2039280",
      ])
    ).toBe("needs-sol");
  });

  it("does not block on other failures (observed live: no USDC to burn)", () => {
    // Only the two actionable cases block before the wallet; anything else
    // goes to Phantom, which simulates again and explains it.
    expect(
      classifySolanaSimulation({ InstructionError: [0, { Custom: 3012 }] }, [
        "Program log: AnchorError caused by account: burn_token_account. Error Code: AccountNotInitialized.",
      ])
    ).toBe("ok");
  });
});

describe("checkSolanaRecipient", () => {
  const WALLET = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

  /** Answers getAccountInfo on the app's RPC route with `value`. */
  const accountInfo = (value: unknown) =>
    server.use(
      http.post("*/api/solana-rpc", () =>
        HttpResponse.json({ jsonrpc: "2.0", id: 1, result: { value } })
      )
    );

  it("rejects an account owned by the SPL Token program", async () => {
    accountInfo({ owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" });
    await expect(checkSolanaRecipient(WALLET)).resolves.toBe("token-account");
  });

  it("rejects an account owned by the Token-2022 program", async () => {
    accountInfo({ owner: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" });
    await expect(checkSolanaRecipient(WALLET)).resolves.toBe("token-account");
  });

  it("accepts a system-owned wallet", async () => {
    accountInfo({ owner: "11111111111111111111111111111111" });
    await expect(checkSolanaRecipient(WALLET)).resolves.toBe("ok");
  });

  it("accepts an address with no account yet (a fresh wallet)", async () => {
    accountInfo(null);
    await expect(checkSolanaRecipient(WALLET)).resolves.toBe("ok");
  });

  it("throws when the route does not answer, rather than passing the address", async () => {
    server.use(
      http.post("*/api/solana-rpc", () =>
        HttpResponse.json({}, { status: 502 })
      )
    );
    await expect(checkSolanaRecipient(WALLET)).rejects.toBeDefined();
  });
});

describe("checkSolanaSignatureOutcome", () => {
  /** Answers the app's RPC route per method. */
  const rpc = (answers: Record<string, unknown>) =>
    server.use(
      http.post("*/api/solana-rpc", async ({ request }) => {
        const { method } = (await request.json()) as { method: string };
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: 1,
          result: answers[method],
        });
      })
    );

  const check = () =>
    checkSolanaSignatureOutcome({
      signature: "signature",
      recentBlockhash: "blockhash",
    });

  it("reports confirmed and failed only at confirmed commitment or later", async () => {
    rpc({
      getSignatureStatuses: {
        value: [{ err: null, confirmationStatus: "finalized" }],
      },
    });
    await expect(check()).resolves.toBe("confirmed");

    rpc({
      getSignatureStatuses: {
        value: [
          {
            err: { InstructionError: [0, "Custom"] },
            confirmationStatus: "confirmed",
          },
        ],
      },
    });
    await expect(check()).resolves.toBe("failed");
  });

  it("proves nothing from a status seen only at processed", async () => {
    rpc({
      getSignatureStatuses: {
        value: [
          {
            err: { InstructionError: [0, "Custom"] },
            confirmationStatus: "processed",
          },
        ],
      },
    });
    await expect(check()).resolves.toBeUndefined();
  });

  it("reports dropped once the blockhash has expired with no record in history", async () => {
    rpc({
      getSignatureStatuses: { value: [null] },
      isBlockhashValid: { value: false },
    });
    await expect(check()).resolves.toBe("dropped");
  });

  /** Answers each getSignatureStatuses call with the next status in turn,
   *  so a tx can be absent at the first read and present at a later one. */
  const rpcSequence = (
    statuses: (SolanaSignatureStatus | null | "error")[],
    blockhashValid: boolean
  ) => {
    let statusCall = 0;
    server.use(
      http.post("*/api/solana-rpc", async ({ request }) => {
        const { method } = (await request.json()) as { method: string };
        if (method === "isBlockhashValid") {
          return HttpResponse.json({
            jsonrpc: "2.0",
            id: 1,
            result: { value: blockhashValid },
          });
        }
        const next = statuses[Math.min(statusCall++, statuses.length - 1)];
        if (next === "error") {
          return HttpResponse.json(
            { jsonrpc: "2.0", id: 1, error: { code: -32005, message: "busy" } },
            { status: 503 }
          );
        }
        return HttpResponse.json({
          jsonrpc: "2.0",
          id: 1,
          result: { value: [next] },
        });
      })
    );
  };

  it("re-reads history after expiry, so a tx that landed in between isn't called dropped", async () => {
    rpcSequence([null, { err: null, confirmationStatus: "confirmed" }], false);
    await expect(check()).resolves.toBe("confirmed");
  });

  it("proves nothing when the post-expiry history re-read goes unanswered", async () => {
    rpcSequence([null, "error"], false);
    await expect(check()).resolves.toBeUndefined();
  });

  it("proves nothing while the blockhash is still valid, or without one", async () => {
    rpc({
      getSignatureStatuses: { value: [null] },
      isBlockhashValid: { value: true },
    });
    await expect(check()).resolves.toBeUndefined();

    // entries recorded before the blockhash was persisted
    await expect(
      checkSolanaSignatureOutcome({ signature: "signature" })
    ).resolves.toBeUndefined();
  });

  it("proves nothing when the route does not answer", async () => {
    server.use(
      http.post("*/api/solana-rpc", () =>
        HttpResponse.json({}, { status: 502 })
      )
    );
    await expect(check()).resolves.toBeUndefined();
  });
});

describe("getClientSolanaRpcUrls", () => {
  it("uses only the app's RPC route, with no public fallback", () => {
    const urls = getClientSolanaRpcUrls();
    expect(urls).toHaveLength(1);
    expect(urls[0]).toMatch(/\/api\/solana-rpc$/);
  });
});
