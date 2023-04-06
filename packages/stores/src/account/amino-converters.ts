import { AminoMsgTransfer } from "@cosmjs/stargate";
import Long from "long";
import {
  cosmosAminoConverters,
  cosmwasmAminoConverters,
  ibcAminoConverters as osmojsIbcAminoConverters,
  osmosisAminoConverters as osmojsOsmosisAminoConverters,
} from "osmojs";
import { MsgTransfer } from "osmojs/types/codegen/ibc/applications/transfer/v1/tx";
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
    fromAmino: ({
      sender,
      pool_params,
      pool_assets,
      future_pool_governor,
    }: Parameters<
      typeof osmojsOsmosisAminoConverters["/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool"]["fromAmino"]
    >[0]): MsgCreateBalancerPool => {
      return {
        sender,
        poolParams: {
          swapFee: pool_params.swap_fee,
          exitFee: pool_params.exit_fee,
        },
        poolAssets: pool_assets.map((el0) => ({
          token: {
            denom: el0.token.denom,
            amount: el0.token.amount,
          },
          weight: el0.weight,
        })),
        futurePoolGovernor: future_pool_governor,
      };
    },
  },
};

const ibcAminoConverters: Record<
  keyof typeof osmojsIbcAminoConverters,
  {
    aminoType: string;
    toAmino: (msg: any) => any;
    fromAmino: (msg: any) => any;
  }
> = {
  ...osmojsIbcAminoConverters,
  "/ibc.applications.transfer.v1.MsgTransfer": {
    ...osmojsIbcAminoConverters["/ibc.applications.transfer.v1.MsgTransfer"],
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
        amount: token?.amount ? Long.fromValue(token.amount).toString() : "0",
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
