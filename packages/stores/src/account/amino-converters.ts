import Long from "long";
import {
  cosmosAminoConverters,
  ibcAminoConverters,
  osmosisAminoConverters as osmojsOsmosisAminoConverters,
} from "osmojs";
import { MsgCreateBalancerPool } from "osmojs/types/codegen/osmosis/gamm/pool-models/balancer/tx/tx";
import { MsgLockTokens } from "osmojs/types/codegen/osmosis/lockup/tx";

const osmosisAminoConverters: Record<
  keyof typeof osmojsOsmosisAminoConverters,
  {
    aminoType: string;
    toAmino: (msg: any) => any;
    fromAmino: (msg: any) => any;
  }
> = {
  ...osmojsOsmosisAminoConverters,
  "/osmosis.lockup.MsgBeginUnlocking": {
    ...osmojsOsmosisAminoConverters["/osmosis.lockup.MsgBeginUnlocking"],
    // Modifying `aminoType` because the amino type in telescope is not compatible with our nodes.
    aminoType: "osmosis/lockup/begin-unlock-period-lock",
  },
  "/osmosis.lockup.MsgLockTokens": {
    ...osmojsOsmosisAminoConverters["/osmosis.lockup.MsgLockTokens"],
    /**
     * Modifying because Duration type definition in telescope is wrong.
     * @see https://github.com/osmosis-labs/osmojs/issues/12
     * @see https://github.com/osmosis-labs/telescope/issues/211
     */
    toAmino: ({ owner, duration, coins }: MsgLockTokens) => {
      return {
        owner,
        duration: duration?.nanos ? (duration?.nanos).toString() : undefined,
        coins: coins.map((coin) => ({
          denom: coin.denom,
          amount: coin.amount,
        })),
      };
    },
  },
  "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool": {
    ...osmojsOsmosisAminoConverters[
      "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool"
    ],
    // Modifying because the amino type in telescope is not compatible with nodes.
    aminoType: "osmosis/gamm/create-balancer-pool",
    // Modifying because our pools do not require the `smooth_weight_change_params`
    toAmino: ({
      sender,
      poolParams,
      poolAssets,
      futurePoolGovernor,
    }: MsgCreateBalancerPool) => {
      return {
        sender,
        pool_params: {
          swap_fee: poolParams?.swapFee,
          exit_fee: poolParams?.exitFee,
        },
        pool_assets: poolAssets.map((asset) => ({
          token: {
            denom: asset?.token?.denom,
            amount: asset?.token?.amount
              ? Long.fromValue(asset?.token?.amount).toString()
              : "",
          },
          weight: asset.weight,
        })),
        future_pool_governor: futurePoolGovernor,
      };
    },
  },
};

export const aminoConverters = {
  ...cosmosAminoConverters,
  ...ibcAminoConverters,
  ...osmosisAminoConverters,
};
