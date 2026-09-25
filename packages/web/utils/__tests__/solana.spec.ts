import { SolanaSignatureStatus, waitForSolanaSignature } from "../solana";

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
