//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Coin, CoinAmino, CoinSDKType } from "../../cosmos/base/v1beta1/coin";
import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../google/protobuf/duration";
import { Long } from "../../helpers";
import { PeriodLock, PeriodLockAmino, PeriodLockSDKType } from "./lock";
export interface MsgLockTokens {
  owner: string;
  duration?: Duration;
  coins: Coin[];
}
export interface MsgLockTokensProtoMsg {
  typeUrl: "/osmosis.lockup.MsgLockTokens";
  value: Uint8Array;
}
export interface MsgLockTokensAmino {
  owner: string;
  duration?: DurationAmino;
  coins: CoinAmino[];
}
export interface MsgLockTokensAminoMsg {
  type: "osmosis/lockup/lock-tokens";
  value: MsgLockTokensAmino;
}
export interface MsgLockTokensSDKType {
  owner: string;
  duration?: DurationSDKType;
  coins: CoinSDKType[];
}
export interface MsgLockTokensResponse {
  ID: Long;
}
export interface MsgLockTokensResponseProtoMsg {
  typeUrl: "/osmosis.lockup.MsgLockTokensResponse";
  value: Uint8Array;
}
export interface MsgLockTokensResponseAmino {
  ID: string;
}
export interface MsgLockTokensResponseAminoMsg {
  type: "osmosis/lockup/lock-tokens-response";
  value: MsgLockTokensResponseAmino;
}
export interface MsgLockTokensResponseSDKType {
  ID: Long;
}
export interface MsgBeginUnlockingAll {
  owner: string;
}
export interface MsgBeginUnlockingAllProtoMsg {
  typeUrl: "/osmosis.lockup.MsgBeginUnlockingAll";
  value: Uint8Array;
}
export interface MsgBeginUnlockingAllAmino {
  owner: string;
}
export interface MsgBeginUnlockingAllAminoMsg {
  type: "osmosis/lockup/begin-unlock-tokens";
  value: MsgBeginUnlockingAllAmino;
}
export interface MsgBeginUnlockingAllSDKType {
  owner: string;
}
export interface MsgBeginUnlockingAllResponse {
  unlocks: PeriodLock[];
}
export interface MsgBeginUnlockingAllResponseProtoMsg {
  typeUrl: "/osmosis.lockup.MsgBeginUnlockingAllResponse";
  value: Uint8Array;
}
export interface MsgBeginUnlockingAllResponseAmino {
  unlocks: PeriodLockAmino[];
}
export interface MsgBeginUnlockingAllResponseAminoMsg {
  type: "osmosis/lockup/begin-unlocking-all-response";
  value: MsgBeginUnlockingAllResponseAmino;
}
export interface MsgBeginUnlockingAllResponseSDKType {
  unlocks: PeriodLockSDKType[];
}
export interface MsgBeginUnlocking {
  owner: string;
  ID: Long;
  /** Amount of unlocking coins. Unlock all if not set. */
  coins: Coin[];
}
export interface MsgBeginUnlockingProtoMsg {
  typeUrl: "/osmosis.lockup.MsgBeginUnlocking";
  value: Uint8Array;
}
export interface MsgBeginUnlockingAmino {
  owner: string;
  ID: string;
  /** Amount of unlocking coins. Unlock all if not set. */
  coins: CoinAmino[];
}
export interface MsgBeginUnlockingAminoMsg {
  type: "osmosis/lockup/begin-unlock-period-lock";
  value: MsgBeginUnlockingAmino;
}
export interface MsgBeginUnlockingSDKType {
  owner: string;
  ID: Long;
  coins: CoinSDKType[];
}
export interface MsgBeginUnlockingResponse {
  success: boolean;
  unlockingLockID: Long;
}
export interface MsgBeginUnlockingResponseProtoMsg {
  typeUrl: "/osmosis.lockup.MsgBeginUnlockingResponse";
  value: Uint8Array;
}
export interface MsgBeginUnlockingResponseAmino {
  success: boolean;
  unlockingLockID: string;
}
export interface MsgBeginUnlockingResponseAminoMsg {
  type: "osmosis/lockup/begin-unlocking-response";
  value: MsgBeginUnlockingResponseAmino;
}
export interface MsgBeginUnlockingResponseSDKType {
  success: boolean;
  unlockingLockID: Long;
}
/**
 * MsgExtendLockup extends the existing lockup's duration.
 * The new duration is longer than the original.
 */
