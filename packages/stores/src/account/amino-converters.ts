import { AminoMsgTransfer } from "@cosmjs/stargate";
import {
  cosmos,
  cosmosAminoConverters,
  cosmwasmAminoConverters,
  ibcAminoConverters as originalIbcAminoConverters,
  osmosisAminoConverters as originalOsmosisAminoConverters,
} from "@osmosis-labs/proto-codecs";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import Long from "long";

const osmosisAminoConverters: Record<
  keyof typeof originalOsmosisAminoConverters,
  {
    aminoType: string;
    toAmino: (msg: any) => any;
    fromAmino: (msg: any) => any;
  }
> = {
  ...originalOsmosisAminoConverters,
  "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool":
    {
      ...originalOsmosisAminoConverters[
        "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool"
      ],
      aminoType: "osmosis/cl-create-pool",
    },
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
