//@ts-nocheck
import {
  MsgLockTokens,
  MsgBeginUnlockingAll,
  MsgBeginUnlocking,
  MsgExtendLockup,
  MsgForceUnlock,
} from "./tx";
export const AminoConverter = {
  "/osmosis.lockup.MsgLockTokens": {
    aminoType: "osmosis/lockup/lock-tokens",
    toAmino: MsgLockTokens.toAmino,
    fromAmino: MsgLockTokens.fromAmino,
  },
  "/osmosis.lockup.MsgBeginUnlockingAll": {
    aminoType: "osmosis/lockup/begin-unlock-tokens",
    toAmino: MsgBeginUnlockingAll.toAmino,
    fromAmino: MsgBeginUnlockingAll.fromAmino,
  },
  "/osmosis.lockup.MsgBeginUnlocking": {
    aminoType: "osmosis/lockup/begin-unlock-period-lock",
    toAmino: MsgBeginUnlocking.toAmino,
    fromAmino: MsgBeginUnlocking.fromAmino,
  },
  "/osmosis.lockup.MsgExtendLockup": {
    aminoType: "osmosis/lockup/extend-lockup",
    toAmino: MsgExtendLockup.toAmino,
    fromAmino: MsgExtendLockup.fromAmino,
  },
  "/osmosis.lockup.MsgForceUnlock": {
    aminoType: "osmosis/lockup/force-unlock",
    toAmino: MsgForceUnlock.toAmino,
    fromAmino: MsgForceUnlock.fromAmino,
  },
};
