//@ts-nocheck
/* eslint-disable */
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import {
  MsgSuperfluidDelegate,
  MsgSuperfluidUndelegate,
  MsgSuperfluidUnbondLock,
  MsgSuperfluidUndelegateAndUnbondLock,
  MsgLockAndSuperfluidDelegate,
  MsgUnPoolWhitelistedPool,
  MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition,
} from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ["/osmosis.superfluid.MsgSuperfluidDelegate", MsgSuperfluidDelegate],
  ["/osmosis.superfluid.MsgSuperfluidUndelegate", MsgSuperfluidUndelegate],
  ["/osmosis.superfluid.MsgSuperfluidUnbondLock", MsgSuperfluidUnbondLock],
  [
    "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock",
    MsgSuperfluidUndelegateAndUnbondLock,
  ],
  [
    "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
    MsgLockAndSuperfluidDelegate,
  ],
  ["/osmosis.superfluid.MsgUnPoolWhitelistedPool", MsgUnPoolWhitelistedPool],
  [
    "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition",
    MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition,
  ],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    superfluidDelegate(value: MsgSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value: MsgSuperfluidDelegate.encode(value).finish(),
      };
    },
    superfluidUndelegate(value: MsgSuperfluidUndelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
        value: MsgSuperfluidUndelegate.encode(value).finish(),
      };
    },
    superfluidUnbondLock(value: MsgSuperfluidUnbondLock) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
        value: MsgSuperfluidUnbondLock.encode(value).finish(),
      };
    },
    superfluidUndelegateAndUnbondLock(
      value: MsgSuperfluidUndelegateAndUnbondLock
    ) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock",
        value: MsgSuperfluidUndelegateAndUnbondLock.encode(value).finish(),
      };
    },
    lockAndSuperfluidDelegate(value: MsgLockAndSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
        value: MsgLockAndSuperfluidDelegate.encode(value).finish(),
      };
    },
    unPoolWhitelistedPool(value: MsgUnPoolWhitelistedPool) {
      return {
        typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
        value: MsgUnPoolWhitelistedPool.encode(value).finish(),
      };
    },
    unlockAndMigrateSharesToFullRangeConcentratedPosition(
      value: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
    ) {
      return {
        typeUrl:
          "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition",
        value:
          MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.encode(
            value
          ).finish(),
      };
    },
  },
  withTypeUrl: {
    superfluidDelegate(value: MsgSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value,
      };
    },
    superfluidUndelegate(value: MsgSuperfluidUndelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
        value,
      };
    },
    superfluidUnbondLock(value: MsgSuperfluidUnbondLock) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
        value,
      };
    },
    superfluidUndelegateAndUnbondLock(
      value: MsgSuperfluidUndelegateAndUnbondLock
    ) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock",
        value,
      };
    },
    lockAndSuperfluidDelegate(value: MsgLockAndSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
        value,
      };
    },
    unPoolWhitelistedPool(value: MsgUnPoolWhitelistedPool) {
      return {
        typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
        value,
      };
    },
    unlockAndMigrateSharesToFullRangeConcentratedPosition(
      value: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
    ) {
      return {
        typeUrl:
          "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition",
        value,
      };
    },
  },
  fromPartial: {
    superfluidDelegate(value: MsgSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value: MsgSuperfluidDelegate.fromPartial(value),
      };
    },
    superfluidUndelegate(value: MsgSuperfluidUndelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
        value: MsgSuperfluidUndelegate.fromPartial(value),
      };
    },
    superfluidUnbondLock(value: MsgSuperfluidUnbondLock) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
        value: MsgSuperfluidUnbondLock.fromPartial(value),
      };
    },
    superfluidUndelegateAndUnbondLock(
      value: MsgSuperfluidUndelegateAndUnbondLock
    ) {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock",
        value: MsgSuperfluidUndelegateAndUnbondLock.fromPartial(value),
      };
    },
    lockAndSuperfluidDelegate(value: MsgLockAndSuperfluidDelegate) {
      return {
        typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
        value: MsgLockAndSuperfluidDelegate.fromPartial(value),
      };
    },
    unPoolWhitelistedPool(value: MsgUnPoolWhitelistedPool) {
      return {
        typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
        value: MsgUnPoolWhitelistedPool.fromPartial(value),
      };
    },
    unlockAndMigrateSharesToFullRangeConcentratedPosition(
      value: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
    ) {
      return {
        typeUrl:
          "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition",
        value:
          MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.fromPartial(
            value
          ),
      };
    },
  },
};
