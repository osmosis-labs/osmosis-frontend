import { Duration } from "../../google/protobuf/duration";
import { Coin } from "../../cosmos/base/v1beta1/coin";
import { PeriodLock } from "./lock";
import { AminoMsg } from "@cosmjs/amino";
import { Long } from "@osmonauts/helpers";
import { MsgLockTokens, MsgBeginUnlockingAll, MsgBeginUnlocking, MsgExtendLockup } from "./tx";
export interface AminoMsgLockTokens extends AminoMsg {
  type: "osmosis/lockup/lock-tokens";
  value: {
    owner: string;
    duration: {
      seconds: string;
      nanos: number;
    };
    coins: {
      denom: string;
      amount: string;
    }[];
  };
}
export interface AminoMsgBeginUnlockingAll extends AminoMsg {
  type: "osmosis/lockup/begin-unlocking-all";
  value: {
    owner: string;
  };
}
export interface AminoMsgBeginUnlocking extends AminoMsg {
  type: "osmosis/lockup/begin-unlocking";
  value: {
    owner: string;
    ID: string;
    coins: {
      denom: string;
      amount: string;
    }[];
  };
}
export interface AminoMsgExtendLockup extends AminoMsg {
  type: "osmosis/lockup/extend-lockup";
  value: {
    owner: string;
    ID: string;
    duration: {
      seconds: string;
      nanos: number;
    };
  };
}
export const AminoConverter = {
  "/osmosis.lockup.MsgLockTokens": {
    aminoType: "osmosis/lockup/lock-tokens",
    toAmino: ({
      owner,
      duration,
      coins
    }: MsgLockTokens): AminoMsgLockTokens["value"] => {
      return {
        owner,
        duration: (duration * 1_000_000_000).toString(),
        coins: coins.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        }))
      };
    },
    fromAmino: ({
      owner,
      duration,
      coins
    }: AminoMsgLockTokens["value"]): MsgLockTokens => {
      return {
        owner,
        duration: {
          seconds: Long.fromNumber(Math.floor(parseInt(duration) / 1_000_000_000)),
          nanos: parseInt(duration) % 1_000_000_000
        },
        coins: coins.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        }))
      };
    }
  },
  "/osmosis.lockup.MsgBeginUnlockingAll": {
    aminoType: "osmosis/lockup/begin-unlocking-all",
    toAmino: ({
      owner
    }: MsgBeginUnlockingAll): AminoMsgBeginUnlockingAll["value"] => {
      return {
        owner
      };
    },
    fromAmino: ({
      owner
    }: AminoMsgBeginUnlockingAll["value"]): MsgBeginUnlockingAll => {
      return {
        owner
      };
    }
  },
  "/osmosis.lockup.MsgBeginUnlocking": {
    aminoType: "osmosis/lockup/begin-unlocking",
    toAmino: ({
      owner,
      ID,
      coins
    }: MsgBeginUnlocking): AminoMsgBeginUnlocking["value"] => {
      return {
        owner,
        ID: ID.toString(),
        coins: coins.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        }))
      };
    },
    fromAmino: ({
      owner,
      ID,
      coins
    }: AminoMsgBeginUnlocking["value"]): MsgBeginUnlocking => {
      return {
        owner,
        ID: Long.fromString(ID),
        coins: coins.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        }))
      };
    }
  },
  "/osmosis.lockup.MsgExtendLockup": {
    aminoType: "osmosis/lockup/extend-lockup",
    toAmino: ({
      owner,
      ID,
      duration
    }: MsgExtendLockup): AminoMsgExtendLockup["value"] => {
      return {
        owner,
        ID: ID.toString(),
        duration: (duration * 1_000_000_000).toString()
      };
    },
    fromAmino: ({
      owner,
      ID,
      duration
    }: AminoMsgExtendLockup["value"]): MsgExtendLockup => {
      return {
        owner,
        ID: Long.fromString(ID),
        duration: {
          seconds: Long.fromNumber(Math.floor(parseInt(duration) / 1_000_000_000)),
          nanos: parseInt(duration) % 1_000_000_000
        }
      };
    }
  }
};