export interface MsgExtendLockup {
  owner: string;
  ID: Long;
  /**
   * duration to be set. fails if lower than the current duration, or is
   * unlocking
   */
  duration?: Duration;
}
export interface MsgExtendLockupProtoMsg {
  typeUrl: "/osmosis.lockup.MsgExtendLockup";
  value: Uint8Array;
}
/**
 * MsgExtendLockup extends the existing lockup's duration.
 * The new duration is longer than the original.
 */
export interface MsgExtendLockupAmino {
  owner: string;
  ID: string;
  /**
   * duration to be set. fails if lower than the current duration, or is
   * unlocking
   */
  duration?: DurationAmino;
}
export interface MsgExtendLockupAminoMsg {
  type: "osmosis/lockup/extend-lockup";
  value: MsgExtendLockupAmino;
}
/**
 * MsgExtendLockup extends the existing lockup's duration.
 * The new duration is longer than the original.
 */
export interface MsgExtendLockupSDKType {
  owner: string;
  ID: Long;
  duration?: DurationSDKType;
}
export interface MsgExtendLockupResponse {
  success: boolean;
}
export interface MsgExtendLockupResponseProtoMsg {
  typeUrl: "/osmosis.lockup.MsgExtendLockupResponse";
  value: Uint8Array;
}
export interface MsgExtendLockupResponseAmino {
  success: boolean;
}
export interface MsgExtendLockupResponseAminoMsg {
  type: "osmosis/lockup/extend-lockup-response";
  value: MsgExtendLockupResponseAmino;
}
export interface MsgExtendLockupResponseSDKType {
  success: boolean;
}
/**
 * MsgForceUnlock unlocks locks immediately for
 * addresses registered via governance.
 */
export interface MsgForceUnlock {
  owner: string;
  ID: Long;
  /** Amount of unlocking coins. Unlock all if not set. */
  coins: Coin[];
}
export interface MsgForceUnlockProtoMsg {
  typeUrl: "/osmosis.lockup.MsgForceUnlock";
  value: Uint8Array;
}
/**
 * MsgForceUnlock unlocks locks immediately for
 * addresses registered via governance.
 */
export interface MsgForceUnlockAmino {
  owner: string;
  ID: string;
  /** Amount of unlocking coins. Unlock all if not set. */
  coins: CoinAmino[];
}
export interface MsgForceUnlockAminoMsg {
  type: "osmosis/lockup/force-unlock";
  value: MsgForceUnlockAmino;
}
/**
 * MsgForceUnlock unlocks locks immediately for
 * addresses registered via governance.
 */
