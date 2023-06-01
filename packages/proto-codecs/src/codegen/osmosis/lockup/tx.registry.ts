//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import {
  MsgBeginUnlocking,
  MsgBeginUnlockingAll,
  MsgExtendLockup,
  MsgForceUnlock,
  MsgLockTokens,
  MsgSetRewardReceiverAddress,
} from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ["/osmosis.lockup.MsgLockTokens", MsgLockTokens],
  ["/osmosis.lockup.MsgBeginUnlockingAll", MsgBeginUnlockingAll],
  ["/osmosis.lockup.MsgBeginUnlocking", MsgBeginUnlocking],
  ["/osmosis.lockup.MsgExtendLockup", MsgExtendLockup],
  ["/osmosis.lockup.MsgForceUnlock", MsgForceUnlock],
  ["/osmosis.lockup.MsgSetRewardReceiverAddress", MsgSetRewardReceiverAddress],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    lockTokens(value: MsgLockTokens) {
      return {
        typeUrl: "/osmosis.lockup.MsgLockTokens",
        value: MsgLockTokens.encode(value).finish(),
      };
    },
    beginUnlockingAll(value: MsgBeginUnlockingAll) {
      return {
        typeUrl: "/osmosis.lockup.MsgBeginUnlockingAll",
        value: MsgBeginUnlockingAll.encode(value).finish(),
      };
    },
    beginUnlocking(value: MsgBeginUnlocking) {
      return {
        typeUrl: "/osmosis.lockup.MsgBeginUnlocking",
        value: MsgBeginUnlocking.encode(value).finish(),
      };
    },
    extendLockup(value: MsgExtendLockup) {
      return {
        typeUrl: "/osmosis.lockup.MsgExtendLockup",
        value: MsgExtendLockup.encode(value).finish(),
      };
    },
    forceUnlock(value: MsgForceUnlock) {
      return {
        typeUrl: "/osmosis.lockup.MsgForceUnlock",
        value: MsgForceUnlock.encode(value).finish(),
      };
    },
    setRewardReceiverAddress(value: MsgSetRewardReceiverAddress) {
      return {
        typeUrl: "/osmosis.lockup.MsgSetRewardReceiverAddress",
        value: MsgSetRewardReceiverAddress.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    lockTokens(value: MsgLockTokens) {
      return {
        typeUrl: "/osmosis.lockup.MsgLockTokens",
        value,
      };
    },
    beginUnlockingAll(value: MsgBeginUnlockingAll) {
      return {
        typeUrl: "/osmosis.lockup.MsgBeginUnlockingAll",
        value,
      };
    },
    beginUnlocking(value: MsgBeginUnlocking) {
      return {
        typeUrl: "/osmosis.lockup.MsgBeginUnlocking",
        value,
      };
    },
    extendLockup(value: MsgExtendLockup) {
      return {
        typeUrl: "/osmosis.lockup.MsgExtendLockup",
        value,
      };
    },
    forceUnlock(value: MsgForceUnlock) {
      return {
        typeUrl: "/osmosis.lockup.MsgForceUnlock",
        value,
      };
    },
    setRewardReceiverAddress(value: MsgSetRewardReceiverAddress) {
      return {
        typeUrl: "/osmosis.lockup.MsgSetRewardReceiverAddress",
        value,
      };
    },
  },
  fromPartial: {
    lockTokens(value: MsgLockTokens) {
      return {
        typeUrl: "/osmosis.lockup.MsgLockTokens",
        value: MsgLockTokens.fromPartial(value),
      };
    },
    beginUnlockingAll(value: MsgBeginUnlockingAll) {
      return {
        typeUrl: "/osmosis.lockup.MsgBeginUnlockingAll",
        value: MsgBeginUnlockingAll.fromPartial(value),
      };
    },
    beginUnlocking(value: MsgBeginUnlocking) {
      return {
        typeUrl: "/osmosis.lockup.MsgBeginUnlocking",
        value: MsgBeginUnlocking.fromPartial(value),
      };
    },
    extendLockup(value: MsgExtendLockup) {
      return {
        typeUrl: "/osmosis.lockup.MsgExtendLockup",
        value: MsgExtendLockup.fromPartial(value),
      };
    },
    forceUnlock(value: MsgForceUnlock) {
      return {
        typeUrl: "/osmosis.lockup.MsgForceUnlock",
        value: MsgForceUnlock.fromPartial(value),
      };
    },
    setRewardReceiverAddress(value: MsgSetRewardReceiverAddress) {
      return {
        typeUrl: "/osmosis.lockup.MsgSetRewardReceiverAddress",
        value: MsgSetRewardReceiverAddress.fromPartial(value),
      };
    },
  },
};
