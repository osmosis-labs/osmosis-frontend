import { MsgTransferAmino } from "@osmosis-labs/proto-codecs/build/codegen/ibc/applications/transfer/v1/tx";
import {
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
          timeoutTimestamp,
        }: MsgTransfer): MsgTransferAmino => ({
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
                revision_number:
                  timeoutHeight.revisionNumber?.toString() !== "0"
                    ? timeoutHeight.revisionNumber?.toString()
                    : undefined,
              }
            : {},
          ...(timeoutTimestamp && {
            timeout_timestamp: timeoutTimestamp.toString(),
          }),
        }),
        fromAmino: ({
          source_port,
          source_channel,
          token,
          sender,
          receiver,
          timeout_height,
          timeout_timestamp,
        }: MsgTransferAmino): MsgTransfer => {
          return {
            sourcePort: source_port ?? "",
            sourceChannel: source_channel ?? "",
            token: {
              denom: token?.denom ?? "",
              amount: token?.amount ?? "",
            },
            sender: sender ?? "",
            receiver: receiver ?? "",
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
