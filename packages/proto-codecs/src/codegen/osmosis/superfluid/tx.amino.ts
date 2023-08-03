//@ts-nocheck
import {
  MsgAddToConcentratedLiquiditySuperfluidPosition,
  MsgCreateFullRangePositionAndSuperfluidDelegate,
  MsgLockAndSuperfluidDelegate,
  MsgLockExistingFullRangePositionAndSFStake,
  MsgSuperfluidDelegate,
  MsgSuperfluidUnbondLock,
  MsgSuperfluidUndelegate,
  MsgSuperfluidUndelegateAndUnbondLock,
  MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition,
  MsgUnPoolWhitelistedPool,
} from "./tx";
export const AminoConverter = {
  "/osmosis.superfluid.MsgSuperfluidDelegate": {
    aminoType: "osmosis/superfluid-delegate",
    toAmino: MsgSuperfluidDelegate.toAmino,
    fromAmino: MsgSuperfluidDelegate.fromAmino,
  },
  "/osmosis.superfluid.MsgSuperfluidUndelegate": {
    aminoType: "osmosis/superfluid-undelegate",
    toAmino: MsgSuperfluidUndelegate.toAmino,
    fromAmino: MsgSuperfluidUndelegate.fromAmino,
  },
  "/osmosis.superfluid.MsgSuperfluidUnbondLock": {
    aminoType: "osmosis/superfluid-unbond-lock",
    toAmino: MsgSuperfluidUnbondLock.toAmino,
    fromAmino: MsgSuperfluidUnbondLock.fromAmino,
  },
  "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock": {
    aminoType: "osmosis/superfluid-undelegate-and-unbond-lock",
    toAmino: MsgSuperfluidUndelegateAndUnbondLock.toAmino,
    fromAmino: MsgSuperfluidUndelegateAndUnbondLock.fromAmino,
  },
  "/osmosis.superfluid.MsgLockAndSuperfluidDelegate": {
    aminoType: "osmosis/lock-and-superfluid-delegate",
    toAmino: MsgLockAndSuperfluidDelegate.toAmino,
    fromAmino: MsgLockAndSuperfluidDelegate.fromAmino,
  },
  "/osmosis.superfluid.MsgCreateFullRangePositionAndSuperfluidDelegate": {
    aminoType: "osmosis/full-range-and-sf-delegate",
    toAmino: MsgCreateFullRangePositionAndSuperfluidDelegate.toAmino,
    fromAmino: MsgCreateFullRangePositionAndSuperfluidDelegate.fromAmino,
  },
  "/osmosis.superfluid.MsgUnPoolWhitelistedPool": {
    aminoType: "osmosis/unpool-whitelisted-pool",
    toAmino: MsgUnPoolWhitelistedPool.toAmino,
    fromAmino: MsgUnPoolWhitelistedPool.fromAmino,
  },
  "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition":
    {
      aminoType: "osmosis/unlock-and-migrate",
      toAmino: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.toAmino,
      fromAmino:
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.fromAmino,
    },
  "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPosition": {
    aminoType: "osmosis/add-to-cl-superfluid-position",
    toAmino: MsgAddToConcentratedLiquiditySuperfluidPosition.toAmino,
    fromAmino: MsgAddToConcentratedLiquiditySuperfluidPosition.fromAmino,
  },
  "/osmosis.superfluid.MsgLockExistingFullRangePositionAndSFStake": {
    aminoType: "osmosis/lock-existing-full-range-and-sf-stake",
    toAmino: MsgLockExistingFullRangePositionAndSFStake.toAmino,
    fromAmino: MsgLockExistingFullRangePositionAndSFStake.fromAmino,
  },
};
