import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "@osmonauts/helpers";
/**
 * FungibleTokenPacketData defines a struct for the packet payload
 * See FungibleTokenPacketData spec:
 * https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
 */
export interface FungibleTokenPacketData {
    /** the token denomination to be transferred */
    denom: string;
    /** the token amount to be transferred */
    amount: string;
    /** the sender address */
    sender: string;
    /** the recipient address on the destination chain */
    receiver: string;
}
export declare const FungibleTokenPacketData: {
    encode(message: FungibleTokenPacketData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): FungibleTokenPacketData;
    fromJSON(object: any): FungibleTokenPacketData;
    toJSON(message: FungibleTokenPacketData): unknown;
    fromPartial(object: DeepPartial<FungibleTokenPacketData>): FungibleTokenPacketData;
};
