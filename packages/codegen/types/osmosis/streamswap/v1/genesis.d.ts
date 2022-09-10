import { Sale, UserPosition } from "./state";
import { Params } from "./params";
import * as _m0 from "protobufjs/minimal";
import { Long, DeepPartial } from "@osmonauts/helpers";
/** GenesisState defines the streamswap module's genesis state. */
export interface GenesisState {
    sales: Sale[];
    userPositions: UserPositionKV[];
    nextSaleId: Long;
    params: Params;
}
/**
 * UserPositionKV is a record in genesis representing acc_address user position
 * of a sale_id sale.
 */
export interface UserPositionKV {
    /** user account address */
    accAddress: string;
    saleId: Long;
    userPosition: UserPosition;
}
export declare const GenesisState: {
    encode(message: GenesisState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState;
    fromJSON(object: any): GenesisState;
    toJSON(message: GenesisState): unknown;
    fromPartial(object: DeepPartial<GenesisState>): GenesisState;
};
export declare const UserPositionKV: {
    encode(message: UserPositionKV, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UserPositionKV;
    fromJSON(object: any): UserPositionKV;
    toJSON(message: UserPositionKV): unknown;
    fromPartial(object: DeepPartial<UserPositionKV>): UserPositionKV;
};
