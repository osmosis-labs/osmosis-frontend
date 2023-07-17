import { Dec, DecUtils } from "@keplr-wallet/unit";

import { PoolRaw } from "../../queries/pools";
import { FilteredPools } from "./types";

export function makePoolRawFromFilteredPool(
  filteredPool: FilteredPools["pools"][0]
): PoolRaw | undefined {
  // deny pools containing tokens with gamm denoms
  if (filteredPool.pool_tokens.some((token) => token.denom.includes("gamm"))) {
    return;
  }

  if (filteredPool.type === "osmosis.concentratedliquidity.v1beta1.Pool") {
    return {
      "@type": `/${filteredPool.type}`,
      address: filteredPool.address,
      id: filteredPool.pool_id.toString(),
      current_tick_liquidity: filteredPool.current_tick_liquidity,
      token0: filteredPool.pool_tokens[1].denom,
      token1: filteredPool.pool_tokens[0].denom,
      current_sqrt_price: filteredPool.current_sqrt_price,
      current_tick: filteredPool.current_tick,
      tick_spacing: filteredPool.tick_spacing,
      exponent_at_price_one: filteredPool.exponent_at_price_one,
      spread_factor: filteredPool.spread_factor,
    };
  }

  const sharePoolBase = {
    "@type": `/${filteredPool.type}`,
    id: filteredPool.pool_id.toString(),
    pool_params: {
      exit_fee: new Dec(filteredPool.exit_fees.toString())
        .mul(DecUtils.getTenExponentN(-2))
        .toString(),
      swap_fee: new Dec(filteredPool.swap_fees.toString())
        .mul(DecUtils.getTenExponentN(-2))
        .toString(),
      smooth_weight_change_params: null,
    },
    total_shares: filteredPool.total_shares,
  };

  if (filteredPool.type === "osmosis.gamm.v1beta1.Pool") {
    return {
      ...sharePoolBase,
      pool_assets: filteredPool.pool_tokens.map((token) => ({
        token: {
          denom: token.denom,
          amount: floatNumberToStringInt(token.amount, token.exponent),
        },
        weight: token.weight_or_scaling.toString(),
      })),
      total_weight: filteredPool.total_weight_or_scaling.toString(),
    };
  }

  if (filteredPool.type === "osmosis.gamm.poolmodels.stableswap.v1beta1.Pool") {
    return {
      ...sharePoolBase,
      pool_liquidity: filteredPool.pool_tokens.map((token) => ({
        denom: token.denom,
        amount: floatNumberToStringInt(token.amount, token.exponent),
      })),
      scaling_factors: filteredPool.pool_tokens.map((token) =>
        token.weight_or_scaling.toString()
      ),
      scaling_factor_controller: "", // TODO: add scaling factor controller in imperator query
    };
  }

  throw new Error(
    "Filtered imperator pool not properly serialized as either a balancer or stable pool."
  );
}

function floatNumberToStringInt(number: number, exponent: number): string {
  return new Dec(number.toString())
    .mul(DecUtils.getTenExponentN(exponent))
    .truncate()
    .toString();
}
