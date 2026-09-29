import {
  BridgeFeeExceedsBudgetMessage,
  BridgeRouteExpiredMessage,
} from "@osmosis-labs/bridge";
// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";

import { server } from "~/__tests__/msw";

import {
  BRIDGE_FEE_EXCEEDS_BUDGET_MESSAGE,
  BRIDGE_ROUTE_EXPIRED_MESSAGE,
  waitForSkipStepArrival,
} from "../multi-tx";

/**
 * The client matches named provider failures on the error MESSAGE, which is
 * all that survives the tRPC boundary. It cannot import the bridge package's
 * constants at runtime: a value import from `@osmosis-labs/bridge` pulls the
 * whole package into the browser bundle, including the Node-only
 * LaunchDarkly SDK, which fails the web build. So the literals are mirrored
 * in `utils/multi-tx.ts` and pinned to the originals here — a reword on
 * either side fails this test instead of silently losing the recovery copy.
 *
 * This test file runs in Node, so importing the bridge package here is fine.
 */
describe("bridge error message constants", () => {
  it("mirrors the bridge package's route-expired message", () => {
    expect(BRIDGE_ROUTE_EXPIRED_MESSAGE).toBe(BridgeRouteExpiredMessage);
  });

  it("mirrors the bridge package's fee-exceeds-budget message", () => {
    expect(BRIDGE_FEE_EXCEEDS_BUDGET_MESSAGE).toBe(
      BridgeFeeExceedsBudgetMessage
    );
  });
});

describe("waitForSkipStepArrival", () => {
  const skipState = (state: string) =>
    server.use(
      http.get("*/api/skip-track-tx", () => HttpResponse.json({})),
      http.get("*/api/skip-tx-status", () => HttpResponse.json({ state }))
    );

  const arrival = (abandonedIsFailed?: boolean) =>
    waitForSkipStepArrival({
      chainId: "solana",
      txHash: "signature",
      maxAttempts: 1,
      intervalMs: 0,
      abandonedIsFailed,
    });

  it("treats an abandoned route as failed by default", async () => {
    skipState("STATE_ABANDONED");
    await expect(arrival()).resolves.toBe("failed");
  });

  it("keeps an abandoned route pending when abandonment doesn't prove failure", async () => {
    // e.g. a Solana first leg: Skip abandoning is a tracking timeout, and
    // the funds may still arrive, so the entry must stay resumable.
    skipState("STATE_ABANDONED");
    await expect(arrival(false)).resolves.toBe("pending");
  });

  it("still reports a completed error as failed", async () => {
    skipState("STATE_COMPLETED_ERROR");
    await expect(arrival(false)).resolves.toBe("failed");
  });
});
