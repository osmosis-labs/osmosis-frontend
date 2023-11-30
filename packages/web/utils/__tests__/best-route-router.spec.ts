import { Int } from "@keplr-wallet/unit";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";

import {
  BestRouteTokenInRouter,
  NamedRouter,
} from "../routing/best-route-router";

// Mock routers for testing
const mockRouters: NamedRouter<TokenOutGivenInRouter>[] = [
  {
    name: "Router1",
    router: {
      routeByTokenIn: jest.fn().mockResolvedValue({ amount: new Int(100) }),
    },
  },
  {
    name: "Router2",
    router: {
      routeByTokenIn: jest.fn().mockResolvedValue({ amount: new Int(200) }),
    },
  },
];

describe("BestRouteTokenInRouter", () => {
  let router: BestRouteTokenInRouter;

  beforeEach(() => {
    router = new BestRouteTokenInRouter(mockRouters);
  });

  it("should return the best route", async () => {
    const tokenIn: Token = { denom: "denom1", amount: new Int("100") };
    const tokenOutDenom = "denom2";
    const result = await router.routeByTokenIn(tokenIn, tokenOutDenom);
    expect(result.amount.toString()).toEqual(new Int(200).toString());
  });

  it("should prioritize NotEnoughLiquidityError error", async () => {
    const tokenIn: Token = { denom: "denom1", amount: new Int("100") };
    const tokenOutDenom = "denom5";
    mockRouters[0].router.routeByTokenIn = jest
      .fn()
      .mockRejectedValue(new NoRouteError());
    mockRouters[1].router.routeByTokenIn = jest
      .fn()
      .mockRejectedValue(new NotEnoughLiquidityError());
    await expect(
      router.routeByTokenIn(tokenIn, tokenOutDenom)
    ).rejects.toBeInstanceOf(NotEnoughLiquidityError);
  });

  it("should surface NoRouteError error", async () => {
    const tokenIn: Token = { denom: "denom1", amount: new Int("100") };
    const tokenOutDenom = "denom5";
    mockRouters[0].router.routeByTokenIn = jest
      .fn()
      .mockRejectedValue(new NoRouteError());
    mockRouters[1].router.routeByTokenIn = jest
      .fn()
      .mockRejectedValue(new NoRouteError());
    await expect(
      router.routeByTokenIn(tokenIn, tokenOutDenom)
    ).rejects.toBeInstanceOf(NoRouteError);
  });

  it("should surface unexpected error", async () => {
    const tokenIn: Token = { denom: "denom1", amount: new Int("100") };
    const tokenOutDenom = "denom5";
    mockRouters[0].router.routeByTokenIn = jest
      .fn()
      .mockRejectedValue(new Error("error a"));
    mockRouters[1].router.routeByTokenIn = jest
      .fn()
      .mockRejectedValue(new Error("error b"));
    await expect(
      router.routeByTokenIn(tokenIn, tokenOutDenom)
    ).rejects.toBeInstanceOf(Error);
  });

  it("should wait for a better slow router, but not time out", async () => {
    const timeout = 100;
    const slowRouterDelayMs = 50;

    router = new BestRouteTokenInRouter(mockRouters, timeout);

    const tokenIn: Token = { denom: "denom1", amount: new Int("100") };
    const tokenOutDenom = "denom5";

    // slower better router, but fast enough
    mockRouters[0].router.routeByTokenIn = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        setTimeout(() => resolve({ amount: new Int(500) }), slowRouterDelayMs);
      })
    );

    // instant router
    mockRouters[1].router.routeByTokenIn = jest
      .fn()
      .mockResolvedValue({ amount: new Int(100) });

    const result = await router.routeByTokenIn(tokenIn, tokenOutDenom);
    expect(result.amount.toString()).toEqual(new Int(500).toString());
  });

  it("should time out for a too slow router, and pick faster router", async () => {
    const timeout = 50;
    const slowRouterDelayMs = 100;

    router = new BestRouteTokenInRouter(mockRouters, timeout);

    const tokenIn: Token = { denom: "denom1", amount: new Int("100") };
    const tokenOutDenom = "denom5";

    // too slow router
    mockRouters[0].router.routeByTokenIn = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        setTimeout(() => resolve({ amount: new Int(500) }), slowRouterDelayMs);
      })
    );

    // fast good enough router
    mockRouters[1].router.routeByTokenIn = jest
      .fn()
      .mockResolvedValue({ amount: new Int(100) });

    const result = await router.routeByTokenIn(tokenIn, tokenOutDenom);
    expect(result.amount.toString()).toEqual(new Int(100).toString());
  });
});
