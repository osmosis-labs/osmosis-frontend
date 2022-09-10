import { Coin } from "../../../../cosmos/base/v1beta1/coin";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial, Long } from "@osmonauts/helpers";
/**
 * PoolParams defined the parameters that will be managed by the pool
 * governance in the future. This params are not managed by the chain
 * governance. Instead they will be managed by the token holders of the pool.
 * The pool's token holders are specified in future_pool_governor.
 */
export interface PoolParams {
    swapFee: string;
    exitFee: string;
}
/** Pool is the stableswap Pool struct */
export interface Pool {
    address: string;
    id: Long;
    poolParams: PoolParams;
    /**
     * This string specifies who will govern the pool in the future.
     * Valid forms of this are:
     * {token name},{duration}
     * {duration}
     * where {token name} if specified is the token which determines the
     * governor, and if not specified is the LP token for this pool.duration is
     * a time specified as 0w,1w,2w, etc. which specifies how long the token
     * would need to be locked up to count in governance. 0w means no lockup.
     */
    futurePoolGovernor: string;
    /** sum of all LP shares */
    totalShares: Coin;
    /** assets in the pool */
    poolLiquidity: Coin[];
    /** for calculation amognst assets with different precisions */
    scalingFactor: Long[];
    /** scaling_factor_governor is the address can adjust pool scaling factors */
    scalingFactorGovernor: string;
}
export declare const PoolParams: {
    encode(message: PoolParams, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PoolParams;
    fromJSON(object: any): PoolParams;
    toJSON(message: PoolParams): unknown;
    fromPartial(object: DeepPartial<PoolParams>): PoolParams;
};
export declare const Pool: {
    encode(message: Pool, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Pool;
    fromJSON(object: any): Pool;
    toJSON(message: Pool): unknown;
    fromPartial(object: DeepPartial<Pool>): Pool;
};
