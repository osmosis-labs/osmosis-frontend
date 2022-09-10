import { PageRequest, PageResponse } from "../../cosmos/base/query/v1beta1/pagination";
import { Coin } from "../../cosmos/base/v1beta1/coin";
import { Gauge } from "./gauge";
import { Duration } from "../../google/protobuf/duration";
import * as _m0 from "protobufjs/minimal";
import { DeepPartial, Long } from "@osmonauts/helpers";
export interface ModuleToDistributeCoinsRequest {
}
export interface ModuleToDistributeCoinsResponse {
    /** Coins that have yet to be distributed */
    coins: Coin[];
}
export interface ModuleDistributedCoinsRequest {
}
export interface ModuleDistributedCoinsResponse {
    /** Coins that have been distributed already */
    coins: Coin[];
}
export interface GaugeByIDRequest {
    /** Gague ID being queried */
    id: Long;
}
export interface GaugeByIDResponse {
    /** Gauge that corresponds to provided gague ID */
    gauge: Gauge;
}
export interface GaugesRequest {
    /** Pagination defines pagination for the request */
    pagination: PageRequest;
}
export interface GaugesResponse {
    /** Upcoming and active gauges */
    data: Gauge[];
    /** Pagination defines pagination for the response */
    pagination: PageResponse;
}
export interface ActiveGaugesRequest {
    /** Pagination defines pagination for the request */
    pagination: PageRequest;
}
export interface ActiveGaugesResponse {
    /** Active gagues only */
    data: Gauge[];
    /** Pagination defines pagination for the response */
    pagination: PageResponse;
}
export interface ActiveGaugesPerDenomRequest {
    /** Desired denom when querying active gagues */
    denom: string;
    /** Pagination defines pagination for the request */
    pagination: PageRequest;
}
export interface ActiveGaugesPerDenomResponse {
    /** Active gagues that match denom in query */
    data: Gauge[];
    /** Pagination defines pagination for the response */
    pagination: PageResponse;
}
export interface UpcomingGaugesRequest {
    /** Pagination defines pagination for the request */
    pagination: PageRequest;
}
export interface UpcomingGaugesResponse {
    /** Gauges whose distribution is upcoming */
    data: Gauge[];
    /** Pagination defines pagination for the response */
    pagination: PageResponse;
}
export interface UpcomingGaugesPerDenomRequest {
    /** Filter for upcoming gagues that match specific denom */
    denom: string;
    /** Pagination defines pagination for the request */
    pagination: PageRequest;
}
export interface UpcomingGaugesPerDenomResponse {
    /** Upcoming gagues that match denom in query */
    upcomingGauges: Gauge[];
    /** Pagination defines pagination for the response */
    pagination: PageResponse;
}
export interface RewardsEstRequest {
    /** Address that is being queried for future estimated rewards */
    owner: string;
    /** Lock IDs included in future reward estimation */
    lockIds: Long[];
    /**
     * Upper time limit of reward estimation
     * Lower limit is current epoch
     */
    endEpoch: Long;
}
export interface RewardsEstResponse {
    /**
     * Estimated coin rewards that will be recieved at provided address
     * from specified locks between current time and end epoch
     */
    coins: Coin[];
}
export interface QueryLockableDurationsRequest {
}
export interface QueryLockableDurationsResponse {
    /** Time durations that users can lock coins for in order to recieve rewards */
    lockableDurations: Duration[];
}
export declare const ModuleToDistributeCoinsRequest: {
    encode(_: ModuleToDistributeCoinsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ModuleToDistributeCoinsRequest;
    fromJSON(_: any): ModuleToDistributeCoinsRequest;
    toJSON(_: ModuleToDistributeCoinsRequest): unknown;
    fromPartial(_: DeepPartial<ModuleToDistributeCoinsRequest>): ModuleToDistributeCoinsRequest;
};
export declare const ModuleToDistributeCoinsResponse: {
    encode(message: ModuleToDistributeCoinsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ModuleToDistributeCoinsResponse;
    fromJSON(object: any): ModuleToDistributeCoinsResponse;
    toJSON(message: ModuleToDistributeCoinsResponse): unknown;
    fromPartial(object: DeepPartial<ModuleToDistributeCoinsResponse>): ModuleToDistributeCoinsResponse;
};
export declare const ModuleDistributedCoinsRequest: {
    encode(_: ModuleDistributedCoinsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ModuleDistributedCoinsRequest;
    fromJSON(_: any): ModuleDistributedCoinsRequest;
    toJSON(_: ModuleDistributedCoinsRequest): unknown;
    fromPartial(_: DeepPartial<ModuleDistributedCoinsRequest>): ModuleDistributedCoinsRequest;
};
export declare const ModuleDistributedCoinsResponse: {
    encode(message: ModuleDistributedCoinsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ModuleDistributedCoinsResponse;
    fromJSON(object: any): ModuleDistributedCoinsResponse;
    toJSON(message: ModuleDistributedCoinsResponse): unknown;
    fromPartial(object: DeepPartial<ModuleDistributedCoinsResponse>): ModuleDistributedCoinsResponse;
};
export declare const GaugeByIDRequest: {
    encode(message: GaugeByIDRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GaugeByIDRequest;
    fromJSON(object: any): GaugeByIDRequest;
    toJSON(message: GaugeByIDRequest): unknown;
    fromPartial(object: DeepPartial<GaugeByIDRequest>): GaugeByIDRequest;
};
export declare const GaugeByIDResponse: {
    encode(message: GaugeByIDResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GaugeByIDResponse;
    fromJSON(object: any): GaugeByIDResponse;
    toJSON(message: GaugeByIDResponse): unknown;
    fromPartial(object: DeepPartial<GaugeByIDResponse>): GaugeByIDResponse;
};
export declare const GaugesRequest: {
    encode(message: GaugesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GaugesRequest;
    fromJSON(object: any): GaugesRequest;
    toJSON(message: GaugesRequest): unknown;
    fromPartial(object: DeepPartial<GaugesRequest>): GaugesRequest;
};
export declare const GaugesResponse: {
    encode(message: GaugesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): GaugesResponse;
    fromJSON(object: any): GaugesResponse;
    toJSON(message: GaugesResponse): unknown;
    fromPartial(object: DeepPartial<GaugesResponse>): GaugesResponse;
};
export declare const ActiveGaugesRequest: {
    encode(message: ActiveGaugesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ActiveGaugesRequest;
    fromJSON(object: any): ActiveGaugesRequest;
    toJSON(message: ActiveGaugesRequest): unknown;
    fromPartial(object: DeepPartial<ActiveGaugesRequest>): ActiveGaugesRequest;
};
export declare const ActiveGaugesResponse: {
    encode(message: ActiveGaugesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ActiveGaugesResponse;
    fromJSON(object: any): ActiveGaugesResponse;
    toJSON(message: ActiveGaugesResponse): unknown;
    fromPartial(object: DeepPartial<ActiveGaugesResponse>): ActiveGaugesResponse;
};
export declare const ActiveGaugesPerDenomRequest: {
    encode(message: ActiveGaugesPerDenomRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ActiveGaugesPerDenomRequest;
    fromJSON(object: any): ActiveGaugesPerDenomRequest;
    toJSON(message: ActiveGaugesPerDenomRequest): unknown;
    fromPartial(object: DeepPartial<ActiveGaugesPerDenomRequest>): ActiveGaugesPerDenomRequest;
};
export declare const ActiveGaugesPerDenomResponse: {
    encode(message: ActiveGaugesPerDenomResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ActiveGaugesPerDenomResponse;
    fromJSON(object: any): ActiveGaugesPerDenomResponse;
    toJSON(message: ActiveGaugesPerDenomResponse): unknown;
    fromPartial(object: DeepPartial<ActiveGaugesPerDenomResponse>): ActiveGaugesPerDenomResponse;
};
export declare const UpcomingGaugesRequest: {
    encode(message: UpcomingGaugesRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UpcomingGaugesRequest;
    fromJSON(object: any): UpcomingGaugesRequest;
    toJSON(message: UpcomingGaugesRequest): unknown;
    fromPartial(object: DeepPartial<UpcomingGaugesRequest>): UpcomingGaugesRequest;
};
export declare const UpcomingGaugesResponse: {
    encode(message: UpcomingGaugesResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UpcomingGaugesResponse;
    fromJSON(object: any): UpcomingGaugesResponse;
    toJSON(message: UpcomingGaugesResponse): unknown;
    fromPartial(object: DeepPartial<UpcomingGaugesResponse>): UpcomingGaugesResponse;
};
export declare const UpcomingGaugesPerDenomRequest: {
    encode(message: UpcomingGaugesPerDenomRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UpcomingGaugesPerDenomRequest;
    fromJSON(object: any): UpcomingGaugesPerDenomRequest;
    toJSON(message: UpcomingGaugesPerDenomRequest): unknown;
    fromPartial(object: DeepPartial<UpcomingGaugesPerDenomRequest>): UpcomingGaugesPerDenomRequest;
};
export declare const UpcomingGaugesPerDenomResponse: {
    encode(message: UpcomingGaugesPerDenomResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UpcomingGaugesPerDenomResponse;
    fromJSON(object: any): UpcomingGaugesPerDenomResponse;
    toJSON(message: UpcomingGaugesPerDenomResponse): unknown;
    fromPartial(object: DeepPartial<UpcomingGaugesPerDenomResponse>): UpcomingGaugesPerDenomResponse;
};
export declare const RewardsEstRequest: {
    encode(message: RewardsEstRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RewardsEstRequest;
    fromJSON(object: any): RewardsEstRequest;
    toJSON(message: RewardsEstRequest): unknown;
    fromPartial(object: DeepPartial<RewardsEstRequest>): RewardsEstRequest;
};
export declare const RewardsEstResponse: {
    encode(message: RewardsEstResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RewardsEstResponse;
    fromJSON(object: any): RewardsEstResponse;
    toJSON(message: RewardsEstResponse): unknown;
    fromPartial(object: DeepPartial<RewardsEstResponse>): RewardsEstResponse;
};
export declare const QueryLockableDurationsRequest: {
    encode(_: QueryLockableDurationsRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryLockableDurationsRequest;
    fromJSON(_: any): QueryLockableDurationsRequest;
    toJSON(_: QueryLockableDurationsRequest): unknown;
    fromPartial(_: DeepPartial<QueryLockableDurationsRequest>): QueryLockableDurationsRequest;
};
export declare const QueryLockableDurationsResponse: {
    encode(message: QueryLockableDurationsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): QueryLockableDurationsResponse;
    fromJSON(object: any): QueryLockableDurationsResponse;
    toJSON(message: QueryLockableDurationsResponse): unknown;
    fromPartial(object: DeepPartial<QueryLockableDurationsResponse>): QueryLockableDurationsResponse;
};
