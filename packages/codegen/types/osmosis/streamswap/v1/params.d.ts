import { Coin } from "../../../cosmos/base/v1beta1/coin";
import { Duration } from "../../../google/protobuf/duration";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "@osmonauts/helpers";
/** Params holds parameters for the streamswap module */
export interface Params {
    /**
     * fee charged when creating a new sale. The fee will go to the
     * sale_fee_recipient unless it is not defined (empty).
     */
    saleCreationFee: Coin[];
    /** bech32 address of the fee recipient */
    saleCreationFeeRecipient: string;
    /**
     * minimum amount duration of time between the sale creation and the sale
     * start time.
     */
    minDurationUntilStartTime: Duration;
    /** minimum duration for every new sale. */
    minSaleDuration: Duration;
}
export declare const Params: {
    encode(message: Params, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Params;
    fromJSON(object: any): Params;
    toJSON(message: Params): unknown;
    fromPartial(object: DeepPartial<Params>): Params;
};
