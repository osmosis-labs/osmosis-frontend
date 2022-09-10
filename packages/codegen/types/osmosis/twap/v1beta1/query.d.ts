import { Params } from "./genesis";
import * as _m0 from "protobufjs/minimal";
import { Long, DeepPartial } from "@osmonauts/helpers";
export interface GetArithmeticTwapRequest {
    poolId: Long;
    baseAsset: string;
    quoteAsset: string;
    startTime: Date;
    endTime?: Date;
}
export interface GetArithmeticTwapResponse {
    arithmeticTwap: string;
}
export interface GetArithmeticTwapToNowRequest {
    poolId: Long;
    baseAsset: string;
    quoteAsset: string;
    startTime: Date;
}
export interface GetArithmeticTwapToNowResponse {
    arithmeticTwap: string;
}
export interface ParamsRequest {
}
export interface ParamsResponse {
    params: Params;
}
export declare const GetArithmeticTwapRequest: {
    encode(message: GetArithmeticTwapRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetArithmeticTwapRequest;
    fromJSON(object: any): GetArithmeticTwapRequest;
    toJSON(message: GetArithmeticTwapRequest): unknown;
    fromPartial(object: DeepPartial<GetArithmeticTwapRequest>): GetArithmeticTwapRequest;
};
export declare const GetArithmeticTwapResponse: {
    encode(message: GetArithmeticTwapResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetArithmeticTwapResponse;
    fromJSON(object: any): GetArithmeticTwapResponse;
    toJSON(message: GetArithmeticTwapResponse): unknown;
    fromPartial(object: DeepPartial<GetArithmeticTwapResponse>): GetArithmeticTwapResponse;
};
export declare const GetArithmeticTwapToNowRequest: {
    encode(message: GetArithmeticTwapToNowRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetArithmeticTwapToNowRequest;
    fromJSON(object: any): GetArithmeticTwapToNowRequest;
    toJSON(message: GetArithmeticTwapToNowRequest): unknown;
    fromPartial(object: DeepPartial<GetArithmeticTwapToNowRequest>): GetArithmeticTwapToNowRequest;
};
export declare const GetArithmeticTwapToNowResponse: {
    encode(message: GetArithmeticTwapToNowResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GetArithmeticTwapToNowResponse;
    fromJSON(object: any): GetArithmeticTwapToNowResponse;
    toJSON(message: GetArithmeticTwapToNowResponse): unknown;
    fromPartial(object: DeepPartial<GetArithmeticTwapToNowResponse>): GetArithmeticTwapToNowResponse;
};
export declare const ParamsRequest: {
    encode(_: ParamsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ParamsRequest;
    fromJSON(_: any): ParamsRequest;
    toJSON(_: ParamsRequest): unknown;
    fromPartial(_: DeepPartial<ParamsRequest>): ParamsRequest;
};
export declare const ParamsResponse: {
    encode(message: ParamsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ParamsResponse;
    fromJSON(object: any): ParamsResponse;
    toJSON(message: ParamsResponse): unknown;
    fromPartial(object: DeepPartial<ParamsResponse>): ParamsResponse;
};
