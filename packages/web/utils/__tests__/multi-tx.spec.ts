import {
  BridgeFeeExceedsBudgetMessage,
  BridgeRouteExpiredMessage,
} from "@osmosis-labs/bridge";

import {
  BRIDGE_FEE_EXCEEDS_BUDGET_MESSAGE,
  BRIDGE_ROUTE_EXPIRED_MESSAGE,
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
