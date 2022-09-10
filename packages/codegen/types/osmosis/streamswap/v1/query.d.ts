import { PageRequest, PageResponse } from "../../../cosmos/base/query/v1beta1/pagination";
import { Sale, UserPosition } from "./state";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial, Long } from "@osmonauts/helpers";
export interface QuerySales {
    /** pagination defines an pagination for the request. */
    pagination: PageRequest;
}
export interface QuerySalesResponse {
    sales: Sale[];
    pagination: PageResponse;
}
/** Request type for Query/Sale */
export interface QuerySale {
    /** Sale ID */
    saleId: Long;
}
export interface QuerySaleResponse {
    sale: Sale;
}
/** Request type for Query/Sale */
export interface QueryUserPosition {
    /** ID of the Sale */
    saleId: Long;
    /** user account address */
    user: string;
}
export interface QueryUserPositionResponse {
    userPosition: UserPosition;
}
export declare const QuerySales: {
    encode(message: QuerySales, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QuerySales;
    fromJSON(object: any): QuerySales;
    toJSON(message: QuerySales): unknown;
    fromPartial(object: DeepPartial<QuerySales>): QuerySales;
};
export declare const QuerySalesResponse: {
    encode(message: QuerySalesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QuerySalesResponse;
    fromJSON(object: any): QuerySalesResponse;
    toJSON(message: QuerySalesResponse): unknown;
    fromPartial(object: DeepPartial<QuerySalesResponse>): QuerySalesResponse;
};
export declare const QuerySale: {
    encode(message: QuerySale, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QuerySale;
    fromJSON(object: any): QuerySale;
    toJSON(message: QuerySale): unknown;
    fromPartial(object: DeepPartial<QuerySale>): QuerySale;
};
export declare const QuerySaleResponse: {
    encode(message: QuerySaleResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QuerySaleResponse;
    fromJSON(object: any): QuerySaleResponse;
    toJSON(message: QuerySaleResponse): unknown;
    fromPartial(object: DeepPartial<QuerySaleResponse>): QuerySaleResponse;
};
export declare const QueryUserPosition: {
    encode(message: QueryUserPosition, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryUserPosition;
    fromJSON(object: any): QueryUserPosition;
    toJSON(message: QueryUserPosition): unknown;
    fromPartial(object: DeepPartial<QueryUserPosition>): QueryUserPosition;
};
export declare const QueryUserPositionResponse: {
    encode(message: QueryUserPositionResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryUserPositionResponse;
    fromJSON(object: any): QueryUserPositionResponse;
    toJSON(message: QueryUserPositionResponse): unknown;
    fromPartial(object: DeepPartial<QueryUserPositionResponse>): QueryUserPositionResponse;
};
