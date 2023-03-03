import { Int } from "@keplr-wallet/unit";
import deepmerge from "deepmerge";

import { OptimizedRoutes } from "../routes";
import { StablePool } from "../stable";
import { WeightedPool } from "../weighted";

describe("OptimizedRoutes", () => {
  describe("Simple: picks higher liquidity routes", () => {
    test("picks higher liquidity pool", () => {
      const pools = [
        makeWeightedPool({
          id: "2",
          firstPoolAsset: { amount: "1000" },
          secondPoolAsset: { amount: "1000" },
        }),
        makeWeightedPool(),
      ];

      const router = new OptimizedRoutes(pools, [], "ufoo");

      const routes = router.getOptimizedRoutesByTokenIn(
        {
          denom: "uion",
          amount: new Int("100"),
        },
        "uosmo",
        10
      );

      expect(routes.length).toBe(1);
      expect(routes[0].pools[0].id).toBe("1");
    });
    test("routes through 2 pools", () => {
      const pools = [
        makeWeightedPool(), // uion => uosmo
        makeWeightedPool({
          // uosmo => ujuno
          id: "2",
          firstPoolAsset: { denom: "uosmo" },
          secondPoolAsset: { denom: "ujuno" },
        }),
      ];

      const router = new OptimizedRoutes(pools, [], "ufoo");

      const routes = router.getOptimizedRoutesByTokenIn(
        {
          denom: "uion",
          amount: new Int("100"),
        },
        "ujuno",
        10
      );

      expect(routes.length).toBe(1);
      expect(routes[0].pools.length).toBe(2);
      expect(routes[0].pools[0].id).toBe("1");
    });
    test("routes through 2 pools, one weighted, one stable", () => {
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

      const router = new OptimizedRoutes(pools, [], "ufoo");

      const routes = router.getOptimizedRoutesByTokenIn(
        {
          denom: "uion",
          amount: new Int("100"),
        },
        "uusdc",
        10
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

      const router = new OptimizedRoutes(pools, [], "ufoo");

      expect(() =>
        router.getOptimizedRoutesByTokenIn(
          {
            denom: "uion",
            amount: new Int("100"),
          },
          "uusdc",
          10
        )
      ).toThrow();
    });
  });

  describe("scaling factors with stable pools", () => {
    // test("scaling factors don't affect amounts", () => {
    //   const normalPools = [
    //     makeStablePool({
    //       firstPoolAsset: { denom: "uust" },
    //       secondPoolAsset: { denom: "uusdc" },
    //     }),
    //     makeStablePool({
    //       id: "2",
    //       firstPoolAsset: { denom: "uusdc" },
    //       secondPoolAsset: { denom: "uusdt" },
    //     }),
    //   ];
    //   const scaledPools = [
    //     makeStablePool({
    //       firstPoolAsset: { denom: "uust" },
    //       secondPoolAsset: { denom: "uusdc" },
    //     }),
    //     makeStablePool({
    //       id: "2",
    //       firstPoolAsset: { denom: "uusdc", scalingFactor: "10000" },
    //       secondPoolAsset: { denom: "uusdt", scalingFactor: "10000" },
    //     }),
    //   ];
    //   const normalRouter = new OptimizedRoutes(normalPools, [], "ufoo");
    //   const scaledRouter = new OptimizedRoutes(scaledPools, [], "ufoo");
    //   const normalRoutes = normalRouter.getOptimizedRoutesByTokenIn(
    //     {
    //       denom: "uust",
    //       amount: new Int("100"),
    //     },
    //     "uusdt",
    //     10
    //   );
    //   const scaledRoutes = scaledRouter.getOptimizedRoutesByTokenIn(
    //     {
    //       denom: "uust",
    //       amount: new Int("100"),
    //     },
    //     "uusdt",
    //     10
    //   );
    //   const normalOut = normalRouter.calculateTokenOutByTokenIn(normalRoutes);
    //   const scaledOut = scaledRouter.calculateTokenOutByTokenIn(scaledRoutes);
    //   expect(scaledOut.amount.toString()).toEqual(normalOut.amount.toString());
    // });
  });

  describe("OSMO fee discount", () => {
    test("2 pools with 1% fee", () => {
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

      const discountedRouter = new OptimizedRoutes(pools, ["1", "2"], "uosmo");
      // no incentivized pool ids, and a random denom is given
      const nondiscountedRouter = new OptimizedRoutes(pools, [], "ufoo");

      const discountedRoutes = discountedRouter.getOptimizedRoutesByTokenIn(
        {
          denom: "uion",
          amount: new Int("100000"), // amount out gets truncated, so can only see the amount diff w/ larger trades since the fee is already v small
        },
        "ujuno",
        10
      );
      const nondiscountedRoutes =
        nondiscountedRouter.getOptimizedRoutesByTokenIn(
          {
            denom: "uion",
            amount: new Int("100000"),
          },
          "ujuno",
          10
        );
      const discoutedOut =
        discountedRouter.calculateTokenOutByTokenIn(discountedRoutes);
      const nondiscountedOut =
        nondiscountedRouter.calculateTokenOutByTokenIn(nondiscountedRoutes);

      const parsedDiscountAmt = parseInt(discoutedOut.amount.toString());
      const parsedNonDiscountAmt = parseInt(nondiscountedOut.amount.toString());
      expect(parsedDiscountAmt).toBeGreaterThan(parsedNonDiscountAmt); // user gets more out
    });
    test("2 pools with different (small, large) fees", () => {
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
      const largeFeeRouter = new OptimizedRoutes(
        poolsWithALargeFee,
        ["1", "2"],
        "uosmo"
      );
      const smallFeeRouter = new OptimizedRoutes(
        poolsWithSameOnePercFee,
        ["1", "2"],
        "uosmo"
      );

      const largeFeeRoutes = largeFeeRouter.getOptimizedRoutesByTokenIn(
        {
          denom: "uion",
          amount: new Int("100000"), // amount out gets truncated, so can only see the amount diff w/ larger trades since the fee is already v small
        },
        "ujuno",
        10
      );
      const smallFeeRoutes = smallFeeRouter.getOptimizedRoutesByTokenIn(
        {
          denom: "uion",
          amount: new Int("100000"),
        },
        "ujuno",
        10
      );
      const largeFeeOut =
        largeFeeRouter.calculateTokenOutByTokenIn(largeFeeRoutes);
      const smallFeeOut =
        smallFeeRouter.calculateTokenOutByTokenIn(smallFeeRoutes);

      const parsedLargeFeeOut = parseInt(largeFeeOut.amount.toString());
      const parsedSmallFeeOut = parseInt(smallFeeOut.amount.toString());
      expect(parsedLargeFeeOut).toBeLessThan(parsedSmallFeeOut); // user gets less out since fee is big
    });
    //   test("no fee discount for route w/ 3 pools", () => {
    //     const pools = [
    //       makeWeightedPool({
    //         firstPoolAsset: { amount: "100000000000000" },
    //         secondPoolAsset: { amount: "100000000000000" },
    //       }),
    //       makeWeightedPool({
    //         id: "2",
    //         firstPoolAsset: { denom: "uosmo", amount: "100000000000000" },
    //         secondPoolAsset: { denom: "uust", amount: "100000000000000" },
    //       }),
    //       makeWeightedPool({
    //         id: "3",
    //         firstPoolAsset: { denom: "uust", amount: "100000000000000" },
    //         secondPoolAsset: { denom: "uusdc", amount: "100000000000000" },
    //       }),
    //     ];

    //     const discountedRouter = new OptimizedRoutes(pools, ["1", "2"], "uosmo");
    //     // no incentivized pool ids, and a random denom is given
    //     const nondiscountedRouter = new OptimizedRoutes(pools, [], "ufoo");

    //     const discountedRoutes = discountedRouter.getOptimizedRoutesByTokenIn(
    //       {
    //         denom: "uion",
    //         amount: new Int("100"), // amount out gets truncated, so can only see the amount diff w/ larger trades since the fee is already v small
    //       },
    //       "uusdc",
    //       10
    //     );
    //     const nondiscountedRoutes =
    //       nondiscountedRouter.getOptimizedRoutesByTokenIn(
    //         {
    //           denom: "uion",
    //           amount: new Int("100"),
    //         },
    //         "uusdc",
    //         10
    //       );
    //     const discoutedOut =
    //       discountedRouter.calculateTokenOutByTokenIn(discountedRoutes);
    //     const nondiscountedOut =
    //       nondiscountedRouter.calculateTokenOutByTokenIn(nondiscountedRoutes);

    //     const parsedDiscountAmt = parseInt(discoutedOut.amount.toString());
    //     const parsedNonDiscountAmt = parseInt(nondiscountedOut.amount.toString());
    //     expect(parsedDiscountAmt).toEqual(parsedNonDiscountAmt); // user gets more out
    //   });
  });
});

function makeWeightedPool(
  poolParams: Partial<{
    id: string;
    swapFee: string;
    firstPoolAsset: Partial<{
      denom: string;
      amount: string;
      weight: string;
    }>;
    secondPoolAsset: Partial<{
      denom: string;
      amount: string;
      weight: string;
    }>;
    totalWeight: string;
  }> = {}
): WeightedPool {
  const {
    id,
    swapFee,
    firstPoolAsset,
    secondPoolAsset,
    totalWeight,
  }: Parameters<typeof makeWeightedPool>[0] = deepmerge(
    {
      id: "1",
      swapFee: "0.01",
      firstPoolAsset: {
        denom: "uion",
        amount: "10000",
        weight: "5368709120",
      },
      secondPoolAsset: {
        denom: "uosmo",
        amount: "10000",
        weight: "5368709120",
      },
      totalWeight: "10737418240",
    },
    poolParams
  );
  return new WeightedPool(
    JSON.parse(
      `{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1500hy75krs9e8t50aav6fahk8sxhajn9ctp40qwvvn8tcprkk6wszun4a5","id":"${id}","pool_params":{"swap_fee":"${swapFee}","exit_fee":"0.010000000000000000","smooth_weight_change_params":null},"future_pool_governor":"168h","total_shares":{"denom":"gamm/pool/${id}","amount":"100000000000000000000"},"pool_assets":[{"token":{"denom":"${firstPoolAsset.denom}","amount":"${firstPoolAsset.amount}"},"weight":"${firstPoolAsset.weight}"},{"token":{"denom":"${secondPoolAsset.denom}","amount":"${secondPoolAsset.amount}"},"weight":"${secondPoolAsset.weight}"}],"total_weight":"${totalWeight}"}`
    )
  );
}

function makeStablePool(
  poolParams: Partial<{
    id: string;
    swapFee: string;
    firstPoolAsset: Partial<{
      denom: string;
      amount: string;
      scalingFactor: string;
    }>;
    secondPoolAsset: Partial<{
      denom: string;
      amount: string;
      scalingFactor: string;
    }>;
  }> = {}
): StablePool {
  const {
    id,
    swapFee,
    firstPoolAsset,
    secondPoolAsset,
  }: Parameters<typeof makeStablePool>[0] = deepmerge(
    {
      id: "1",
      swapFee: "0.01",
      firstPoolAsset: {
        denom: "uion",
        amount: "10000",
        scalingFactor: "1",
      },
      secondPoolAsset: {
        denom: "uosmo",
        amount: "10000",
        scalingFactor: "1",
      },
    },
    poolParams
  );
  return new StablePool(
    JSON.parse(
      `{"@type":"/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool","address":"osmo1mw0ac6rwlp5r8wapwk3zs6g29h8fcscxqakdzw9emkne6c8wjp9q0t3v8t","id":"${id}","pool_params":{"swap_fee":"${swapFee}","exit_fee":"0.010000000000000000"},"future_pool_governor":"","total_shares":{"denom":"gamm/pool/${id}","amount":"100000000000000000000"},"pool_liquidity":[{"denom":"${firstPoolAsset.denom}","amount":"${firstPoolAsset.amount}"},{"denom":"${secondPoolAsset.denom}","amount":"${secondPoolAsset.amount}"}],"scaling_factors":["${firstPoolAsset.scalingFactor}","${secondPoolAsset.scalingFactor}"],"scaling_factor_controller":""}`
    )
  );
}
