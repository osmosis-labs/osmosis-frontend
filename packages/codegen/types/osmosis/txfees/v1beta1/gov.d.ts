import { FeeToken } from "./feetoken";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "@osmonauts/helpers";
/**
 * UpdateFeeTokenProposal is a gov Content type for adding a new whitelisted fee
 * token. It must specify a denom along with gamm pool ID to use as a spot price
 * calculator. It can be used to add a new denom to the whitelist It can also be
 * used to update the Pool to associate with the denom. If Pool ID is set to 0,
 * it will remove the denom from the whitelisted set.
 */
export interface UpdateFeeTokenProposal {
    title: string;
    description: string;
    feetoken: FeeToken;
}
export declare const UpdateFeeTokenProposal: {
    encode(message: UpdateFeeTokenProposal, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UpdateFeeTokenProposal;
    fromJSON(object: any): UpdateFeeTokenProposal;
    toJSON(message: UpdateFeeTokenProposal): unknown;
    fromPartial(object: DeepPartial<UpdateFeeTokenProposal>): UpdateFeeTokenProposal;
};
