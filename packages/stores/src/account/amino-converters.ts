import type { AminoMsgTransfer } from "@cosmjs/stargate";
import type {
  MsgCreateConcentratedPool,
  MsgCreateConcentratedPoolAmino,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/concentratedliquidity/poolmodel/concentrated/v1beta1/tx";
import type {
  MsgWithdrawPosition,
  MsgWithdrawPositionAmino,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/concentratedliquidity/v1beta1/tx";
import type {
  MsgCreateBalancerPool,
  MsgCreateBalancerPoolAmino,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/poolmodels/balancer/v1beta1/tx";
import type {
  MsgCreateStableswapPool,
  MsgCreateStableswapPoolAmino,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/poolmodels/stableswap/v1beta1/tx";
import type {
  MsgBeginUnlocking,
  MsgBeginUnlockingAmino,
} from "@osmosis-labs/proto-codecs/build/codegen/osmosis/lockup/tx";
import type { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import Long from "long";

let aminoConverters: Record<string, any>;

export async function getAminoConverters() {
  if (!aminoConverters) {
    const {
      cosmos,
      cosmosAminoConverters,
      cosmwasmAminoConverters,
      ibcAminoConverters: originalIbcAminoConverters,
      osmosisAminoConverters: originalOsmosisAminoConverters,
    } = await import("@osmosis-labs/proto-codecs");

    const osmosisAminoConverters: Record<
      keyof typeof originalOsmosisAminoConverters,
      {
        aminoType: string;
        toAmino: (msg: any) => any;
        fromAmino: (msg: any) => any;
      }
    > = {
      ...originalOsmosisAminoConverters,
      "/osmosis.superfluid.MsgUnbondConvertAndStake": {
        ...originalOsmosisAminoConverters[
          "/osmosis.superfluid.MsgUnbondConvertAndStake"
        ],
        fromAmino: (msg: any) => ({
          lockId: BigInt(msg?.lock_id ?? 0),
          sender: msg.sender,
          valAddr: msg?.val_addr ?? "",
          minAmtToStake: msg.min_amt_to_stake,
          sharesToConvert: (
            msg === null || msg === void 0 ? void 0 : msg.shares_to_convert
          )
            ? cosmos.base.v1beta1.Coin.fromAmino(msg.shares_to_convert)
            : undefined,
        }),
      },
      "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition": {
        ...originalOsmosisAminoConverters[
          "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition"
        ],
        fromAmino(object: MsgWithdrawPositionAmino): MsgWithdrawPosition {
          const message =
            originalOsmosisAminoConverters[
              "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition"
            ].fromAmino(object);

          if (
            object.liquidity_amount !== undefined &&
            object.liquidity_amount !== null
          ) {
            message.liquidityAmount = object.liquidity_amount.replace(".", "");
          }
          return message;
        },
        toAmino(message: MsgWithdrawPosition): MsgWithdrawPositionAmino {
          const obj =
            originalOsmosisAminoConverters[
              "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition"
            ].toAmino(message);

          obj.liquidity_amount =
            message.liquidityAmount === ""
              ? undefined
              : message.liquidityAmount.replace(".", "");
          return obj;
        },
      },
      "/osmosis.lockup.MsgBeginUnlocking": {
        ...originalOsmosisAminoConverters["/osmosis.lockup.MsgBeginUnlocking"],
        toAmino(message: MsgBeginUnlocking): MsgBeginUnlockingAmino {
          const obj =
            originalOsmosisAminoConverters[
              "/osmosis.lockup.MsgBeginUnlocking"
            ].toAmino(message);
          if (obj.coins?.length === 0) {
            delete obj.coins;
          }
          return obj;
        },
      },
      "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool": {
        ...originalOsmosisAminoConverters[
          "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool"
        ],
        fromAmino(object: MsgCreateBalancerPoolAmino): MsgCreateBalancerPool {
          const message =
            originalOsmosisAminoConverters[
              "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool"
            ].fromAmino(object);

          if (message.poolParams) {
            message.poolParams.exitFee = message.poolParams.exitFee.replace(
              ".",
              ""
            );
            message.poolParams.swapFee = message.poolParams.swapFee.replace(
              ".",
              ""
            );
          }

          return message;
        },
        toAmino(message: MsgCreateBalancerPool): MsgCreateBalancerPoolAmino {
          const obj =
            originalOsmosisAminoConverters[
              "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool"
            ].toAmino(message);

          if (obj.pool_params && obj.pool_params.exit_fee) {
            obj.pool_params.exit_fee = obj.pool_params.exit_fee.replace(
              ".",
              ""
            );
            if (
              obj.pool_params.exit_fee.split("").every((fee) => fee === "0")
            ) {
              obj.pool_params.exit_fee = "0";
            }
          }

          if (obj.pool_params && obj.pool_params.swap_fee) {
            obj.pool_params.swap_fee = obj.pool_params.swap_fee.replace(
              ".",
              ""
            );
            if (
              obj.pool_params.swap_fee.split("").every((fee) => fee === "0")
            ) {
              obj.pool_params.swap_fee = "0";
            }
          }

          return obj;
        },
      },
      "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool":
        {
          ...originalOsmosisAminoConverters[
            "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool"
          ],
          aminoType: "osmosis/cl-create-pool",
          fromAmino(
            object: MsgCreateConcentratedPoolAmino
          ): MsgCreateConcentratedPool {
            const message =
              originalOsmosisAminoConverters[
                "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool"
              ].fromAmino(object);

            if (message.spreadFactor) {
              message.spreadFactor = message.spreadFactor.replace(".", "");
            }

            return message;
          },
          toAmino(
            message: MsgCreateConcentratedPool
          ): MsgCreateConcentratedPoolAmino {
            const obj =
              originalOsmosisAminoConverters[
                "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool"
              ].toAmino(message);

            if (obj.spread_factor) {
              obj.spread_factor = obj.spread_factor.replace(".", "");
              if (obj.spread_factor.split("").every((fee) => fee === "0")) {
                obj.spread_factor = "0";
              }
            }

            return obj;
          },
        },
      "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool": {
        ...originalOsmosisAminoConverters[
          "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool"
        ],
        fromAmino(
          object: MsgCreateStableswapPoolAmino
        ): MsgCreateStableswapPool {
          const message =
            originalOsmosisAminoConverters[
              "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool"
            ].fromAmino(object);

          if (message.poolParams) {
            message.poolParams.exitFee = message.poolParams.exitFee.replace(
              ".",
              ""
            );
            message.poolParams.swapFee = message.poolParams.swapFee.replace(
              ".",
              ""
            );
          }

          return message;
        },
        toAmino(
          message: MsgCreateStableswapPool
        ): MsgCreateStableswapPoolAmino {
          const obj =
            originalOsmosisAminoConverters[
              "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool"
            ].toAmino(message);

          if (obj.pool_params && obj.pool_params.exit_fee) {
            obj.pool_params.exit_fee = obj.pool_params.exit_fee.replace(
              ".",
              ""
            );
            if (
              obj.pool_params.exit_fee.split("").every((fee) => fee === "0")
            ) {
              obj.pool_params.exit_fee = "0";
            }
          }

          if (obj.pool_params && obj.pool_params.swap_fee) {
            obj.pool_params.swap_fee = obj.pool_params.swap_fee.replace(
              ".",
              ""
            );
            if (
              obj.pool_params.swap_fee.split("").every((fee) => fee === "0")
            ) {
              obj.pool_params.swap_fee = "0";
            }
          }

          return obj;
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
        ...originalIbcAminoConverters[
          "/ibc.applications.transfer.v1.MsgTransfer"
        ],
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

    aminoConverters = {
      ...cosmwasmAminoConverters,
      ...cosmosAminoConverters,
      ...ibcAminoConverters,
      ...osmosisAminoConverters,
    };
  }

  return aminoConverters;
}
