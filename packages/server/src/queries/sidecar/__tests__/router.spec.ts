import { Int } from "@osmosis-labs/unit";
import { apiClient } from "@osmosis-labs/utils";

import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "../errors";
import { getSidecarRouter } from "../router";

jest.mock("@osmosis-labs/utils", () => ({
  ...jest.requireActual("@osmosis-labs/utils"),
  apiClient: jest.fn(),
}));
jest.mock("../../../env", () => ({ SIDECAR_BASE_URL: "http://sqs.test" }));

const route = [
  {
    in_amount: "100",
    out_amount: "99",
    pools: [
      {
        id: 1,
        type: 0,
        spread_factor: "0.002",
        token_out_denom: "uosmo",
        token_in_denom: "uatom",
      },
    ],
  },
];

const response = (extra: object, direction: "in" | "out") => ({
  ...(direction === "in"
    ? { amount_in: { denom: "uatom", amount: "100" }, amount_out: "99" }
    : { amount_in: "100", amount_out: { denom: "uosmo", amount: "99" } }),
  effective_fee: "0.002",
  price_impact: "0",
  route,
  tokens: [],
  ...extra,
});

describe("sidecar router price impact", () => {
  const tokenIn = { denom: "uatom", amount: new Int(100) };
  const tokenOut = { denom: "uosmo", amount: new Int(99) };

  it("maps price_impact_unknown to an undefined impact, both directions", async () => {
    const router = getSidecarRouter();
    const mock = apiClient as jest.Mock;
    const flag = { price_impact_unknown: true };

    mock.mockResolvedValueOnce(response(flag, "in"));
    const exactIn = await router.routeByTokenIn(tokenIn, "uosmo");
    mock.mockResolvedValueOnce(response(flag, "out"));
    const exactOut = await router.routeByTokenOut(tokenOut, "uatom");

    for (const quote of [exactIn, exactOut]) {
      expect(quote.priceImpactTokenOut).toBeUndefined();
      expect(quote.priceImpactUnknown).toBe(true);
    }
  });

  it("keeps the reported impact when the flag is absent", async () => {
    const router = getSidecarRouter();
    const mock = apiClient as jest.Mock;
    const impact = { price_impact: "-0.01" };

    mock.mockResolvedValueOnce(response(impact, "in"));
    const exactIn = await router.routeByTokenIn(tokenIn, "uosmo");
    mock.mockResolvedValueOnce(response(impact, "out"));
    const exactOut = await router.routeByTokenOut(tokenOut, "uatom");

    for (const quote of [exactIn, exactOut]) {
      expect(quote.priceImpactTokenOut?.toString()).toBe(
        "-0.010000000000000000"
      );
      expect(quote.priceImpactUnknown).toBeUndefined();
    }
  });
});

describe("sidecar router errors", () => {
  const tokenIn = { denom: "uatom", amount: new Int(100) };
  const tokenOut = { denom: "uosmo", amount: new Int(99) };
  const sidecarError = (message: string) => ({ data: { message } });

  it.each([
    "transmuter pool 1868 is not active",
    "transmuter pool 1868 does not allow swaps that increase corrupted denom uatom",
    "no candidate routes found",
  ])("maps %p to NoRouteError, both directions", async (message) => {
    const router = getSidecarRouter();
    const mock = apiClient as jest.Mock;

    mock.mockRejectedValueOnce(sidecarError(message));
    await expect(router.routeByTokenIn(tokenIn, "uosmo")).rejects.toThrow(
      NoRouteError
    );
    mock.mockRejectedValueOnce(sidecarError(message));
    await expect(router.routeByTokenOut(tokenOut, "uatom")).rejects.toThrow(
      NoRouteError
    );
  });

  it("keeps the liquidity and amount errors", async () => {
    const router = getSidecarRouter();
    const mock = apiClient as jest.Mock;

    mock.mockRejectedValueOnce(sidecarError("not enough liquidity"));
    await expect(router.routeByTokenIn(tokenIn, "uosmo")).rejects.toThrow(
      NotEnoughLiquidityError
    );
    mock.mockRejectedValueOnce(
      sidecarError("amount out is zero, try increasing amount in")
    );
    await expect(router.routeByTokenOut(tokenOut, "uatom")).rejects.toThrow(
      NotEnoughQuotedError
    );
  });

  it("passes other sidecar messages through", async () => {
    const router = getSidecarRouter();
    const mock = apiClient as jest.Mock;

    mock.mockRejectedValueOnce(sidecarError("pool 7 is not active"));
    const error = await router
      .routeByTokenIn(tokenIn, "uosmo")
      .catch((e: Error) => e);
    expect(error).not.toBeInstanceOf(NoRouteError);
    expect((error as Error).message).toBe("pool 7 is not active");
  });
});
