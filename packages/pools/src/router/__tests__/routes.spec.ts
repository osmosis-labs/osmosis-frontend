import { Int } from "@keplr-wallet/unit";

import { Route } from "../route";
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
    describe("picks higher liquidity routes", () => {
      test("picks higher liquidity pool", async () => {
        const pools = [
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { amount: "1000" },
            secondPoolAsset: { amount: "1000" },
          }),
          makeWeightedPool(),
        ];

        const router = makeDefaultTestRouterParams({
          pools,
          incentivizedPoolIds: [],
          stakeCurrencyMinDenom: "ufoo",
        });

        const routes = await router.getOptimizedRoutesByTokenIn(
          {
            denom: "uion",
            amount: new Int("100"),
          },
          "uosmo"
        );

        expect(routes.length).toBe(1);
        expect(routes[0].pools[0].id).toBe("2"); // test pools return TVL as pool ID
      });
      test("routes through 2 pools", async () => {
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

        const routes = await router.getOptimizedRoutesByTokenIn(
          {
            denom: "uion",
            amount: new Int("100"),
          },
          "ujuno"
        );

        expect(routes.length).toBe(1);
        expect(routes[0].pools.length).toBe(2);
        expect(routes[0].pools[0].id).toBe("1");
      });
      test("routes through 2 pools, one weighted, one stable", async () => {
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

        const routes = await router.getOptimizedRoutesByTokenIn(
          {
            denom: "uion",
            amount: new Int("100"),
          },
          "uusdc"
        );

        expect(routes.length).toBe(1);
        expect(routes[0].pools.length).toBe(2);
        expect(routes[0].pools[0].id).toBe("1");
      });
      test("throws if no route found", () => {
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
    });
    describe("scaling factors with stable pools", () => {
      test("scaling factors don't affect amounts", async () => {
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
        const normalRoutes = await normalRouter.getOptimizedRoutesByTokenIn(
          {
            denom: "uust",
            amount: new Int("100"),
          },
          "uusdt"
        );

        const scaledRoutes = await scaledRouter.getOptimizedRoutesByTokenIn(
          {
            denom: "uust",
            amount: new Int("100"),
          },
          "uusdt"
        );
        const normalOut = await normalRouter.calculateTokenOutByTokenIn([
          normalRoutes[0],
        ]);
        const scaledOut = await scaledRouter.calculateTokenOutByTokenIn([
          scaledRoutes[0],
        ]);
        expect(scaledOut.amount.toString()).toEqual(
          normalOut.amount.toString()
        );
      });
    });
  });

  describe("calculateTokenOutByTokenIn", () => {
    describe("OSMO fee discount", () => {
      test("2 pools with 1% fee", async () => {
        const pools = [
          makeWeightedPool({
            firstPoolAsset: { amount: "100000000000000" },
            secondPoolAsset: { amount: "100000000000000" },
          }),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "uosmo", amount: "100000000000000" },
            secondPoolAsset: { denom: "ujuno", amount: "100000000000000" },
          }),
        ];

        const discountedRouter = makeDefaultTestRouterParams({ pools });
        // no incentivized pool ids, and a random denom is given
        const nondiscountedRouter = makeDefaultTestRouterParams({
          pools,
          incentivizedPoolIds: [],
          stakeCurrencyMinDenom: "ufoo",
        });

        const discountedRoutes =
          await discountedRouter.getOptimizedRoutesByTokenIn(
            {
              denom: "uion",
              amount: new Int("100000"), // amount out gets truncated, so can only see the amount diff w/ larger trades since the fee is already v small
            },
            "ujuno"
          );
        const nondiscountedRoutes =
          await nondiscountedRouter.getOptimizedRoutesByTokenIn(
            {
              denom: "uion",
              amount: new Int("100000"),
            },
            "ujuno"
          );
        const discoutedOut = await discountedRouter.calculateTokenOutByTokenIn([
          discountedRoutes[0],
        ]);
        const nondiscountedOut =
          await nondiscountedRouter.calculateTokenOutByTokenIn([
            nondiscountedRoutes[0],
          ]);

        const parsedDiscountAmt = parseInt(discoutedOut.amount.toString());
        const parsedNonDiscountAmt = parseInt(
          nondiscountedOut.amount.toString()
        );
        expect(parsedDiscountAmt).toBeGreaterThan(parsedNonDiscountAmt); // user gets more out
      });
      test("2 pools with different (small, large) fees", async () => {
        const poolsWithALargeFee = [
          makeWeightedPool({
            firstPoolAsset: { amount: "100000000000000" },
            secondPoolAsset: { amount: "100000000000000" },
          }),
          makeWeightedPool({
            id: "2",
            swapFee: "0.1", // 10% swap fee
            firstPoolAsset: { denom: "uosmo", amount: "100000000000000" },
            secondPoolAsset: { denom: "ujuno", amount: "100000000000000" },
          }),
        ];
        const poolsWithSameOnePercFee = [
          makeWeightedPool({
            firstPoolAsset: { amount: "100000000000000" },
            secondPoolAsset: { amount: "100000000000000" },
          }),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "uosmo", amount: "100000000000000" },
            secondPoolAsset: { denom: "ujuno", amount: "100000000000000" },
          }),
        ];

        // both pools incentivized, w/ osmo as discount out currency
        const largeFeeRouter = makeDefaultTestRouterParams({
          pools: poolsWithALargeFee,
        });
        const smallFeeRouter = makeDefaultTestRouterParams({
          pools: poolsWithSameOnePercFee,
        });

        const largeFeeRoutes = await largeFeeRouter.getOptimizedRoutesByTokenIn(
          {
            denom: "uion",
            amount: new Int("100000"), // amount out gets truncated, so can only see the amount diff w/ larger trades since the fee is already v small
          },
          "ujuno"
        );
        const smallFeeRoutes = await smallFeeRouter.getOptimizedRoutesByTokenIn(
          {
            denom: "uion",
            amount: new Int("100000"),
          },
          "ujuno"
        );
        const largeFeeOut = await largeFeeRouter.calculateTokenOutByTokenIn([
          largeFeeRoutes[0],
        ]);
        const smallFeeOut = await smallFeeRouter.calculateTokenOutByTokenIn([
          smallFeeRoutes[0],
        ]);

        const parsedLargeFeeOut = parseInt(largeFeeOut.amount.toString());
        const parsedSmallFeeOut = parseInt(smallFeeOut.amount.toString());
        expect(parsedLargeFeeOut).toBeLessThan(parsedSmallFeeOut); // user gets less out since fee is big
      });
      test("no fee discount for route w/ 3 pools", async () => {
        const pools = [
          makeWeightedPool({
            firstPoolAsset: { amount: "100000000000000" },
            secondPoolAsset: { amount: "100000000000000" },
          }),
          makeWeightedPool({
            id: "2",
            firstPoolAsset: { denom: "uosmo", amount: "100000000000000" },
            secondPoolAsset: { denom: "uust", amount: "100000000000000" },
          }),
          makeWeightedPool({
            id: "3",
            firstPoolAsset: { denom: "uust", amount: "100000000000000" },
            secondPoolAsset: { denom: "uusdc", amount: "100000000000000" },
          }),
        ];

        const discountedRouter = makeDefaultTestRouterParams({ pools });
        // no incentivized pool ids, and a random denom is given
        const nondiscountedRouter = makeDefaultTestRouterParams({
          pools,
          incentivizedPoolIds: [],
          stakeCurrencyMinDenom: "ufoo",
        });

        const discountedRoutes =
          await discountedRouter.getOptimizedRoutesByTokenIn(
            {
              denom: "uion",
              amount: new Int("100"), // amount out gets truncated, so can only see the amount diff w/ larger trades since the fee is already v small
            },
            "uusdc"
          );
        const nondiscountedRoutes =
          await nondiscountedRouter.getOptimizedRoutesByTokenIn(
            {
              denom: "uion",
              amount: new Int("100"),
            },
            "uusdc"
          );
        const discoutedOut = await discountedRouter.calculateTokenOutByTokenIn([
          discountedRoutes[0],
        ]);
        const nondiscountedOut =
          await nondiscountedRouter.calculateTokenOutByTokenIn([
            nondiscountedRoutes[0],
          ]);

        const parsedDiscountAmt = parseInt(discoutedOut.amount.toString());
        const parsedNonDiscountAmt = parseInt(
          nondiscountedOut.amount.toString()
        );
        expect(parsedDiscountAmt).toEqual(parsedNonDiscountAmt); // user gets more out
      });
    });
    describe("Many asset combos", () => {
      test("finds a route through all pools between any two valid assets - low max pool - no throw", async () => {
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
      test("finds a route through all pools between any two valid assets - high max pool - no throw", async () => {
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
  });

  describe("findBestSplitTokenIn", () => {
    it("gracefully handles being given no routes -> []", async () => {
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

    it("handles a single given route - uion -> uusdc", async () => {
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

    it("handles splitting between choice of 2 routes - uion -> uusdc", async () => {
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

      expect(bestSplit[0].pools).toEqual(routes[0].pools);
      expect(
        bestSplit
          .reduce((sum, route) => sum.add(route.initialAmount), new Int(0))
          .gt(new Int(0))
      ).toBeTruthy();
    });
    // weighted pools' calcOutAmountGivenIn is much faster than stableswap, which uses it's own binary search
    // this is to get an eye on the performance of searching for out amounts through stable pools
    it("performance using stable pools: handles splitting between choice of 2 routes - uion -> uusdc", async () => {
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
    });
  });
});
