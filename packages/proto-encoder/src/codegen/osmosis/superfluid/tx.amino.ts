//@ts-nocheck
/* eslint-disable */
import {
  MsgSuperfluidDelegate,
  MsgSuperfluidUndelegate,
  MsgSuperfluidUnbondLock,
  MsgSuperfluidUndelegateAndUnbondLock,
  MsgLockAndSuperfluidDelegate,
  MsgUnPoolWhitelistedPool,
  MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition,
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
  "/osmosis.superfluid.MsgUnPoolWhitelistedPool": {
    aminoType: "osmosis/unpool-whitelisted-pool",
    toAmino: MsgUnPoolWhitelistedPool.toAmino,
    fromAmino: MsgUnPoolWhitelistedPool.fromAmino,
  },
  "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition":
    {
      aminoType:
        "osmosis/unlock-and-migrate-shares-to-full-range-concentrated-position",
      toAmino: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.toAmino,
      fromAmino:
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.fromAmino,
    },
};
