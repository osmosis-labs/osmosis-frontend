import { Duration } from "../../google/protobuf/duration";
import { Coin } from "../../cosmos/base/v1beta1/coin";
import { PeriodLock } from "./lock";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial, Long } from "@osmonauts/helpers";
export interface MsgLockTokens {
    owner: string;
    duration: Duration;
    coins: Coin[];
}
export interface MsgLockTokensResponse {
    ID: Long;
}
export interface MsgBeginUnlockingAll {
    owner: string;
}
export interface MsgBeginUnlockingAllResponse {
    unlocks: PeriodLock[];
}
export interface MsgBeginUnlocking {
    owner: string;
    ID: Long;
    /** Amount of unlocking coins. Unlock all if not set. */
    coins: Coin[];
}
export interface MsgBeginUnlockingResponse {
    success: boolean;
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
    duration: Duration;
}
export interface MsgExtendLockupResponse {
    success: boolean;
}
export declare const MsgLockTokens: {
    encode(message: MsgLockTokens, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgLockTokens;
    fromJSON(object: any): MsgLockTokens;
    toJSON(message: MsgLockTokens): unknown;
    fromPartial(object: DeepPartial<MsgLockTokens>): MsgLockTokens;
};
export declare const MsgLockTokensResponse: {
    encode(message: MsgLockTokensResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgLockTokensResponse;
    fromJSON(object: any): MsgLockTokensResponse;
    toJSON(message: MsgLockTokensResponse): unknown;
    fromPartial(object: DeepPartial<MsgLockTokensResponse>): MsgLockTokensResponse;
};
export declare const MsgBeginUnlockingAll: {
    encode(message: MsgBeginUnlockingAll, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginUnlockingAll;
    fromJSON(object: any): MsgBeginUnlockingAll;
    toJSON(message: MsgBeginUnlockingAll): unknown;
    fromPartial(object: DeepPartial<MsgBeginUnlockingAll>): MsgBeginUnlockingAll;
};
export declare const MsgBeginUnlockingAllResponse: {
    encode(message: MsgBeginUnlockingAllResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginUnlockingAllResponse;
    fromJSON(object: any): MsgBeginUnlockingAllResponse;
    toJSON(message: MsgBeginUnlockingAllResponse): unknown;
    fromPartial(object: DeepPartial<MsgBeginUnlockingAllResponse>): MsgBeginUnlockingAllResponse;
};
export declare const MsgBeginUnlocking: {
    encode(message: MsgBeginUnlocking, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginUnlocking;
    fromJSON(object: any): MsgBeginUnlocking;
    toJSON(message: MsgBeginUnlocking): unknown;
    fromPartial(object: DeepPartial<MsgBeginUnlocking>): MsgBeginUnlocking;
};
export declare const MsgBeginUnlockingResponse: {
    encode(message: MsgBeginUnlockingResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginUnlockingResponse;
    fromJSON(object: any): MsgBeginUnlockingResponse;
    toJSON(message: MsgBeginUnlockingResponse): unknown;
    fromPartial(object: DeepPartial<MsgBeginUnlockingResponse>): MsgBeginUnlockingResponse;
};
export declare const MsgExtendLockup: {
    encode(message: MsgExtendLockup, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgExtendLockup;
    fromJSON(object: any): MsgExtendLockup;
    toJSON(message: MsgExtendLockup): unknown;
    fromPartial(object: DeepPartial<MsgExtendLockup>): MsgExtendLockup;
};
export declare const MsgExtendLockupResponse: {
    encode(message: MsgExtendLockupResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgExtendLockupResponse;
    fromJSON(object: any): MsgExtendLockupResponse;
    toJSON(message: MsgExtendLockupResponse): unknown;
    fromPartial(object: DeepPartial<MsgExtendLockupResponse>): MsgExtendLockupResponse;
};
