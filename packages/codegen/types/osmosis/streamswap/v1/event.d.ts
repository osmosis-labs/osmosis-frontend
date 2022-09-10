import { Coin } from "../../../cosmos/base/v1beta1/coin";
import * as _m0 from "protobufjs/minimal";
import { Long, DeepPartial } from "@osmonauts/helpers";
export interface EventCreateSale {
    id: Long;
    creator: string;
    tokenIn: string;
    tokenOut: Coin;
}
export interface EventSubscribe {
    sender: string;
    saleId: Long;
    amount: string;
}
export interface EventWithdraw {
    sender: string;
    saleId: Long;
    /** amount of staked token_in withdrawn by user. */
    amount: string;
}
export interface EventExit {
    sender: string;
    saleId: Long;
    /** amount of purchased token_out sent to the user */
    purchased: string;
}
export interface EventFinalizeSale {
    saleId: Long;
    /** amount of earned tokens_in */
    income: string;
}
export declare const EventCreateSale: {
    encode(message: EventCreateSale, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EventCreateSale;
    fromJSON(object: any): EventCreateSale;
    toJSON(message: EventCreateSale): unknown;
    fromPartial(object: DeepPartial<EventCreateSale>): EventCreateSale;
};
export declare const EventSubscribe: {
    encode(message: EventSubscribe, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EventSubscribe;
    fromJSON(object: any): EventSubscribe;
    toJSON(message: EventSubscribe): unknown;
    fromPartial(object: DeepPartial<EventSubscribe>): EventSubscribe;
};
export declare const EventWithdraw: {
    encode(message: EventWithdraw, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EventWithdraw;
    fromJSON(object: any): EventWithdraw;
    toJSON(message: EventWithdraw): unknown;
    fromPartial(object: DeepPartial<EventWithdraw>): EventWithdraw;
};
export declare const EventExit: {
    encode(message: EventExit, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EventExit;
    fromJSON(object: any): EventExit;
    toJSON(message: EventExit): unknown;
    fromPartial(object: DeepPartial<EventExit>): EventExit;
};
export declare const EventFinalizeSale: {
    encode(message: EventFinalizeSale, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EventFinalizeSale;
    fromJSON(object: any): EventFinalizeSale;
    toJSON(message: EventFinalizeSale): unknown;
    fromPartial(object: DeepPartial<EventFinalizeSale>): EventFinalizeSale;
};
