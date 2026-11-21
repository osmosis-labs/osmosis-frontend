/**
 * @jest-environment node
 */
import {
  skipTrackTxHandler,
  skipTxStatusHandler,
} from "~/server/api-handlers/skip-tx";
import { createSkipTxHandler } from "~/server/integrations/skip/tx-status-handler";

describe("skip tx handlers", () => {
  it("rejects PUT on skip-track-tx and POST on skip-tx-status", async () => {
    const trackPut = await skipTrackTxHandler(
      new Request(
        "https://app.test/api/skip-track-tx?chainID=osmosis-1&txHash=ABCDEF1234&env=mainnet",
        { method: "PUT" }
      )
    );
    expect(trackPut.status).toBe(405);

    const statusPost = await skipTxStatusHandler(
      new Request(
        "https://app.test/api/skip-tx-status?chainID=osmosis-1&txHash=ABCDEF1234&env=mainnet",
        { method: "POST" }
      )
    );
    expect(statusPost.status).toBe(405);
  });

  it.each([
    ["invalid env", "chainID=osmosis-1&txHash=ABCDEF1234&env=staging"],
    ["invalid chainID", "chainID=../evil&txHash=ABCDEF1234&env=mainnet"],
    ["invalid txHash", "chainID=osmosis-1&txHash=../../bad&env=mainnet"],
  ])("rejects %s with 400", async (_label, query) => {
    const res = await skipTrackTxHandler(
      new Request(`https://app.test/api/skip-track-tx?${query}`, {
        method: "POST",
      })
    );
    expect(res.status).toBe(400);
  });

  it("preserves a redacted 404 not-found signal for Skip status recovery", async () => {
    const handler = createSkipTxHandler(async () => {
      throw Object.assign(new Error("tx not found on upstream"), {
        status: 404,
      });
    }, ["GET"]);

    const res = await handler(
      new Request(
        "https://app.test/api/skip-tx-status?chainID=osmosis-1&txHash=ABCDEF1234&env=mainnet"
      )
    );
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: "Transaction not found",
      code: "NOT_FOUND",
    });
  });
});
