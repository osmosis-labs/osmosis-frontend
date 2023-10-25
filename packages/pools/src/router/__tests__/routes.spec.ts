import { Dec, Int } from "@keplr-wallet/unit";

import { NotEnoughLiquidityError } from "../../errors";
import { Route, RouteWithInAmount } from "../route";
import { RoutablePool } from "../types";
import {
  allPools,
  makeDefaultTestRouterParams,
  makeRouterWithForceRoutes,
  makeStablePool,
  makeWeightedPool,
} from "./pool";

describe("OptimizedRoutes", () => {
  describe("getOptimizedRoutesByTokenIn", () => {
    it("handles no pools", () => {
      const router = makeDefaultTestRouterParams({ pools: [] });
      const promisedSplit = router.getOptimizedRoutesByTokenIn(
        { denom: "uion", amount: new Int("100") },
        "uosmo"
      );
      expect(promisedSplit).resolves.toEqual([]);
    });
    it("handles invalid tokens", () => {
      const router = makeDefaultTestRouterParams({
        pools: [makeWeightedPool()],
      });
      {
        const promisedSplit = router.getOptimizedRoutesByTokenIn(
          { denom: "", amount: new Int("100") }, // invalid denom
          "uosmo"
        );
        expect(promisedSplit).rejects.toBeDefined();
      }
      {
        const promisedSplit = router.getOptimizedRoutesByTokenIn(
          { denom: "uion", amount: new Int("0") }, // invalid amount
          "uosmo"
        );
        expect(promisedSplit).rejects.toBeDefined();
      }
      {
        const promisedSplit = router.getOptimizedRoutesByTokenIn(
          { denom: "uion", amount: new Int("100") },
          "" // invalid denom
        );
        expect(promisedSplit).rejects.toBeDefined();
      }
      {
        const promisedSplit = router.getOptimizedRoutesByTokenIn(
          { denom: "uion", amount: new Int("100") },
          "uion"
        );
        expect(promisedSplit).rejects.toBeDefined();
      }
    });
    it("handles not enough liquidity", async () => {
      const pools = [
        makeWeightedPool({
          // little liquidity, but double TVL (pool ID)
          id: "2",
          firstPoolAsset: { denom: "ufoo", amount: "100" },
          secondPoolAsset: { denom: "ubar", amount: "100" },
        }),
        makeWeightedPool(), // higher liquidity, not a route
      ];

      const router = makeDefaultTestRouterParams({
        pools,
        incentivizedPoolIds: [],
        stakeCurrencyMinDenom: "ufoo",
      });

      const split = router.getOptimizedRoutesByTokenIn(
        {
          denom: "ufoo",
          amount: new Int("100"),
        },
        "ubar"
      );

      expect(split).rejects.toThrow(NotEnoughLiquidityError);
    });

    it("favors high liquidity - splits into similar liquidity pools", async () => {
      const pools = [
        makeWeightedPool({
          // lower liquidity, but double TVL (pool ID)
          id: "2",
          firstPoolAsset: { amount: "1000" },
          secondPoolAsset: { amount: "1000" },
        }),
        makeWeightedPool(), // higher liquidity
      ];

      const router = makeDefaultTestRouterParams({
        pools,
        incentivizedPoolIds: [],
        stakeCurrencyMinDenom: "ufoo",
      });

      const split = await router.getOptimizedRoutesByTokenIn(
        {
          denom: "uion",
          amount: new Int("100"),
        },
        "uosmo"
      );

      // price impact can be slightly reduced with split
      expect(split.length).toBe(1);
    });
    it("favors high liquidity - swaps full amount into much higher liquidity pools", async () => {
      const pools = [
        makeWeightedPool({
          // lower liquidity, but double TVL (pool ID)
          id: "2",
          firstPoolAsset: { amount: "100000000" },
          secondPoolAsset: { amount: "100000000" },
        }),
        makeWeightedPool(), // higher liquidity
      ];

      const router = makeDefaultTestRouterParams({
        pools,
        incentivizedPoolIds: [],
        stakeCurrencyMinDenom: "ufoo",
      });

      const split = await router.getOptimizedRoutesByTokenIn(
        {
          denom: "uion",
          amount: new Int("100"),
        },
        "uosmo"
      );

      // super high liquidity is unbeatable
      expect(split.length).toBe(1);
    });
    it("favors high liquidity - 2 pools, only 1 route", async () => {
      const pools = [
        makeWeightedPool(), // uion => uosmo
        makeWeightedPool({
          // uosmo => ujuno
          id: "2",
          firstPoolAsset: { denom: "uosmo" },
          secondPoolAsset: { denom: "ujuno" },
        }),
      ];

      const router = makeDefaultTestRouterParams({
        pools,
        incentivizedPoolIds: [],
        stakeCurrencyMinDenom: "ufoo",
      });

      const tokenIn = {
        denom: "uion",
        amount: new Int("100"),
      };
      const split = await router.getOptimizedRoutesByTokenIn(tokenIn, "ujuno");

      expect(split.length).toBe(1);
      expect(split[0].pools.length).toBe(2);
      expect(split[0].pools[0].id).toBe("1");
      expect(split[0].initialAmount.toString()).toBe(tokenIn.amount.toString());
    });
    it("favors high liquidity - 2 pools, only 1 route -- one weighted, one stable", async () => {
      const pools = [
        makeWeightedPool({
          secondPoolAsset: { denom: "uust" },
        }), // uion => uust
        makeStablePool({
          // uust => uusdc
          id: "2",
          firstPoolAsset: { denom: "uusdc" },
          secondPoolAsset: { denom: "uust" },
        }),
      ];

      const router = makeDefaultTestRouterParams({
        pools,
        incentivizedPoolIds: [],
        stakeCurrencyMinDenom: "ufoo",
      });

      const tokenIn = {
        denom: "uion",
        amount: new Int("100"),
      };
      const split = await router.getOptimizedRoutesByTokenIn(tokenIn, "uusdc");

      expect(split.length).toBe(1);
      expect(split[0].pools.length).toBe(2);
      expect(split[0].pools[0].id).toBe("1");
      expect(split[0].initialAmount.toString()).toBe(tokenIn.amount.toString());
    });
    it("favors high liquidity - throws if no route found", () => {
      const pools = [
        makeWeightedPool(), // uion => uosmo
        makeStablePool({
          // uust => uusdc
          id: "2",
          firstPoolAsset: { denom: "uusdc" },
          secondPoolAsset: { denom: "uust" },
        }),
      ];

      const router = makeDefaultTestRouterParams({
        pools,
        incentivizedPoolIds: [],
        stakeCurrencyMinDenom: "ufoo",
      });

      expect.assertions(1);
      router
        .getOptimizedRoutesByTokenIn(
          {
            denom: "uion",
            amount: new Int("100"),
          },
          "uusdc"
        )
        .catch((e) => expect(e).toBeTruthy());
    });

    it("routes a stable pool - scaling factors don't affect amounts", async () => {
      const normalPools = [
        makeStablePool({
          firstPoolAsset: { denom: "uust" },
          secondPoolAsset: { denom: "uusdc" },
        }),
        makeStablePool({
          id: "2",
          firstPoolAsset: { denom: "uusdc" },
          secondPoolAsset: { denom: "uusdt" },
        }),
      ];
      const scaledPools = [
        makeStablePool({
          firstPoolAsset: { denom: "uust" },
          secondPoolAsset: { denom: "uusdc" },
        }),
        makeStablePool({
          id: "2",
          firstPoolAsset: { denom: "uusdc", scalingFactor: "10000" },
          secondPoolAsset: { denom: "uusdt", scalingFactor: "10000" },
        }),
      ];
      const normalRouter = makeDefaultTestRouterParams({
        pools: normalPools,
        incentivizedPoolIds: [],
        stakeCurrencyMinDenom: "ufoo",
      });
      const scaledRouter = makeDefaultTestRouterParams({
        pools: scaledPools,
        incentivizedPoolIds: [],
        stakeCurrencyMinDenom: "ufoo",
      });
      const normalSplit = await normalRouter.getOptimizedRoutesByTokenIn(
        {
          denom: "uust",
          amount: new Int("100"),
        },
        "uusdt"
      );

      const scaledSplit = await scaledRouter.getOptimizedRoutesByTokenIn(
        {
          denom: "uust",
          amount: new Int("100"),
        },
        "uusdt"
      );
      const normalOut = await normalRouter.calculateTokenOutByTokenIn([
        normalSplit[0],
      ]);
      const scaledOut = await scaledRouter.calculateTokenOutByTokenIn([
        scaledSplit[0],
      ]);
      expect(scaledOut.amount.toString()).toEqual(normalOut.amount.toString());
    });

    it("uses preferred pool IDs - lifts preferred direct pool into used route", async () => {
      // returns a route that would have come in 3rd get lifted to 2nd because of preferred pool

      let c = 1;
      const getId = () => (c++).toString();
      const pools = [
        // osmo & juno (route 2)
        makeWeightedPool({
          id: getId(), // 1
          firstPoolAsset: { denom: "juno", amount: "100000000" }, // more liquidity (60% swap split into here)
          secondPoolAsset: { amount: "100000000" },
        }),
        // osmo & juno (preferred, route 1)
        makeWeightedPool({
          id: getId(), // 2
          firstPoolAsset: { denom: "foo" },
        }),
        // juno & stars (stableswap) (route 2)
        makeStablePool({
          id: getId(), // 3
          firstPoolAsset: { denom: "stars" },
          secondPoolAsset: { denom: "juno" },
        }),
        // stars & usdc (route 2)
        makeWeightedPool({
          id: getId(), // 4
          firstPoolAsset: { denom: "stars" },
          secondPoolAsset: { denom: "usdc" },
        }),
        // foo & bar (higher TVL) (route 1)
        makeWeightedPool({
          id: getId(), // 5
          firstPoolAsset: { denom: "foo" },
          secondPoolAsset: { denom: "bar" },
        }),
        // bar & baz (stableswap) (route 1)
        makeStablePool({
          id: getId(), // 6
          firstPoolAsset: { denom: "bar" },
          secondPoolAsset: { denom: "baz" },
        }),
        // baz & usdc (higher TVL) (route 1)
        makeWeightedPool({
          id: getId(), // 7
          firstPoolAsset: { denom: "baz" },
          secondPoolAsset: { denom: "usdc" },
        }),
        // osmo & bbb (lower liq) (preferred, route 3)
        makeWeightedPool({
          id: getId(), // 8
          firstPoolAsset: { denom: "uosmo" },
          secondPoolAsset: { denom: "bbb" },
        }),
        // bbb & usdc (lower liq) (route 3)
        makeWeightedPool({
          id: getId(), // 9
          firstPoolAsset: { denom: "bbb" },
          secondPoolAsset: { denom: "usdc" },
        }),
      ];

      // route : osmo - 1 > juno - 3 > stars - 4 > usdc
      // route : osmo - 2 > foo - 5 > bar - 6 > baz - 7 > usdc (6 IS PREFERRED)
      // route : osmo - 8 > bbb - 9 > usdc

      const normalRouter = makeDefaultTestRouterParams({
        pools,
      });

      const preferredRouter = makeDefaultTestRouterParams({
        pools,
        preferredPoolIds: ["6"],
      });

      const tokenIn = { denom: "uosmo", amount: new Int("100") };

      const normalSplit = await normalRouter.getOptimizedRoutesByTokenIn(
        tokenIn,
        "usdc"
      );
      const prefSplit = await preferredRouter.getOptimizedRoutesByTokenIn(
        tokenIn,
        "usdc"
      );

      // normal routing prefers single, short route
      const [normRoute1PoolIds] = normalSplit.map((route) =>
        route.pools.map((pool) => pool.id)
      );
      const [prefRoute1PoolIds, prefRoute2PoolIds] = prefSplit.map((route) =>
        route.pools.map((pool) => pool.id)
      );

      expect(normRoute1PoolIds.includes("8")).toBeFalsy(); // includes preferred pool, shortest route
      expect(prefRoute1PoolIds.includes("8")).toBeFalsy(); // NOT preferred pool, but high liq route
      expect(prefRoute2PoolIds?.includes("6")).toBeUndefined(); // preferred pool
    });
  });

  describe("calculateTokenOutByTokenIn", () => {
    it("handles not enough liquidity in a route", () => {
      // uion => ufoo => ujuno
      const pools = [
        makeWeightedPool({
          firstPoolAsset: { amount: "1" },
          secondPoolAsset: { denom: "ufoo", amount: "1" },
        }),
        makeWeightedPool({
          id: "2",
          firstPoolAsset: { denom: "ufoo", amount: "1" },
          secondPoolAsset: { denom: "ujuno", amount: "1" },
        }),
      ];
      const route: RouteWithInAmount = {
        pools,
        tokenOutDenoms: ["ufoo", "ujuno"],
        tokenInDenom: "uion",
        initialAmount: new Int("100"), // uion
      };

      const router = makeRouterWithForceRoutes([route]);

      expect(router.calculateTokenOutByTokenIn([route])).rejects.toBeInstanceOf(
        NotEnoughLiquidityError
      );
    });
    it("handles invalid route", () => {
      {
        // uion => ufoo => ujuno
        const pools = [
          makeWeightedPool({
            secondPoolAsset: { denom: "ufoo" },
          }),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "ufoo" },
            secondPoolAsset: { denom: "ujuno" },
          }),
        ];
        const route: RouteWithInAmount = {
          pools,
          tokenOutDenoms: ["ddd", "ffff"], // BAD DENOMS
          tokenInDenom: "uion",
          initialAmount: new Int("100"), // uion
        };

        const router = makeRouterWithForceRoutes([route]);
        expect(
          router.calculateTokenOutByTokenIn([route])
        ).rejects.toBeDefined();
      }
      {
        // uion => ufoo => ujuno
        const pools = [
          makeWeightedPool({
            secondPoolAsset: { denom: "ufoo" },
          }),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "ufoo" },
            secondPoolAsset: { denom: "ujuno" },
          }),
        ];
        const route: RouteWithInAmount = {
          pools,
          tokenOutDenoms: ["ufoo", "ujuno"],
          tokenInDenom: "uion",
          initialAmount: new Int("-2"), // BAD INITIAL AMOUNT
        };

        const router = makeRouterWithForceRoutes([route]);
        expect(
          router.calculateTokenOutByTokenIn([route])
        ).rejects.toBeDefined();
      }
      {
        // uion => ufoo => ujuno
        const pools = [
          makeWeightedPool({
            secondPoolAsset: { denom: "ufoo" },
          }),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "ufoo" },
            secondPoolAsset: { denom: "ujuno" },
          }),
        ];
        const route: RouteWithInAmount = {
          pools,
          tokenOutDenoms: ["ufoo", "ujuno"],
          tokenInDenom: "ujuno", // BAD: MATCHES OUT DENOM
          initialAmount: new Int("100"),
        };

        const router = makeRouterWithForceRoutes([route]);
        expect(
          router.calculateTokenOutByTokenIn([route])
        ).rejects.toBeDefined();
      }
      {
        // uion => ufoo => ujuno
        const pools = [
          makeWeightedPool({
            secondPoolAsset: { denom: "ufoo" },
          }),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "ufoo" },
            secondPoolAsset: { denom: "ujuno" },
          }),
        ];
        const route: RouteWithInAmount = {
          pools,
          tokenOutDenoms: ["ufoo"], // BAD: LESS OUT DENOMS
          tokenInDenom: "ujuno",
          initialAmount: new Int("100"),
        };

        const router = makeRouterWithForceRoutes([route]);
        expect(
          router.calculateTokenOutByTokenIn([route])
        ).rejects.toBeDefined();
      }
      {
        // uion => ufoo => ujuno
        const pools = [
          makeWeightedPool({
            secondPoolAsset: { denom: "ufoo" },
          }),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "ufoo" },
            secondPoolAsset: { denom: "ujuno" },
          }),
        ];
        const route: RouteWithInAmount = {
          pools,
          tokenOutDenoms: ["", "ujuno"], // BAD: "" OUT DENOM
          tokenInDenom: "ujuno",
          initialAmount: new Int("100"),
        };

        const router = makeRouterWithForceRoutes([route]);
        expect(
          router.calculateTokenOutByTokenIn([route])
        ).rejects.toBeDefined();
      }
    });

    it("handles many pools - finds a route through all pools between any two valid assets - low max pool - no throw", async () => {
      const allDenoms = Array.from(
        new Set(allPools.flatMap((pool) => pool.poolAssetDenoms))
      );

      const router = makeDefaultTestRouterParams({ pools: allPools });

      let threw = false;
      allDenoms.forEach(async (denom, i) => {
        const tokenInDenom = denom;
        const tokenOutDenom = allDenoms[(i + 1) % allDenoms.length];

        if (
          tokenInDenom === tokenOutDenom ||
          tokenInDenom.concat(tokenOutDenom).includes("gamm")
        )
          return;

        try {
          const routes = await router.getOptimizedRoutesByTokenIn(
            { denom: tokenInDenom, amount: new Int("10") },
            tokenOutDenom
          );
          await router.calculateTokenOutByTokenIn([routes[0]]);
        } catch (e) {
          threw = true;
        }
      });

      expect(threw).toBeFalsy();
    });
    it("handles many pools - finds a route through all pools between any two valid assets - high max pool - no throw", async () => {
      const allDenoms = Array.from(
        new Set(allPools.flatMap((pool) => pool.poolAssetDenoms))
      ).filter((denom) => !denom.includes("gamm"));

      const router = makeDefaultTestRouterParams({ pools: allPools });

      let threw = false;
      allDenoms.forEach(async (denom, i) => {
        const tokenInDenom = denom;
        const tokenOutDenom = allDenoms[(i + 1) % allDenoms.length];

        if (tokenInDenom === tokenOutDenom) return;

        try {
          const routes = await router.getOptimizedRoutesByTokenIn(
            { denom: tokenInDenom, amount: new Int("10") },
            tokenOutDenom
          );
          await router.calculateTokenOutByTokenIn([routes[0]]);
        } catch (e) {
          threw = true;
        }
      });

      expect(threw).toBeFalsy();
    });
  });

  describe("findBestSplitTokenIn", () => {
    it("handles - no routes", async () => {
      const pools: RoutablePool[] = [];
      const router = makeDefaultTestRouterParams({ pools });

      const tokenIn = { denom: "uion", amount: new Int("100") };

      const routes = router.getCandidateRoutes(tokenIn.denom, "uusdc");

      const bestSplit = await router.findBestSplitTokenIn(
        routes,
        tokenIn.amount
      );
      expect(bestSplit.length).toEqual(0);
    });
    it("handles - invalid maxIterations", () => {
      expect(() => {
        makeDefaultTestRouterParams({
          maxSplitIterations: -1,
        });
      }).toThrow();
      expect(() => {
        makeDefaultTestRouterParams({
          maxSplitIterations: 101,
        });
      }).toThrow();
    });
    it("handles - single route", async () => {
      const pools = [
        makeWeightedPool(),
        makeWeightedPool({
          id: "2",
          firstPoolAsset: { denom: "uusdc" },
        }),
      ];
      const router = makeDefaultTestRouterParams({ pools });

      const tokenIn = { denom: "uion", amount: new Int("100") };

      const routes = router.getCandidateRoutes(tokenIn.denom, "uusdc");

      const bestSplit = await router.findBestSplitTokenIn(
        routes,
        tokenIn.amount
      );
      expect(bestSplit[0].pools).toEqual(routes[0].pools);
    });

    it("splits between choice of 2 routes - uion -> uusdc", async () => {
      const baseRouteInfo = {
        tokenOutDenoms: ["uosmo", "uusdc"],
        tokenInDenom: "uion",
      };

      const higherLiqRoute: Route = {
        ...baseRouteInfo,
        pools: [
          makeWeightedPool(),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "uusdc" },
          }),
        ],
      };

      const lowerLiqRoute: Route = {
        ...baseRouteInfo,
        pools: [
          makeWeightedPool({
            id: "3",
            firstPoolAsset: { amount: "100" },
            secondPoolAsset: { amount: "100" },
          }),
          makeWeightedPool({
            id: "4",
            firstPoolAsset: { denom: "uusdc", amount: "100" },
            secondPoolAsset: { amount: "100" },
          }),
        ],
      };

      const routes = [lowerLiqRoute, higherLiqRoute];
      const router = makeRouterWithForceRoutes(routes);

      const tokenIn = { denom: "uion", amount: new Int("100") };

      const bestSplit = await router.findBestSplitTokenIn(
        routes,
        tokenIn.amount
      );

      expect(bestSplit[0].pools).toEqual(routes[0].pools); // lower liq route
      expect(
        bestSplit
          .reduce((sum, route) => sum.add(route.initialAmount), new Int(0))
          .equals(tokenIn.amount)
      ).toBeTruthy();
      expect(bestSplit[0].initialAmount.toString()).toEqual("10");
      expect(bestSplit[1].initialAmount.toString()).toEqual("90");
    });
    it("splits between choice of 2 routes - even split - uion -> uusdc", async () => {
      const baseRouteInfo = {
        tokenOutDenoms: ["uosmo", "uusdc"],
        tokenInDenom: "uion",
      };

      const evenRoute1: Route = {
        ...baseRouteInfo,
        pools: [
          makeWeightedPool(),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "uusdc" },
          }),
        ],
      };

      const evenRoute2: Route = {
        ...baseRouteInfo,
        pools: [
          makeWeightedPool({
            id: "3",
          }),
          makeWeightedPool({
            id: "4",
            firstPoolAsset: { denom: "uusdc" },
          }),
        ],
      };

      const routes = [evenRoute2, evenRoute1];
      const router = makeRouterWithForceRoutes(routes, {
        getPoolTotalValueLocked() {
          return new Dec("100"); // same TVL for all pools
        },
      });

      const tokenIn = { denom: "uion", amount: new Int("100") };

      const bestSplit = await router.findBestSplitTokenIn(
        routes,
        tokenIn.amount
      );

      expect(bestSplit[0].pools).toEqual(routes[0].pools);
      expect(
        bestSplit
          .reduce((sum, route) => sum.add(route.initialAmount), new Int(0))
          .equals(tokenIn.amount)
      ).toBeTruthy();
      expect(bestSplit[0].initialAmount.toString()).toEqual("40");
      expect(bestSplit[1].initialAmount.toString()).toEqual("60");
    });
    // weighted pools' calcOutAmountGivenIn is much faster than stableswap, which uses it's own binary search
    // this is to get an eye on the performance of searching for out amounts through stable pools
    it("is performant - splits using stable pools: 2 routes - uion -> uusdc", async () => {
      const baseRouteInfo = {
        tokenOutDenoms: ["uosmo", "uusdc"],
        tokenInDenom: "uion",
      };

      const higherLiqRoute: Route = {
        ...baseRouteInfo,
        pools: [
          makeStablePool(),
          makeStablePool({
            id: "2",
            firstPoolAsset: { denom: "uusdc" },
          }),
        ],
      };

      const lowerLiqRoute: Route = {
        ...baseRouteInfo,
        pools: [
          makeStablePool({
            id: "3",
            firstPoolAsset: { amount: "100" },
            secondPoolAsset: { amount: "100" },
          }),
          makeStablePool({
            id: "4",
            firstPoolAsset: { denom: "uusdc", amount: "100" },
            secondPoolAsset: { amount: "100" },
          }),
        ],
      };

      const routes = [lowerLiqRoute, higherLiqRoute];
      const router = makeRouterWithForceRoutes(routes);

      const tokenIn = { denom: "uion", amount: new Int("100") };

      const bestSplit = await router.findBestSplitTokenIn(
        routes,
        tokenIn.amount
      );

      expect(bestSplit[0].pools).toEqual(routes[0].pools);
      expect(
        bestSplit
          .reduce((sum, route) => sum.add(route.initialAmount), new Int(0))
          .equals(tokenIn.amount)
      ).toBeTruthy();
    });

    it("splits between choice of 3 routes - uion -> uosmo -> uusdc", async () => {
      const baseRouteInfo = {
        tokenOutDenoms: ["uosmo", "uusdc"],
        tokenInDenom: "uion",
      };

      const highestLiqRoute: Route = {
        ...baseRouteInfo,
        pools: [
          makeWeightedPool(),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "uusdc" },
          }),
        ],
      };

      const mediumLiqRoute: Route = {
        ...baseRouteInfo,
        pools: [
          makeWeightedPool({
            id: "3",
            firstPoolAsset: { amount: "500" },
            secondPoolAsset: { amount: "500" },
          }),
          makeWeightedPool({
            id: "4",
            firstPoolAsset: { denom: "uusdc", amount: "500" },
            secondPoolAsset: { amount: "500" },
          }),
        ],
      };

      const lowerLiqRoute: Route = {
        ...baseRouteInfo,
        pools: [
          makeWeightedPool({
            id: "5",
            firstPoolAsset: { amount: "100" },
            secondPoolAsset: { amount: "100" },
          }),
          makeWeightedPool({
            id: "6",
            firstPoolAsset: { denom: "uusdc", amount: "100" },
            secondPoolAsset: { amount: "100" },
          }),
        ],
      };

      const routes = [lowerLiqRoute, mediumLiqRoute, highestLiqRoute];
      const router = makeRouterWithForceRoutes(routes);

      const tokenIn = { denom: "uion", amount: new Int("100") };

      const bestSplit = await router.findBestSplitTokenIn(
        routes,
        tokenIn.amount
      );

      expect(bestSplit[0].pools).toEqual(routes[0].pools);
      expect(
        bestSplit
          .reduce((sum, route) => sum.add(route.initialAmount), new Int(0))
          .equals(tokenIn.amount)
      ).toBeTruthy();
    });
  });
});
