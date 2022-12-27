import { Dec, DecUtils } from "@keplr-wallet/unit";
import { PoolRaw } from "../../queries/pools";
import { FilteredPools } from "./types";

export function makePoolRawFromFilteredPool(
  filteredPool: FilteredPools["pools"][0]
): PoolRaw {
  const base = {
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
      ...base,
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
      ...base,
      pool_liquidity: filteredPool.pool_tokens.map((token) => ({
        denom: token.denom,
        amount: floatNumberToStringInt(token.amount, token.exponent),
      })),
      scaling_factors: filteredPool.pool_tokens.map((token) =>
        token.weight_or_scaling.toString()
      ),
      scaling_factor_controller: "", // TOOD: add scaling factor controller in imperator query
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
