import { PoolParams } from "./stableswap_pool";
import { Coin } from "../../../../cosmos/base/v1beta1/coin";
import * as _m0 from "protobufjs/minimal";
import { Long, DeepPartial } from "@osmonauts/helpers";
/** ===================== MsgCreatePool */
export interface MsgCreateStableswapPool {
    sender: string;
    poolParams: PoolParams;
    initialPoolLiquidity: Coin[];
    scalingFactors: Long[];
    futurePoolGovernor: string;
}
/** Returns a poolID with custom poolName. */
export interface MsgCreateStableswapPoolResponse {
    poolId: Long;
}
/**
 * Sender must be the pool's scaling_factor_governor in order for the tx to
 * succeed. Adjusts stableswap scaling factors.
 */
export interface MsgStableSwapAdjustScalingFactors {
    sender: string;
    poolId: Long;
    scalingFactors: Long[];
}
export interface MsgStableSwapAdjustScalingFactorsResponse {
}
export declare const MsgCreateStableswapPool: {
    encode(message: MsgCreateStableswapPool, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateStableswapPool;
    fromJSON(object: any): MsgCreateStableswapPool;
    toJSON(message: MsgCreateStableswapPool): unknown;
    fromPartial(object: DeepPartial<MsgCreateStableswapPool>): MsgCreateStableswapPool;
};
export declare const MsgCreateStableswapPoolResponse: {
    encode(message: MsgCreateStableswapPoolResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateStableswapPoolResponse;
    fromJSON(object: any): MsgCreateStableswapPoolResponse;
    toJSON(message: MsgCreateStableswapPoolResponse): unknown;
    fromPartial(object: DeepPartial<MsgCreateStableswapPoolResponse>): MsgCreateStableswapPoolResponse;
};
export declare const MsgStableSwapAdjustScalingFactors: {
    encode(message: MsgStableSwapAdjustScalingFactors, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgStableSwapAdjustScalingFactors;
    fromJSON(object: any): MsgStableSwapAdjustScalingFactors;
    toJSON(message: MsgStableSwapAdjustScalingFactors): unknown;
    fromPartial(object: DeepPartial<MsgStableSwapAdjustScalingFactors>): MsgStableSwapAdjustScalingFactors;
};
export declare const MsgStableSwapAdjustScalingFactorsResponse: {
    encode(_: MsgStableSwapAdjustScalingFactorsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgStableSwapAdjustScalingFactorsResponse;
    fromJSON(_: any): MsgStableSwapAdjustScalingFactorsResponse;
    toJSON(_: MsgStableSwapAdjustScalingFactorsResponse): unknown;
    fromPartial(_: DeepPartial<MsgStableSwapAdjustScalingFactorsResponse>): MsgStableSwapAdjustScalingFactorsResponse;
};