export interface MsgForceUnlockSDKType {
  owner: string;
  ID: Long;
  coins: CoinSDKType[];
}
export interface MsgForceUnlockResponse {
  success: boolean;
}
export interface MsgForceUnlockResponseProtoMsg {
  typeUrl: "/osmosis.lockup.MsgForceUnlockResponse";
  value: Uint8Array;
}
export interface MsgForceUnlockResponseAmino {
  success: boolean;
}
export interface MsgForceUnlockResponseAminoMsg {
  type: "osmosis/lockup/force-unlock-response";
  value: MsgForceUnlockResponseAmino;
}
export interface MsgForceUnlockResponseSDKType {
  success: boolean;
}
function createBaseMsgLockTokens(): MsgLockTokens {
  return {
    owner: "",
    duration: undefined,
    coins: [],
  };
}
export const MsgLockTokens = {
  typeUrl: "/osmosis.lockup.MsgLockTokens",
  encode(
    message: MsgLockTokens,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.duration !== undefined) {
      Duration.encode(message.duration, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgLockTokens {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLockTokens();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.duration = Duration.decode(reader, reader.uint32());
          break;
        case 3:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgLockTokens>): MsgLockTokens {
    const message = createBaseMsgLockTokens();
    message.owner = object.owner ?? "";
    message.duration =
      object.duration !== undefined && object.duration !== null
        ? Duration.fromPartial(object.duration)
        : undefined;
    message.coins = object.coins?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgLockTokensAmino): MsgLockTokens {
    return {
      owner: object.owner,
      duration: object?.duration
        ? Duration.fromAmino(object.duration)
        : undefined,
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgLockTokens): MsgLockTokensAmino {
    const obj: any = {};
    obj.owner = message.owner;
    obj.duration = message.duration
      ? Duration.toAmino(message.duration)
      : undefined;
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.coins = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgLockTokensAminoMsg): MsgLockTokens {
    return MsgLockTokens.fromAmino(object.value);
  },
  toAminoMsg(message: MsgLockTokens): MsgLockTokensAminoMsg {
    return {
      type: "osmosis/lockup/lock-tokens",
      value: MsgLockTokens.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgLockTokensProtoMsg): MsgLockTokens {
    return MsgLockTokens.decode(message.value);
  },
  toProto(message: MsgLockTokens): Uint8Array {
    return MsgLockTokens.encode(message).finish();
  },
  toProtoMsg(message: MsgLockTokens): MsgLockTokensProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgLockTokens",
      value: MsgLockTokens.encode(message).finish(),
    };
  },
};
function createBaseMsgLockTokensResponse(): MsgLockTokensResponse {
  return {
    ID: Long.UZERO,
  };
}
export const MsgLockTokensResponse = {
  typeUrl: "/osmosis.lockup.MsgLockTokensResponse",
  encode(
    message: MsgLockTokensResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.ID.isZero()) {
      writer.uint32(8).uint64(message.ID);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgLockTokensResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLockTokensResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ID = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgLockTokensResponse>): MsgLockTokensResponse {
    const message = createBaseMsgLockTokensResponse();
    message.ID =
      object.ID !== undefined && object.ID !== null
        ? Long.fromValue(object.ID)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgLockTokensResponseAmino): MsgLockTokensResponse {
    return {
      ID: Long.fromString(object.ID),
    };
  },
  toAmino(message: MsgLockTokensResponse): MsgLockTokensResponseAmino {
    const obj: any = {};
    obj.ID = message.ID ? message.ID.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgLockTokensResponseAminoMsg): MsgLockTokensResponse {
    return MsgLockTokensResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgLockTokensResponse): MsgLockTokensResponseAminoMsg {
    return {
      type: "osmosis/lockup/lock-tokens-response",
      value: MsgLockTokensResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgLockTokensResponseProtoMsg): MsgLockTokensResponse {
    return MsgLockTokensResponse.decode(message.value);
  },
  toProto(message: MsgLockTokensResponse): Uint8Array {
    return MsgLockTokensResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgLockTokensResponse): MsgLockTokensResponseProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgLockTokensResponse",
      value: MsgLockTokensResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBeginUnlockingAll(): MsgBeginUnlockingAll {
  return {
    owner: "",
  };
}
export const MsgBeginUnlockingAll = {
  typeUrl: "/osmosis.lockup.MsgBeginUnlockingAll",
  encode(
    message: MsgBeginUnlockingAll,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgBeginUnlockingAll {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginUnlockingAll();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBeginUnlockingAll>): MsgBeginUnlockingAll {
    const message = createBaseMsgBeginUnlockingAll();
    message.owner = object.owner ?? "";
    return message;
  },
  fromAmino(object: MsgBeginUnlockingAllAmino): MsgBeginUnlockingAll {
    return {
      owner: object.owner,
    };
  },
  toAmino(message: MsgBeginUnlockingAll): MsgBeginUnlockingAllAmino {
    const obj: any = {};
    obj.owner = message.owner;
    return obj;
  },
  fromAminoMsg(object: MsgBeginUnlockingAllAminoMsg): MsgBeginUnlockingAll {
    return MsgBeginUnlockingAll.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBeginUnlockingAll): MsgBeginUnlockingAllAminoMsg {
    return {
      type: "osmosis/lockup/begin-unlock-tokens",
      value: MsgBeginUnlockingAll.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBeginUnlockingAllProtoMsg): MsgBeginUnlockingAll {
    return MsgBeginUnlockingAll.decode(message.value);
  },
  toProto(message: MsgBeginUnlockingAll): Uint8Array {
    return MsgBeginUnlockingAll.encode(message).finish();
  },
  toProtoMsg(message: MsgBeginUnlockingAll): MsgBeginUnlockingAllProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgBeginUnlockingAll",
      value: MsgBeginUnlockingAll.encode(message).finish(),
    };
  },
};
function createBaseMsgBeginUnlockingAllResponse(): MsgBeginUnlockingAllResponse {
  return {
    unlocks: [],
  };
}
export const MsgBeginUnlockingAllResponse = {
  typeUrl: "/osmosis.lockup.MsgBeginUnlockingAllResponse",
  encode(
    message: MsgBeginUnlockingAllResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.unlocks) {
      PeriodLock.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgBeginUnlockingAllResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginUnlockingAllResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.unlocks.push(PeriodLock.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgBeginUnlockingAllResponse>
  ): MsgBeginUnlockingAllResponse {
    const message = createBaseMsgBeginUnlockingAllResponse();
    message.unlocks =
      object.unlocks?.map((e) => PeriodLock.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: MsgBeginUnlockingAllResponseAmino
  ): MsgBeginUnlockingAllResponse {
    return {
      unlocks: Array.isArray(object?.unlocks)
        ? object.unlocks.map((e: any) => PeriodLock.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: MsgBeginUnlockingAllResponse
  ): MsgBeginUnlockingAllResponseAmino {
    const obj: any = {};
    if (message.unlocks) {
      obj.unlocks = message.unlocks.map((e) =>
        e ? PeriodLock.toAmino(e) : undefined
      );
    } else {
      obj.unlocks = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: MsgBeginUnlockingAllResponseAminoMsg
  ): MsgBeginUnlockingAllResponse {
    return MsgBeginUnlockingAllResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgBeginUnlockingAllResponse
  ): MsgBeginUnlockingAllResponseAminoMsg {
    return {
      type: "osmosis/lockup/begin-unlocking-all-response",
      value: MsgBeginUnlockingAllResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgBeginUnlockingAllResponseProtoMsg
  ): MsgBeginUnlockingAllResponse {
    return MsgBeginUnlockingAllResponse.decode(message.value);
  },
  toProto(message: MsgBeginUnlockingAllResponse): Uint8Array {
    return MsgBeginUnlockingAllResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgBeginUnlockingAllResponse
  ): MsgBeginUnlockingAllResponseProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgBeginUnlockingAllResponse",
      value: MsgBeginUnlockingAllResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBeginUnlocking(): MsgBeginUnlocking {
  return {
    owner: "",
    ID: Long.UZERO,
    coins: [],
  };
}
export const MsgBeginUnlocking = {
  typeUrl: "/osmosis.lockup.MsgBeginUnlocking",
  encode(
    message: MsgBeginUnlocking,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (!message.ID.isZero()) {
      writer.uint32(16).uint64(message.ID);
    }
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginUnlocking {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginUnlocking();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.ID = reader.uint64() as Long;
          break;
        case 3:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBeginUnlocking>): MsgBeginUnlocking {
    const message = createBaseMsgBeginUnlocking();
    message.owner = object.owner ?? "";
    message.ID =
      object.ID !== undefined && object.ID !== null
        ? Long.fromValue(object.ID)
        : Long.UZERO;
    message.coins = object.coins?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgBeginUnlockingAmino): MsgBeginUnlocking {
    return {
      owner: object.owner,
      ID: Long.fromString(object.ID),
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgBeginUnlocking): MsgBeginUnlockingAmino {
    const obj: any = {};
    obj.owner = message.owner;
    obj.ID = message.ID ? message.ID.toString() : undefined;
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.coins = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgBeginUnlockingAminoMsg): MsgBeginUnlocking {
    return MsgBeginUnlocking.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBeginUnlocking): MsgBeginUnlockingAminoMsg {
    return {
      type: "osmosis/lockup/begin-unlock-period-lock",
      value: MsgBeginUnlocking.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBeginUnlockingProtoMsg): MsgBeginUnlocking {
    return MsgBeginUnlocking.decode(message.value);
  },
  toProto(message: MsgBeginUnlocking): Uint8Array {
    return MsgBeginUnlocking.encode(message).finish();
  },
  toProtoMsg(message: MsgBeginUnlocking): MsgBeginUnlockingProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgBeginUnlocking",
      value: MsgBeginUnlocking.encode(message).finish(),
    };
  },
};
function createBaseMsgBeginUnlockingResponse(): MsgBeginUnlockingResponse {
  return {
    success: false,
    unlockingLockID: Long.UZERO,
  };
}
export const MsgBeginUnlockingResponse = {
  typeUrl: "/osmosis.lockup.MsgBeginUnlockingResponse",
  encode(
    message: MsgBeginUnlockingResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    if (!message.unlockingLockID.isZero()) {
      writer.uint32(16).uint64(message.unlockingLockID);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgBeginUnlockingResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginUnlockingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        case 2:
          message.unlockingLockID = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgBeginUnlockingResponse>
  ): MsgBeginUnlockingResponse {
    const message = createBaseMsgBeginUnlockingResponse();
    message.success = object.success ?? false;
    message.unlockingLockID =
      object.unlockingLockID !== undefined && object.unlockingLockID !== null
        ? Long.fromValue(object.unlockingLockID)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgBeginUnlockingResponseAmino): MsgBeginUnlockingResponse {
    return {
      success: object.success,
      unlockingLockID: Long.fromString(object.unlockingLockID),
    };
  },
  toAmino(message: MsgBeginUnlockingResponse): MsgBeginUnlockingResponseAmino {
    const obj: any = {};
    obj.success = message.success;
    obj.unlockingLockID = message.unlockingLockID
      ? message.unlockingLockID.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgBeginUnlockingResponseAminoMsg
  ): MsgBeginUnlockingResponse {
    return MsgBeginUnlockingResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgBeginUnlockingResponse
  ): MsgBeginUnlockingResponseAminoMsg {
    return {
      type: "osmosis/lockup/begin-unlocking-response",
      value: MsgBeginUnlockingResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgBeginUnlockingResponseProtoMsg
  ): MsgBeginUnlockingResponse {
    return MsgBeginUnlockingResponse.decode(message.value);
  },
  toProto(message: MsgBeginUnlockingResponse): Uint8Array {
    return MsgBeginUnlockingResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgBeginUnlockingResponse
  ): MsgBeginUnlockingResponseProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgBeginUnlockingResponse",
      value: MsgBeginUnlockingResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExtendLockup(): MsgExtendLockup {
  return {
    owner: "",
    ID: Long.UZERO,
    duration: undefined,
  };
}
export const MsgExtendLockup = {
  typeUrl: "/osmosis.lockup.MsgExtendLockup",
  encode(
    message: MsgExtendLockup,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (!message.ID.isZero()) {
      writer.uint32(16).uint64(message.ID);
    }
    if (message.duration !== undefined) {
      Duration.encode(message.duration, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExtendLockup {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExtendLockup();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.ID = reader.uint64() as Long;
          break;
        case 3:
          message.duration = Duration.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgExtendLockup>): MsgExtendLockup {
    const message = createBaseMsgExtendLockup();
    message.owner = object.owner ?? "";
    message.ID =
      object.ID !== undefined && object.ID !== null
        ? Long.fromValue(object.ID)
        : Long.UZERO;
    message.duration =
      object.duration !== undefined && object.duration !== null
        ? Duration.fromPartial(object.duration)
        : undefined;
    return message;
  },
  fromAmino(object: MsgExtendLockupAmino): MsgExtendLockup {
    return {
      owner: object.owner,
      ID: Long.fromString(object.ID),
      duration: object?.duration
        ? Duration.fromAmino(object.duration)
        : undefined,
    };
  },
  toAmino(message: MsgExtendLockup): MsgExtendLockupAmino {
    const obj: any = {};
    obj.owner = message.owner;
    obj.ID = message.ID ? message.ID.toString() : undefined;
    obj.duration = message.duration
      ? Duration.toAmino(message.duration)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgExtendLockupAminoMsg): MsgExtendLockup {
    return MsgExtendLockup.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExtendLockup): MsgExtendLockupAminoMsg {
    return {
      type: "osmosis/lockup/extend-lockup",
      value: MsgExtendLockup.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExtendLockupProtoMsg): MsgExtendLockup {
    return MsgExtendLockup.decode(message.value);
  },
  toProto(message: MsgExtendLockup): Uint8Array {
    return MsgExtendLockup.encode(message).finish();
  },
  toProtoMsg(message: MsgExtendLockup): MsgExtendLockupProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgExtendLockup",
      value: MsgExtendLockup.encode(message).finish(),
    };
  },
};
function createBaseMsgExtendLockupResponse(): MsgExtendLockupResponse {
  return {
    success: false,
  };
}
export const MsgExtendLockupResponse = {
  typeUrl: "/osmosis.lockup.MsgExtendLockupResponse",
  encode(
    message: MsgExtendLockupResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgExtendLockupResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExtendLockupResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgExtendLockupResponse>
  ): MsgExtendLockupResponse {
    const message = createBaseMsgExtendLockupResponse();
    message.success = object.success ?? false;
    return message;
  },
  fromAmino(object: MsgExtendLockupResponseAmino): MsgExtendLockupResponse {
    return {
      success: object.success,
    };
  },
  toAmino(message: MsgExtendLockupResponse): MsgExtendLockupResponseAmino {
    const obj: any = {};
    obj.success = message.success;
    return obj;
  },
  fromAminoMsg(
    object: MsgExtendLockupResponseAminoMsg
  ): MsgExtendLockupResponse {
    return MsgExtendLockupResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgExtendLockupResponse
  ): MsgExtendLockupResponseAminoMsg {
    return {
      type: "osmosis/lockup/extend-lockup-response",
      value: MsgExtendLockupResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgExtendLockupResponseProtoMsg
  ): MsgExtendLockupResponse {
    return MsgExtendLockupResponse.decode(message.value);
  },
  toProto(message: MsgExtendLockupResponse): Uint8Array {
    return MsgExtendLockupResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgExtendLockupResponse
  ): MsgExtendLockupResponseProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgExtendLockupResponse",
      value: MsgExtendLockupResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgForceUnlock(): MsgForceUnlock {
  return {
    owner: "",
    ID: Long.UZERO,
    coins: [],
  };
}
export const MsgForceUnlock = {
  typeUrl: "/osmosis.lockup.MsgForceUnlock",
  encode(
    message: MsgForceUnlock,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (!message.ID.isZero()) {
      writer.uint32(16).uint64(message.ID);
    }
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgForceUnlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgForceUnlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.ID = reader.uint64() as Long;
          break;
        case 3:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgForceUnlock>): MsgForceUnlock {
    const message = createBaseMsgForceUnlock();
    message.owner = object.owner ?? "";
    message.ID =
      object.ID !== undefined && object.ID !== null
        ? Long.fromValue(object.ID)
        : Long.UZERO;
    message.coins = object.coins?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgForceUnlockAmino): MsgForceUnlock {
    return {
      owner: object.owner,
      ID: Long.fromString(object.ID),
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgForceUnlock): MsgForceUnlockAmino {
    const obj: any = {};
    obj.owner = message.owner;
    obj.ID = message.ID ? message.ID.toString() : undefined;
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.coins = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgForceUnlockAminoMsg): MsgForceUnlock {
    return MsgForceUnlock.fromAmino(object.value);
  },
  toAminoMsg(message: MsgForceUnlock): MsgForceUnlockAminoMsg {
    return {
      type: "osmosis/lockup/force-unlock",
      value: MsgForceUnlock.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgForceUnlockProtoMsg): MsgForceUnlock {
    return MsgForceUnlock.decode(message.value);
  },
  toProto(message: MsgForceUnlock): Uint8Array {
    return MsgForceUnlock.encode(message).finish();
  },
  toProtoMsg(message: MsgForceUnlock): MsgForceUnlockProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgForceUnlock",
      value: MsgForceUnlock.encode(message).finish(),
    };
  },
};
function createBaseMsgForceUnlockResponse(): MsgForceUnlockResponse {
  return {
    success: false,
  };
}
export const MsgForceUnlockResponse = {
  typeUrl: "/osmosis.lockup.MsgForceUnlockResponse",
  encode(
    message: MsgForceUnlockResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgForceUnlockResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgForceUnlockResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgForceUnlockResponse>): MsgForceUnlockResponse {
    const message = createBaseMsgForceUnlockResponse();
    message.success = object.success ?? false;
    return message;
  },
  fromAmino(object: MsgForceUnlockResponseAmino): MsgForceUnlockResponse {
    return {
      success: object.success,
    };
  },
  toAmino(message: MsgForceUnlockResponse): MsgForceUnlockResponseAmino {
    const obj: any = {};
    obj.success = message.success;
    return obj;
  },
  fromAminoMsg(object: MsgForceUnlockResponseAminoMsg): MsgForceUnlockResponse {
    return MsgForceUnlockResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgForceUnlockResponse): MsgForceUnlockResponseAminoMsg {
    return {
      type: "osmosis/lockup/force-unlock-response",
      value: MsgForceUnlockResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgForceUnlockResponseProtoMsg
  ): MsgForceUnlockResponse {
    return MsgForceUnlockResponse.decode(message.value);
  },
  toProto(message: MsgForceUnlockResponse): Uint8Array {
    return MsgForceUnlockResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgForceUnlockResponse): MsgForceUnlockResponseProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.MsgForceUnlockResponse",
      value: MsgForceUnlockResponse.encode(message).finish(),
    };
  },
};
