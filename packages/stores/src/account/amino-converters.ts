import { AminoMsgTransfer } from "@cosmjs/stargate";
import {
  cosmosAminoConverters,
  cosmwasmAminoConverters,
  ibcAminoConverters as originalIbcAminoConverters,
  osmosisAminoConverters as originalOsmosisAminoConverters,
} from "@osmosis-labs/proto-codecs";
import { MsgCreateConcentratedPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/concentrated-liquidity/pool-model/concentrated/tx";
import { MsgCreateBalancerPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/pool-models/balancer/tx/tx";
import { MsgCreateStableswapPool } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/pool-models/stableswap/tx";
import { MsgLockTokens } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/lockup/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import Long from "long";

import { changeDecStringToProtoBz } from "./utils";

const osmosisAminoConverters: Record<
  keyof typeof originalOsmosisAminoConverters,
  {
    aminoType: string;
    toAmino: (msg: any) => any;
    fromAmino: (msg: any) => any;
  }
> = {
  ...originalOsmosisAminoConverters,
  "/osmosis.lockup.MsgBeginUnlocking": {
    ...originalOsmosisAminoConverters["/osmosis.lockup.MsgBeginUnlocking"],
    // The amino type in telescope is not compatible with our nodes.
    aminoType: "osmosis/lockup/begin-unlock-period-lock",
  },
  "/osmosis.lockup.MsgLockTokens": {
    ...originalOsmosisAminoConverters["/osmosis.lockup.MsgLockTokens"],
    /**
     * Duration type definition in telescope crashes toAmino as it does a wrong conversion.
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
  "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool": {
    ...originalOsmosisAminoConverters[
      "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool"
    ],
    toAmino: ({
      sender,
      poolParams,
      futurePoolGovernor,
      initialPoolLiquidity,
      scalingFactorController,
      scalingFactors,
    }: MsgCreateStableswapPool) => {
      return {
        sender,
        pool_params: {
          swap_fee: poolParams?.swapFee,
          exit_fee: poolParams?.exitFee,
        },
        initial_pool_liquidity: Array.isArray(initialPoolLiquidity)
          ? initialPoolLiquidity.map(({ denom, amount }) => ({
              denom,
              amount,
            }))
          : [],
        scaling_factors: Array.isArray(scalingFactors)
          ? scalingFactors.map((e) => e.toString())
          : [],
        future_pool_governor: futurePoolGovernor,
        scaling_factor_controller: scalingFactorController
          ? scalingFactorController
          : undefined,
      };
    },
    fromAmino: ({
      sender,
      pool_params,
      future_pool_governor,
      initial_pool_liquidity,
      scaling_factor_controller,
      scaling_factors,
    }: Parameters<
      (typeof originalOsmosisAminoConverters)["/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool"]["fromAmino"]
    >[0]): MsgCreateStableswapPool => {
      return {
        sender,
        poolParams: {
          swapFee: pool_params?.swap_fee
            ? changeDecStringToProtoBz(pool_params.swap_fee)
            : changeDecStringToProtoBz("0.000000000000000000"),
          exitFee: pool_params?.exit_fee
            ? changeDecStringToProtoBz(pool_params.exit_fee)
            : changeDecStringToProtoBz("0.000000000000000000"),
        },
        initialPoolLiquidity: Array.isArray(initial_pool_liquidity)
          ? initial_pool_liquidity.map(({ denom, amount }) => ({
              denom,
              amount,
            }))
          : [],
        scalingFactors: Array.isArray(scaling_factors)
          ? scaling_factors.map((e: any) => e)
          : [],
        futurePoolGovernor: future_pool_governor,
        scalingFactorController: scaling_factor_controller,
      };
    },
  },
  "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool": {
    ...originalOsmosisAminoConverters[
      "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool"
    ],
    // The amino type in telescope is not compatible with nodes.
    aminoType: "osmosis/gamm/create-balancer-pool",
    // Our pools do not require the `smooth_weight_change_params`
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
              : "0",
          },
          weight: asset.weight,
        })),
        future_pool_governor: futurePoolGovernor,
      };
    },
    fromAmino: ({
      sender,
      pool_params,
      pool_assets,
      future_pool_governor,
    }: Parameters<
      (typeof originalOsmosisAminoConverters)["/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool"]["fromAmino"]
    >[0]): MsgCreateBalancerPool => {
      return {
        sender,
        poolParams: {
          swapFee: pool_params?.swap_fee
            ? changeDecStringToProtoBz(pool_params.swap_fee)
            : changeDecStringToProtoBz("0.000000000000000000"),
          exitFee: pool_params?.exit_fee
            ? changeDecStringToProtoBz(pool_params.exit_fee)
            : changeDecStringToProtoBz("0.000000000000000000"),
        },
        poolAssets: pool_assets.map((el0) => ({
          token: {
            denom: el0?.token?.denom ?? "",
            amount: el0?.token?.amount ?? "0",
          },
          weight: el0.weight,
        })),
        futurePoolGovernor: future_pool_governor,
      };
    },
  },
  "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock": {
    ...originalOsmosisAminoConverters[
      "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock"
    ],
    aminoType: "osmosis/sf-undelegate-and-unbond-lock",
  },
  "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition":
    {
      ...originalOsmosisAminoConverters[
        "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition"
      ],
      aminoType: "osmosis/unlock-and-migrate",
    },
  "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPosition": {
    ...originalOsmosisAminoConverters[
      "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPosition"
    ],
    aminoType: "osmosis/add-to-cl-superfluid-position",
  },
  "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool":
    {
      ...originalOsmosisAminoConverters[
        "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool"
      ],
      aminoType: "osmosis/cl-create-pool",
      toAmino: ({
        sender,
        denom0,
        denom1,
        spreadFactor,
        tickSpacing,
      }: MsgCreateConcentratedPool): Parameters<
        (typeof originalOsmosisAminoConverters)["/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool"]["fromAmino"]
      >[0] => {
        return {
          sender,
          denom0: denom0,
          denom1: denom1,
          spread_factor: spreadFactor,
          tick_spacing: tickSpacing.toString(),
        };
      },
      fromAmino: ({
        sender,
        denom0,
        denom1,
        spread_factor,
        tick_spacing,
      }: Parameters<
        (typeof originalOsmosisAminoConverters)["/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool"]["fromAmino"]
      >[0]): MsgCreateConcentratedPool => {
        return {
          sender,
          denom0: denom0,
          denom1: denom1,
          spreadFactor: changeDecStringToProtoBz(spread_factor),
          tickSpacing: tick_spacing.toString() as any,
        };
      },
    },
};

const ibcAminoConverters: Record<
  keyof typeof originalIbcAminoConverters,
  {
    aminoType: string;
    toAmino: (msg: any) => any;
    fromAmino: (msg: any) => any;
  }
> = {
  ...originalIbcAminoConverters,
  "/ibc.applications.transfer.v1.MsgTransfer": {
    ...originalIbcAminoConverters["/ibc.applications.transfer.v1.MsgTransfer"],
    // Remove timeout_timestamp as it is not used by our transactions.
    toAmino: ({
      sourcePort,
      sourceChannel,
      token,
      sender,
      receiver,
      timeoutHeight,
    }: MsgTransfer) => ({
      source_port: sourcePort,
      source_channel: sourceChannel,
      token: {
        denom: token?.denom,
        amount: token?.amount ?? "0",
      },
      sender,
      receiver,
      timeout_height: timeoutHeight
        ? {
            revision_height: timeoutHeight.revisionHeight?.toString(),
            revision_number: timeoutHeight.revisionNumber?.toString(),
          }
        : {},
    }),
    fromAmino: ({
      source_port,
      source_channel,
      token,
      sender,
      receiver,
      timeout_height,
      timeout_timestamp,
    }: AminoMsgTransfer["value"]): MsgTransfer => {
      return {
        sourcePort: source_port,
        sourceChannel: source_channel,
        token: {
          denom: token?.denom ?? "",
          amount: token?.amount ?? "",
        },
        sender,
        receiver,
        timeoutHeight: timeout_height
          ? {
              revisionHeight: Long.fromString(
                timeout_height.revision_height || "0",
                true
              ),
              revisionNumber: Long.fromString(
                timeout_height.revision_number || "0",
                true
              ),
            }
          : undefined,
        timeoutTimestamp: Long.fromString(timeout_timestamp ?? "0"),
      };
    },
  },
};

export const aminoConverters = {
  ...cosmwasmAminoConverters,
  ...cosmosAminoConverters,
  ...ibcAminoConverters,
  ...osmosisAminoConverters,
};
