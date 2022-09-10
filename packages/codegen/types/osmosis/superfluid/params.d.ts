import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "@osmonauts/helpers";
/** Params holds parameters for the superfluid module */
export interface Params {
    /**
     * minimum_risk_factor is to be cut on OSMO equivalent value of lp tokens for
     * superfluid staking, default: 5%. The minimum risk factor works
     * to counter-balance the staked amount on chain's exposure to various asset
     * volatilities, and have base staking be 'resistant' to volatility.
     */
    minimumRiskFactor: string;
}
export declare const Params: {
    encode(message: Params, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Params;
    fromJSON(object: any): Params;
    toJSON(message: Params): unknown;
    fromPartial(object: DeepPartial<Params>): Params;
};
