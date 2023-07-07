import { AminoMsgTransfer } from "@cosmjs/stargate";
import {
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
  "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock": {
    ...originalOsmosisAminoConverters[
      "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock"
    ],
    aminoType: "osmosis/sf-undelegate-and-unbond-lock",
  },
  "/osmosis.superfluid.MsgLockExistingFullRangePositionAndSFStake": {
    ...originalOsmosisAminoConverters[
      "/osmosis.superfluid.MsgLockExistingFullRangePositionAndSFStake"
    ],
    aminoType: "osmosis/lock-existing-full-range-and-sf-stake",
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
  "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition": {
    ...originalOsmosisAminoConverters[
      "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition"
    ],
    aminoType: "osmosis/cl-create-position",
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition": {
    ...originalOsmosisAminoConverters[
      "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition"
    ],
    aminoType: "osmosis/cl-withdraw-position",
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition": {
    ...originalOsmosisAminoConverters[
      "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition"
    ],
    aminoType: "osmosis/cl-add-to-position",
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards": {
    ...originalOsmosisAminoConverters[
      "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards"
    ],
    aminoType: "osmosis/cl-col-sp-rewards",
  },
  "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives": {
    ...originalOsmosisAminoConverters[
      "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives"
    ],
    aminoType: "osmosis/cl-collect-incentives",
  },
  "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool":
    {
      ...originalOsmosisAminoConverters[
        "/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool"
      ],
      aminoType: "osmosis/cl-create-pool",
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
