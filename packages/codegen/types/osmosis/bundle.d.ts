import * as _135 from "./epochs/genesis";
import * as _136 from "./epochs/query";
import * as _137 from "./gamm/pool-models/balancer/balancerPool";
import * as _138 from "./gamm/v1beta1/genesis";
import * as _139 from "./gamm/v1beta1/query";
import * as _140 from "./gamm/v1beta1/tx";
import * as _141 from "./gamm/pool-models/balancer/tx/tx";
import * as _142 from "./gamm/pool-models/stableswap/stableswap_pool";
import * as _143 from "./gamm/pool-models/stableswap/tx";
import * as _144 from "./incentives/gauge";
import * as _145 from "./incentives/genesis";
import * as _146 from "./incentives/params";
import * as _147 from "./incentives/query";
import * as _148 from "./incentives/tx";
import * as _149 from "./lockup/genesis";
import * as _150 from "./lockup/lock";
import * as _151 from "./lockup/query";
import * as _152 from "./lockup/tx";
import * as _153 from "./mint/v1beta1/genesis";
import * as _154 from "./mint/v1beta1/mint";
import * as _155 from "./mint/v1beta1/query";
import * as _156 from "./pool-incentives/v1beta1/genesis";
import * as _157 from "./pool-incentives/v1beta1/gov";
import * as _158 from "./pool-incentives/v1beta1/incentives";
import * as _159 from "./pool-incentives/v1beta1/query";
import * as _160 from "./store/v1beta1/tree";
import * as _161 from "./streamswap/v1/event";
import * as _162 from "./streamswap/v1/genesis";
import * as _163 from "./streamswap/v1/params";
import * as _164 from "./streamswap/v1/query";
import * as _165 from "./streamswap/v1/state";
import * as _166 from "./streamswap/v1/tx";
import * as _167 from "./superfluid/genesis";
import * as _168 from "./superfluid/params";
import * as _169 from "./superfluid/query";
import * as _170 from "./superfluid/superfluid";
import * as _171 from "./superfluid/tx";
import * as _172 from "./tokenfactory/v1beta1/authorityMetadata";
import * as _173 from "./tokenfactory/v1beta1/genesis";
import * as _174 from "./tokenfactory/v1beta1/params";
import * as _175 from "./tokenfactory/v1beta1/query";
import * as _176 from "./tokenfactory/v1beta1/tx";
import * as _177 from "./twap/v1beta1/genesis";
import * as _178 from "./twap/v1beta1/query";
import * as _179 from "./twap/v1beta1/twap_record";
import * as _180 from "./txfees/v1beta1/feetoken";
import * as _181 from "./txfees/v1beta1/genesis";
import * as _182 from "./txfees/v1beta1/gov";
import * as _183 from "./txfees/v1beta1/query";
export declare namespace osmosis {
    namespace epochs {
        const v1beta1: {
            QueryEpochsInfoRequest: {
                encode(_: _136.QueryEpochsInfoRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _136.QueryEpochsInfoRequest;
                fromJSON(_: any): _136.QueryEpochsInfoRequest;
                toJSON(_: _136.QueryEpochsInfoRequest): unknown;
                fromPartial(_: {}): _136.QueryEpochsInfoRequest;
            };
            QueryEpochsInfoResponse: {
                encode(message: _136.QueryEpochsInfoResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _136.QueryEpochsInfoResponse;
                fromJSON(object: any): _136.QueryEpochsInfoResponse;
                toJSON(message: _136.QueryEpochsInfoResponse): unknown;
                fromPartial(object: {
                    epochs?: {
                        identifier?: string;
                        startTime?: Date;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        currentEpoch?: any;
                        currentEpochStartTime?: Date;
                        epochCountingStarted?: boolean;
                        currentEpochStartHeight?: any;
                    }[];
                }): _136.QueryEpochsInfoResponse;
            };
            QueryCurrentEpochRequest: {
                encode(message: _136.QueryCurrentEpochRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _136.QueryCurrentEpochRequest;
                fromJSON(object: any): _136.QueryCurrentEpochRequest;
                toJSON(message: _136.QueryCurrentEpochRequest): unknown;
                fromPartial(object: {
                    identifier?: string;
                }): _136.QueryCurrentEpochRequest;
            };
            QueryCurrentEpochResponse: {
                encode(message: _136.QueryCurrentEpochResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _136.QueryCurrentEpochResponse;
                fromJSON(object: any): _136.QueryCurrentEpochResponse;
                toJSON(message: _136.QueryCurrentEpochResponse): unknown;
                fromPartial(object: {
                    currentEpoch?: any;
                }): _136.QueryCurrentEpochResponse;
            };
            EpochInfo: {
                encode(message: _135.EpochInfo, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _135.EpochInfo;
                fromJSON(object: any): _135.EpochInfo;
                toJSON(message: _135.EpochInfo): unknown;
                fromPartial(object: {
                    identifier?: string;
                    startTime?: Date;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    currentEpoch?: any;
                    currentEpochStartTime?: Date;
                    epochCountingStarted?: boolean;
                    currentEpochStartHeight?: any;
                }): _135.EpochInfo;
            };
            GenesisState: {
                encode(message: _135.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _135.GenesisState;
                fromJSON(object: any): _135.GenesisState;
                toJSON(message: _135.GenesisState): unknown;
                fromPartial(object: {
                    epochs?: {
                        identifier?: string;
                        startTime?: Date;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        currentEpoch?: any;
                        currentEpochStartTime?: Date;
                        epochCountingStarted?: boolean;
                        currentEpochStartHeight?: any;
                    }[];
                }): _135.GenesisState;
            };
        };
    }
    namespace gamm {
        const v1beta1: {
            registry: readonly [string, import("@cosmjs/proto-signing").GeneratedType][];
            load: (protoRegistry: import("@cosmjs/proto-signing").Registry) => void;
            MessageComposer: {
                encoded: {
                    joinPool(value: _140.MsgJoinPool): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    exitPool(value: _140.MsgExitPool): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    swapExactAmountIn(value: _140.MsgSwapExactAmountIn): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    swapExactAmountOut(value: _140.MsgSwapExactAmountOut): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    joinSwapExternAmountIn(value: _140.MsgJoinSwapExternAmountIn): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    joinSwapShareAmountOut(value: _140.MsgJoinSwapShareAmountOut): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    exitSwapExternAmountOut(value: _140.MsgExitSwapExternAmountOut): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    exitSwapShareAmountIn(value: _140.MsgExitSwapShareAmountIn): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                };
                withTypeUrl: {
                    joinPool(value: _140.MsgJoinPool): {
                        typeUrl: string;
                        value: _140.MsgJoinPool;
                    };
                    exitPool(value: _140.MsgExitPool): {
                        typeUrl: string;
                        value: _140.MsgExitPool;
                    };
                    swapExactAmountIn(value: _140.MsgSwapExactAmountIn): {
                        typeUrl: string;
                        value: _140.MsgSwapExactAmountIn;
                    };
                    swapExactAmountOut(value: _140.MsgSwapExactAmountOut): {
                        typeUrl: string;
                        value: _140.MsgSwapExactAmountOut;
                    };
                    joinSwapExternAmountIn(value: _140.MsgJoinSwapExternAmountIn): {
                        typeUrl: string;
                        value: _140.MsgJoinSwapExternAmountIn;
                    };
                    joinSwapShareAmountOut(value: _140.MsgJoinSwapShareAmountOut): {
                        typeUrl: string;
                        value: _140.MsgJoinSwapShareAmountOut;
                    };
                    exitSwapExternAmountOut(value: _140.MsgExitSwapExternAmountOut): {
                        typeUrl: string;
                        value: _140.MsgExitSwapExternAmountOut;
                    };
                    exitSwapShareAmountIn(value: _140.MsgExitSwapShareAmountIn): {
                        typeUrl: string;
                        value: _140.MsgExitSwapShareAmountIn;
                    };
                };
                toJSON: {
                    joinPool(value: _140.MsgJoinPool): {
                        typeUrl: string;
                        value: unknown;
                    };
                    exitPool(value: _140.MsgExitPool): {
                        typeUrl: string;
                        value: unknown;
                    };
                    swapExactAmountIn(value: _140.MsgSwapExactAmountIn): {
                        typeUrl: string;
                        value: unknown;
                    };
                    swapExactAmountOut(value: _140.MsgSwapExactAmountOut): {
                        typeUrl: string;
                        value: unknown;
                    };
                    joinSwapExternAmountIn(value: _140.MsgJoinSwapExternAmountIn): {
                        typeUrl: string;
                        value: unknown;
                    };
                    joinSwapShareAmountOut(value: _140.MsgJoinSwapShareAmountOut): {
                        typeUrl: string;
                        value: unknown;
                    };
                    exitSwapExternAmountOut(value: _140.MsgExitSwapExternAmountOut): {
                        typeUrl: string;
                        value: unknown;
                    };
                    exitSwapShareAmountIn(value: _140.MsgExitSwapShareAmountIn): {
                        typeUrl: string;
                        value: unknown;
                    };
                };
                fromJSON: {
                    joinPool(value: any): {
                        typeUrl: string;
                        value: _140.MsgJoinPool;
                    };
                    exitPool(value: any): {
                        typeUrl: string;
                        value: _140.MsgExitPool;
                    };
                    swapExactAmountIn(value: any): {
                        typeUrl: string;
                        value: _140.MsgSwapExactAmountIn;
                    };
                    swapExactAmountOut(value: any): {
                        typeUrl: string;
                        value: _140.MsgSwapExactAmountOut;
                    };
                    joinSwapExternAmountIn(value: any): {
                        typeUrl: string;
                        value: _140.MsgJoinSwapExternAmountIn;
                    };
                    joinSwapShareAmountOut(value: any): {
                        typeUrl: string;
                        value: _140.MsgJoinSwapShareAmountOut;
                    };
                    exitSwapExternAmountOut(value: any): {
                        typeUrl: string;
                        value: _140.MsgExitSwapExternAmountOut;
                    };
                    exitSwapShareAmountIn(value: any): {
                        typeUrl: string;
                        value: _140.MsgExitSwapShareAmountIn;
                    };
                };
                fromPartial: {
                    joinPool(value: _140.MsgJoinPool): {
                        typeUrl: string;
                        value: _140.MsgJoinPool;
                    };
                    exitPool(value: _140.MsgExitPool): {
                        typeUrl: string;
                        value: _140.MsgExitPool;
                    };
                    swapExactAmountIn(value: _140.MsgSwapExactAmountIn): {
                        typeUrl: string;
                        value: _140.MsgSwapExactAmountIn;
                    };
                    swapExactAmountOut(value: _140.MsgSwapExactAmountOut): {
                        typeUrl: string;
                        value: _140.MsgSwapExactAmountOut;
                    };
                    joinSwapExternAmountIn(value: _140.MsgJoinSwapExternAmountIn): {
                        typeUrl: string;
                        value: _140.MsgJoinSwapExternAmountIn;
                    };
                    joinSwapShareAmountOut(value: _140.MsgJoinSwapShareAmountOut): {
                        typeUrl: string;
                        value: _140.MsgJoinSwapShareAmountOut;
                    };
                    exitSwapExternAmountOut(value: _140.MsgExitSwapExternAmountOut): {
                        typeUrl: string;
                        value: _140.MsgExitSwapExternAmountOut;
                    };
                    exitSwapShareAmountIn(value: _140.MsgExitSwapShareAmountIn): {
                        typeUrl: string;
                        value: _140.MsgExitSwapShareAmountIn;
                    };
                };
            };
            AminoConverter: {
                "/osmosis.gamm.v1beta1.MsgJoinPool": {
                    aminoType: string;
                    toAmino: ({ sender, poolId, shareOutAmount, tokenInMaxs }: _140.MsgJoinPool) => {
                        sender: string;
                        pool_id: string;
                        share_out_amount: string;
                        token_in_maxs: {
                            denom: string;
                            amount: string;
                        }[];
                    };
                    fromAmino: ({ sender, pool_id, share_out_amount, token_in_maxs }: {
                        sender: string;
                        pool_id: string;
                        share_out_amount: string;
                        token_in_maxs: {
                            denom: string;
                            amount: string;
                        }[];
                    }) => _140.MsgJoinPool;
                };
                "/osmosis.gamm.v1beta1.MsgExitPool": {
                    aminoType: string;
                    toAmino: ({ sender, poolId, shareInAmount, tokenOutMins }: _140.MsgExitPool) => {
                        sender: string;
                        pool_id: string;
                        share_in_amount: string;
                        token_out_mins: {
                            denom: string;
                            amount: string;
                        }[];
                    };
                    fromAmino: ({ sender, pool_id, share_in_amount, token_out_mins }: {
                        sender: string;
                        pool_id: string;
                        share_in_amount: string;
                        token_out_mins: {
                            denom: string;
                            amount: string;
                        }[];
                    }) => _140.MsgExitPool;
                };
                "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn": {
                    aminoType: string;
                    toAmino: ({ sender, routes, tokenIn, tokenOutMinAmount }: _140.MsgSwapExactAmountIn) => {
                        sender: string;
                        routes: {
                            pool_id: string;
                            token_out_denom: string;
                        }[];
                        token_in: {
                            denom: string;
                            amount: string;
                        };
                        token_out_min_amount: string;
                    };
                    fromAmino: ({ sender, routes, token_in, token_out_min_amount }: {
                        sender: string;
                        routes: {
                            pool_id: string;
                            token_out_denom: string;
                        }[];
                        token_in: {
                            denom: string;
                            amount: string;
                        };
                        token_out_min_amount: string;
                    }) => _140.MsgSwapExactAmountIn;
                };
                "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut": {
                    aminoType: string;
                    toAmino: ({ sender, routes, tokenInMaxAmount, tokenOut }: _140.MsgSwapExactAmountOut) => {
                        sender: string;
                        routes: {
                            pool_id: string;
                            token_in_denom: string;
                        }[];
                        token_in_max_amount: string;
                        token_out: {
                            denom: string;
                            amount: string;
                        };
                    };
                    fromAmino: ({ sender, routes, token_in_max_amount, token_out }: {
                        sender: string;
                        routes: {
                            pool_id: string;
                            token_in_denom: string;
                        }[];
                        token_in_max_amount: string;
                        token_out: {
                            denom: string;
                            amount: string;
                        };
                    }) => _140.MsgSwapExactAmountOut;
                };
                "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn": {
                    aminoType: string;
                    toAmino: ({ sender, poolId, tokenIn, shareOutMinAmount }: _140.MsgJoinSwapExternAmountIn) => {
                        sender: string;
                        pool_id: string;
                        token_in: {
                            denom: string;
                            amount: string;
                        };
                        share_out_min_amount: string;
                    };
                    fromAmino: ({ sender, pool_id, token_in, share_out_min_amount }: {
                        sender: string;
                        pool_id: string;
                        token_in: {
                            denom: string;
                            amount: string;
                        };
                        share_out_min_amount: string;
                    }) => _140.MsgJoinSwapExternAmountIn;
                };
                "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut": {
                    aminoType: string;
                    toAmino: ({ sender, poolId, tokenInDenom, shareOutAmount, tokenInMaxAmount }: _140.MsgJoinSwapShareAmountOut) => {
                        sender: string;
                        pool_id: string;
                        token_in_denom: string;
                        share_out_amount: string;
                        token_in_max_amount: string;
                    };
                    fromAmino: ({ sender, pool_id, token_in_denom, share_out_amount, token_in_max_amount }: {
                        sender: string;
                        pool_id: string;
                        token_in_denom: string;
                        share_out_amount: string;
                        token_in_max_amount: string;
                    }) => _140.MsgJoinSwapShareAmountOut;
                };
                "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut": {
                    aminoType: string;
                    toAmino: ({ sender, poolId, tokenOut, shareInMaxAmount }: _140.MsgExitSwapExternAmountOut) => {
                        sender: string;
                        pool_id: string;
                        token_out: {
                            denom: string;
                            amount: string;
                        };
                        share_in_max_amount: string;
                    };
                    fromAmino: ({ sender, pool_id, token_out, share_in_max_amount }: {
                        sender: string;
                        pool_id: string;
                        token_out: {
                            denom: string;
                            amount: string;
                        };
                        share_in_max_amount: string;
                    }) => _140.MsgExitSwapExternAmountOut;
                };
                "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn": {
                    aminoType: string;
                    toAmino: ({ sender, poolId, tokenOutDenom, shareInAmount, tokenOutMinAmount }: _140.MsgExitSwapShareAmountIn) => {
                        sender: string;
                        pool_id: string;
                        token_out_denom: string;
                        share_in_amount: string;
                        token_out_min_amount: string;
                    };
                    fromAmino: ({ sender, pool_id, token_out_denom, share_in_amount, token_out_min_amount }: {
                        sender: string;
                        pool_id: string;
                        token_out_denom: string;
                        share_in_amount: string;
                        token_out_min_amount: string;
                    }) => _140.MsgExitSwapShareAmountIn;
                };
            };
            MsgJoinPool: {
                encode(message: _140.MsgJoinPool, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgJoinPool;
                fromJSON(object: any): _140.MsgJoinPool;
                toJSON(message: _140.MsgJoinPool): unknown;
                fromPartial(object: {
                    sender?: string;
                    poolId?: any;
                    shareOutAmount?: string;
                    tokenInMaxs?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }): _140.MsgJoinPool;
            };
            MsgJoinPoolResponse: {
                encode(message: _140.MsgJoinPoolResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgJoinPoolResponse;
                fromJSON(object: any): _140.MsgJoinPoolResponse;
                toJSON(message: _140.MsgJoinPoolResponse): unknown;
                fromPartial(object: {
                    shareOutAmount?: string;
                    tokenIn?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }): _140.MsgJoinPoolResponse;
            };
            MsgExitPool: {
                encode(message: _140.MsgExitPool, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgExitPool;
                fromJSON(object: any): _140.MsgExitPool;
                toJSON(message: _140.MsgExitPool): unknown;
                fromPartial(object: {
                    sender?: string;
                    poolId?: any;
                    shareInAmount?: string;
                    tokenOutMins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }): _140.MsgExitPool;
            };
            MsgExitPoolResponse: {
                encode(message: _140.MsgExitPoolResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgExitPoolResponse;
                fromJSON(object: any): _140.MsgExitPoolResponse;
                toJSON(message: _140.MsgExitPoolResponse): unknown;
                fromPartial(object: {
                    tokenOut?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }): _140.MsgExitPoolResponse;
            };
            SwapAmountInRoute: {
                encode(message: _140.SwapAmountInRoute, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.SwapAmountInRoute;
                fromJSON(object: any): _140.SwapAmountInRoute;
                toJSON(message: _140.SwapAmountInRoute): unknown;
                fromPartial(object: {
                    poolId?: any;
                    tokenOutDenom?: string;
                }): _140.SwapAmountInRoute;
            };
            MsgSwapExactAmountIn: {
                encode(message: _140.MsgSwapExactAmountIn, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgSwapExactAmountIn;
                fromJSON(object: any): _140.MsgSwapExactAmountIn;
                toJSON(message: _140.MsgSwapExactAmountIn): unknown;
                fromPartial(object: {
                    sender?: string;
                    routes?: {
                        poolId?: any;
                        tokenOutDenom?: string;
                    }[];
                    tokenIn?: {
                        denom?: string;
                        amount?: string;
                    };
                    tokenOutMinAmount?: string;
                }): _140.MsgSwapExactAmountIn;
            };
            MsgSwapExactAmountInResponse: {
                encode(message: _140.MsgSwapExactAmountInResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgSwapExactAmountInResponse;
                fromJSON(object: any): _140.MsgSwapExactAmountInResponse;
                toJSON(message: _140.MsgSwapExactAmountInResponse): unknown;
                fromPartial(object: {
                    tokenOutAmount?: string;
                }): _140.MsgSwapExactAmountInResponse;
            };
            SwapAmountOutRoute: {
                encode(message: _140.SwapAmountOutRoute, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.SwapAmountOutRoute;
                fromJSON(object: any): _140.SwapAmountOutRoute;
                toJSON(message: _140.SwapAmountOutRoute): unknown;
                fromPartial(object: {
                    poolId?: any;
                    tokenInDenom?: string;
                }): _140.SwapAmountOutRoute;
            };
            MsgSwapExactAmountOut: {
                encode(message: _140.MsgSwapExactAmountOut, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgSwapExactAmountOut;
                fromJSON(object: any): _140.MsgSwapExactAmountOut;
                toJSON(message: _140.MsgSwapExactAmountOut): unknown;
                fromPartial(object: {
                    sender?: string;
                    routes?: {
                        poolId?: any;
                        tokenInDenom?: string;
                    }[];
                    tokenInMaxAmount?: string;
                    tokenOut?: {
                        denom?: string;
                        amount?: string;
                    };
                }): _140.MsgSwapExactAmountOut;
            };
            MsgSwapExactAmountOutResponse: {
                encode(message: _140.MsgSwapExactAmountOutResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgSwapExactAmountOutResponse;
                fromJSON(object: any): _140.MsgSwapExactAmountOutResponse;
                toJSON(message: _140.MsgSwapExactAmountOutResponse): unknown;
                fromPartial(object: {
                    tokenInAmount?: string;
                }): _140.MsgSwapExactAmountOutResponse;
            };
            MsgJoinSwapExternAmountIn: {
                encode(message: _140.MsgJoinSwapExternAmountIn, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgJoinSwapExternAmountIn;
                fromJSON(object: any): _140.MsgJoinSwapExternAmountIn;
                toJSON(message: _140.MsgJoinSwapExternAmountIn): unknown;
                fromPartial(object: {
                    sender?: string;
                    poolId?: any;
                    tokenIn?: {
                        denom?: string;
                        amount?: string;
                    };
                    shareOutMinAmount?: string;
                }): _140.MsgJoinSwapExternAmountIn;
            };
            MsgJoinSwapExternAmountInResponse: {
                encode(message: _140.MsgJoinSwapExternAmountInResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgJoinSwapExternAmountInResponse;
                fromJSON(object: any): _140.MsgJoinSwapExternAmountInResponse;
                toJSON(message: _140.MsgJoinSwapExternAmountInResponse): unknown;
                fromPartial(object: {
                    shareOutAmount?: string;
                }): _140.MsgJoinSwapExternAmountInResponse;
            };
            MsgJoinSwapShareAmountOut: {
                encode(message: _140.MsgJoinSwapShareAmountOut, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgJoinSwapShareAmountOut;
                fromJSON(object: any): _140.MsgJoinSwapShareAmountOut;
                toJSON(message: _140.MsgJoinSwapShareAmountOut): unknown;
                fromPartial(object: {
                    sender?: string;
                    poolId?: any;
                    tokenInDenom?: string;
                    shareOutAmount?: string;
                    tokenInMaxAmount?: string;
                }): _140.MsgJoinSwapShareAmountOut;
            };
            MsgJoinSwapShareAmountOutResponse: {
                encode(message: _140.MsgJoinSwapShareAmountOutResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgJoinSwapShareAmountOutResponse;
                fromJSON(object: any): _140.MsgJoinSwapShareAmountOutResponse;
                toJSON(message: _140.MsgJoinSwapShareAmountOutResponse): unknown;
                fromPartial(object: {
                    tokenInAmount?: string;
                }): _140.MsgJoinSwapShareAmountOutResponse;
            };
            MsgExitSwapShareAmountIn: {
                encode(message: _140.MsgExitSwapShareAmountIn, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgExitSwapShareAmountIn;
                fromJSON(object: any): _140.MsgExitSwapShareAmountIn;
                toJSON(message: _140.MsgExitSwapShareAmountIn): unknown;
                fromPartial(object: {
                    sender?: string;
                    poolId?: any;
                    tokenOutDenom?: string;
                    shareInAmount?: string;
                    tokenOutMinAmount?: string;
                }): _140.MsgExitSwapShareAmountIn;
            };
            MsgExitSwapShareAmountInResponse: {
                encode(message: _140.MsgExitSwapShareAmountInResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgExitSwapShareAmountInResponse;
                fromJSON(object: any): _140.MsgExitSwapShareAmountInResponse;
                toJSON(message: _140.MsgExitSwapShareAmountInResponse): unknown;
                fromPartial(object: {
                    tokenOutAmount?: string;
                }): _140.MsgExitSwapShareAmountInResponse;
            };
            MsgExitSwapExternAmountOut: {
                encode(message: _140.MsgExitSwapExternAmountOut, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgExitSwapExternAmountOut;
                fromJSON(object: any): _140.MsgExitSwapExternAmountOut;
                toJSON(message: _140.MsgExitSwapExternAmountOut): unknown;
                fromPartial(object: {
                    sender?: string;
                    poolId?: any;
                    tokenOut?: {
                        denom?: string;
                        amount?: string;
                    };
                    shareInMaxAmount?: string;
                }): _140.MsgExitSwapExternAmountOut;
            };
            MsgExitSwapExternAmountOutResponse: {
                encode(message: _140.MsgExitSwapExternAmountOutResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _140.MsgExitSwapExternAmountOutResponse;
                fromJSON(object: any): _140.MsgExitSwapExternAmountOutResponse;
                toJSON(message: _140.MsgExitSwapExternAmountOutResponse): unknown;
                fromPartial(object: {
                    shareInAmount?: string;
                }): _140.MsgExitSwapExternAmountOutResponse;
            };
            QueryPoolRequest: {
                encode(message: _139.QueryPoolRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryPoolRequest;
                fromJSON(object: any): _139.QueryPoolRequest;
                toJSON(message: _139.QueryPoolRequest): unknown;
                fromPartial(object: {
                    poolId?: any;
                }): _139.QueryPoolRequest;
            };
            QueryPoolResponse: {
                encode(message: _139.QueryPoolResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryPoolResponse;
                fromJSON(object: any): _139.QueryPoolResponse;
                toJSON(message: _139.QueryPoolResponse): unknown;
                fromPartial(object: {
                    pool?: {
                        typeUrl?: string;
                        value?: Uint8Array;
                    };
                }): _139.QueryPoolResponse;
            };
            QueryPoolsRequest: {
                encode(message: _139.QueryPoolsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryPoolsRequest;
                fromJSON(object: any): _139.QueryPoolsRequest;
                toJSON(message: _139.QueryPoolsRequest): unknown;
                fromPartial(object: {
                    pagination?: {
                        key?: Uint8Array;
                        offset?: any;
                        limit?: any;
                        countTotal?: boolean;
                        reverse?: boolean;
                    };
                }): _139.QueryPoolsRequest;
            };
            QueryPoolsResponse: {
                encode(message: _139.QueryPoolsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryPoolsResponse;
                fromJSON(object: any): _139.QueryPoolsResponse;
                toJSON(message: _139.QueryPoolsResponse): unknown;
                fromPartial(object: {
                    pools?: {
                        typeUrl?: string;
                        value?: Uint8Array;
                    }[];
                    pagination?: {
                        nextKey?: Uint8Array;
                        total?: any;
                    };
                }): _139.QueryPoolsResponse;
            };
            QueryNumPoolsRequest: {
                encode(_: _139.QueryNumPoolsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryNumPoolsRequest;
                fromJSON(_: any): _139.QueryNumPoolsRequest;
                toJSON(_: _139.QueryNumPoolsRequest): unknown;
                fromPartial(_: {}): _139.QueryNumPoolsRequest;
            };
            QueryNumPoolsResponse: {
                encode(message: _139.QueryNumPoolsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryNumPoolsResponse;
                fromJSON(object: any): _139.QueryNumPoolsResponse;
                toJSON(message: _139.QueryNumPoolsResponse): unknown;
                fromPartial(object: {
                    numPools?: any;
                }): _139.QueryNumPoolsResponse;
            };
            QueryPoolParamsRequest: {
                encode(message: _139.QueryPoolParamsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryPoolParamsRequest;
                fromJSON(object: any): _139.QueryPoolParamsRequest;
                toJSON(message: _139.QueryPoolParamsRequest): unknown;
                fromPartial(object: {
                    poolId?: any;
                }): _139.QueryPoolParamsRequest;
            };
            QueryPoolParamsResponse: {
                encode(message: _139.QueryPoolParamsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryPoolParamsResponse;
                fromJSON(object: any): _139.QueryPoolParamsResponse;
                toJSON(message: _139.QueryPoolParamsResponse): unknown;
                fromPartial(object: {
                    params?: {
                        typeUrl?: string;
                        value?: Uint8Array;
                    };
                }): _139.QueryPoolParamsResponse;
            };
            QueryTotalPoolLiquidityRequest: {
                encode(message: _139.QueryTotalPoolLiquidityRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryTotalPoolLiquidityRequest;
                fromJSON(object: any): _139.QueryTotalPoolLiquidityRequest;
                toJSON(message: _139.QueryTotalPoolLiquidityRequest): unknown;
                fromPartial(object: {
                    poolId?: any;
                }): _139.QueryTotalPoolLiquidityRequest;
            };
            QueryTotalPoolLiquidityResponse: {
                encode(message: _139.QueryTotalPoolLiquidityResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryTotalPoolLiquidityResponse;
                fromJSON(object: any): _139.QueryTotalPoolLiquidityResponse;
                toJSON(message: _139.QueryTotalPoolLiquidityResponse): unknown;
                fromPartial(object: {
                    liquidity?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }): _139.QueryTotalPoolLiquidityResponse;
            };
            QueryTotalSharesRequest: {
                encode(message: _139.QueryTotalSharesRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryTotalSharesRequest;
                fromJSON(object: any): _139.QueryTotalSharesRequest;
                toJSON(message: _139.QueryTotalSharesRequest): unknown;
                fromPartial(object: {
                    poolId?: any;
                }): _139.QueryTotalSharesRequest;
            };
            QueryTotalSharesResponse: {
                encode(message: _139.QueryTotalSharesResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryTotalSharesResponse;
                fromJSON(object: any): _139.QueryTotalSharesResponse;
                toJSON(message: _139.QueryTotalSharesResponse): unknown;
                fromPartial(object: {
                    totalShares?: {
                        denom?: string;
                        amount?: string;
                    };
                }): _139.QueryTotalSharesResponse;
            };
            QuerySpotPriceRequest: {
                encode(message: _139.QuerySpotPriceRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QuerySpotPriceRequest;
                fromJSON(object: any): _139.QuerySpotPriceRequest;
                toJSON(message: _139.QuerySpotPriceRequest): unknown;
                fromPartial(object: {
                    poolId?: any;
                    baseAssetDenom?: string;
                    quoteAssetDenom?: string;
                }): _139.QuerySpotPriceRequest;
            };
            QuerySpotPriceResponse: {
                encode(message: _139.QuerySpotPriceResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QuerySpotPriceResponse;
                fromJSON(object: any): _139.QuerySpotPriceResponse;
                toJSON(message: _139.QuerySpotPriceResponse): unknown;
                fromPartial(object: {
                    spotPrice?: string;
                }): _139.QuerySpotPriceResponse;
            };
            QuerySwapExactAmountInRequest: {
                encode(message: _139.QuerySwapExactAmountInRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QuerySwapExactAmountInRequest;
                fromJSON(object: any): _139.QuerySwapExactAmountInRequest;
                toJSON(message: _139.QuerySwapExactAmountInRequest): unknown;
                fromPartial(object: {
                    sender?: string;
                    poolId?: any;
                    tokenIn?: string;
                    routes?: {
                        poolId?: any;
                        tokenOutDenom?: string;
                    }[];
                }): _139.QuerySwapExactAmountInRequest;
            };
            QuerySwapExactAmountInResponse: {
                encode(message: _139.QuerySwapExactAmountInResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QuerySwapExactAmountInResponse;
                fromJSON(object: any): _139.QuerySwapExactAmountInResponse;
                toJSON(message: _139.QuerySwapExactAmountInResponse): unknown;
                fromPartial(object: {
                    tokenOutAmount?: string;
                }): _139.QuerySwapExactAmountInResponse;
            };
            QuerySwapExactAmountOutRequest: {
                encode(message: _139.QuerySwapExactAmountOutRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QuerySwapExactAmountOutRequest;
                fromJSON(object: any): _139.QuerySwapExactAmountOutRequest;
                toJSON(message: _139.QuerySwapExactAmountOutRequest): unknown;
                fromPartial(object: {
                    sender?: string;
                    poolId?: any;
                    routes?: {
                        poolId?: any;
                        tokenInDenom?: string;
                    }[];
                    tokenOut?: string;
                }): _139.QuerySwapExactAmountOutRequest;
            };
            QuerySwapExactAmountOutResponse: {
                encode(message: _139.QuerySwapExactAmountOutResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QuerySwapExactAmountOutResponse;
                fromJSON(object: any): _139.QuerySwapExactAmountOutResponse;
                toJSON(message: _139.QuerySwapExactAmountOutResponse): unknown;
                fromPartial(object: {
                    tokenInAmount?: string;
                }): _139.QuerySwapExactAmountOutResponse;
            };
            QueryTotalLiquidityRequest: {
                encode(_: _139.QueryTotalLiquidityRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryTotalLiquidityRequest;
                fromJSON(_: any): _139.QueryTotalLiquidityRequest;
                toJSON(_: _139.QueryTotalLiquidityRequest): unknown;
                fromPartial(_: {}): _139.QueryTotalLiquidityRequest;
            };
            QueryTotalLiquidityResponse: {
                encode(message: _139.QueryTotalLiquidityResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _139.QueryTotalLiquidityResponse;
                fromJSON(object: any): _139.QueryTotalLiquidityResponse;
                toJSON(message: _139.QueryTotalLiquidityResponse): unknown;
                fromPartial(object: {
                    liquidity?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }): _139.QueryTotalLiquidityResponse;
            };
            Params: {
                encode(message: _138.Params, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _138.Params;
                fromJSON(object: any): _138.Params;
                toJSON(message: _138.Params): unknown;
                fromPartial(object: {
                    poolCreationFee?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }): _138.Params;
            };
            GenesisState: {
                encode(message: _138.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _138.GenesisState;
                fromJSON(object: any): _138.GenesisState;
                toJSON(message: _138.GenesisState): unknown;
                fromPartial(object: {
                    pools?: {
                        typeUrl?: string;
                        value?: Uint8Array;
                    }[];
                    nextPoolNumber?: any;
                    params?: {
                        poolCreationFee?: {
                            denom?: string;
                            amount?: string;
                        }[];
                    };
                }): _138.GenesisState;
            };
            SmoothWeightChangeParams: {
                encode(message: _137.SmoothWeightChangeParams, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _137.SmoothWeightChangeParams;
                fromJSON(object: any): _137.SmoothWeightChangeParams;
                toJSON(message: _137.SmoothWeightChangeParams): unknown;
                fromPartial(object: {
                    startTime?: Date;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    initialPoolWeights?: {
                        token?: {
                            denom?: string;
                            amount?: string;
                        };
                        weight?: string;
                    }[];
                    targetPoolWeights?: {
                        token?: {
                            denom?: string;
                            amount?: string;
                        };
                        weight?: string;
                    }[];
                }): _137.SmoothWeightChangeParams;
            };
            PoolParams: {
                encode(message: _137.PoolParams, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _137.PoolParams;
                fromJSON(object: any): _137.PoolParams;
                toJSON(message: _137.PoolParams): unknown;
                fromPartial(object: {
                    swapFee?: string;
                    exitFee?: string;
                    smoothWeightChangeParams?: {
                        startTime?: Date;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        initialPoolWeights?: {
                            token?: {
                                denom?: string;
                                amount?: string;
                            };
                            weight?: string;
                        }[];
                        targetPoolWeights?: {
                            token?: {
                                denom?: string;
                                amount?: string;
                            };
                            weight?: string;
                        }[];
                    };
                }): _137.PoolParams;
            };
            PoolAsset: {
                encode(message: _137.PoolAsset, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _137.PoolAsset;
                fromJSON(object: any): _137.PoolAsset;
                toJSON(message: _137.PoolAsset): unknown;
                fromPartial(object: {
                    token?: {
                        denom?: string;
                        amount?: string;
                    };
                    weight?: string;
                }): _137.PoolAsset;
            };
            Pool: {
                encode(message: _137.Pool, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _137.Pool;
                fromJSON(object: any): _137.Pool;
                toJSON(message: _137.Pool): unknown;
                fromPartial(object: {
                    address?: string;
                    id?: any;
                    poolParams?: {
                        swapFee?: string;
                        exitFee?: string;
                        smoothWeightChangeParams?: {
                            startTime?: Date;
                            duration?: {
                                seconds?: any;
                                nanos?: number;
                            };
                            initialPoolWeights?: {
                                token?: {
                                    denom?: string;
                                    amount?: string;
                                };
                                weight?: string;
                            }[];
                            targetPoolWeights?: {
                                token?: {
                                    denom?: string;
                                    amount?: string;
                                };
                                weight?: string;
                            }[];
                        };
                    };
                    futurePoolGovernor?: string;
                    totalShares?: {
                        denom?: string;
                        amount?: string;
                    };
                    poolAssets?: {
                        token?: {
                            denom?: string;
                            amount?: string;
                        };
                        weight?: string;
                    }[];
                    totalWeight?: string;
                }): _137.Pool;
            };
        };
        namespace poolmodels {
            namespace balancer {
                const v1beta1: {
                    registry: readonly [string, import("@cosmjs/proto-signing").GeneratedType][];
                    load: (protoRegistry: import("@cosmjs/proto-signing").Registry) => void;
                    MessageComposer: {
                        encoded: {
                            createBalancerPool(value: _141.MsgCreateBalancerPool): {
                                typeUrl: string;
                                value: Uint8Array;
                            };
                        };
                        withTypeUrl: {
                            createBalancerPool(value: _141.MsgCreateBalancerPool): {
                                typeUrl: string;
                                value: _141.MsgCreateBalancerPool;
                            };
                        };
                        toJSON: {
                            createBalancerPool(value: _141.MsgCreateBalancerPool): {
                                typeUrl: string;
                                value: unknown;
                            };
                        };
                        fromJSON: {
                            createBalancerPool(value: any): {
                                typeUrl: string;
                                value: _141.MsgCreateBalancerPool;
                            };
                        };
                        fromPartial: {
                            createBalancerPool(value: _141.MsgCreateBalancerPool): {
                                typeUrl: string;
                                value: _141.MsgCreateBalancerPool;
                            };
                        };
                    };
                    AminoConverter: {
                        "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool": {
                            aminoType: string;
                            toAmino: ({ sender, poolParams, poolAssets, futurePoolGovernor }: _141.MsgCreateBalancerPool) => {
                                sender: string;
                                pool_params: {
                                    swap_fee: string;
                                    exit_fee: string;
                                    smooth_weight_change_params: {
                                        start_time: {
                                            seconds: string;
                                            nanos: number;
                                        };
                                        duration: {
                                            seconds: string;
                                            nanos: number;
                                        };
                                        initial_pool_weights: {
                                            token: {
                                                denom: string;
                                                amount: string;
                                            };
                                            weight: string;
                                        }[];
                                        target_pool_weights: {
                                            token: {
                                                denom: string;
                                                amount: string;
                                            };
                                            weight: string;
                                        }[];
                                    };
                                };
                                pool_assets: {
                                    token: {
                                        denom: string;
                                        amount: string;
                                    };
                                    weight: string;
                                }[];
                                future_pool_governor: string;
                            };
                            fromAmino: ({ sender, pool_params, pool_assets, future_pool_governor }: {
                                sender: string;
                                pool_params: {
                                    swap_fee: string;
                                    exit_fee: string;
                                    smooth_weight_change_params: {
                                        start_time: {
                                            seconds: string;
                                            nanos: number;
                                        };
                                        duration: {
                                            seconds: string;
                                            nanos: number;
                                        };
                                        initial_pool_weights: {
                                            token: {
                                                denom: string;
                                                amount: string;
                                            };
                                            weight: string;
                                        }[];
                                        target_pool_weights: {
                                            token: {
                                                denom: string;
                                                amount: string;
                                            };
                                            weight: string;
                                        }[];
                                    };
                                };
                                pool_assets: {
                                    token: {
                                        denom: string;
                                        amount: string;
                                    };
                                    weight: string;
                                }[];
                                future_pool_governor: string;
                            }) => _141.MsgCreateBalancerPool;
                        };
                    };
                    MsgCreateBalancerPool: {
                        encode(message: _141.MsgCreateBalancerPool, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _141.MsgCreateBalancerPool;
                        fromJSON(object: any): _141.MsgCreateBalancerPool;
                        toJSON(message: _141.MsgCreateBalancerPool): unknown;
                        fromPartial(object: {
                            sender?: string;
                            poolParams?: {
                                swapFee?: string;
                                exitFee?: string;
                                smoothWeightChangeParams?: {
                                    startTime?: Date;
                                    duration?: {
                                        seconds?: any;
                                        nanos?: number;
                                    };
                                    initialPoolWeights?: {
                                        token?: {
                                            denom?: string;
                                            amount?: string;
                                        };
                                        weight?: string;
                                    }[];
                                    targetPoolWeights?: {
                                        token?: {
                                            denom?: string;
                                            amount?: string;
                                        };
                                        weight?: string;
                                    }[];
                                };
                            };
                            poolAssets?: {
                                token?: {
                                    denom?: string;
                                    amount?: string;
                                };
                                weight?: string;
                            }[];
                            futurePoolGovernor?: string;
                        }): _141.MsgCreateBalancerPool;
                    };
                    MsgCreateBalancerPoolResponse: {
                        encode(message: _141.MsgCreateBalancerPoolResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _141.MsgCreateBalancerPoolResponse;
                        fromJSON(object: any): _141.MsgCreateBalancerPoolResponse;
                        toJSON(message: _141.MsgCreateBalancerPoolResponse): unknown;
                        fromPartial(object: {
                            poolId?: any;
                        }): _141.MsgCreateBalancerPoolResponse;
                    };
                };
            }
            namespace stableswap {
                const v1beta1: {
                    registry: readonly [string, import("@cosmjs/proto-signing").GeneratedType][];
                    load: (protoRegistry: import("@cosmjs/proto-signing").Registry) => void;
                    MessageComposer: {
                        encoded: {
                            createStableswapPool(value: _143.MsgCreateStableswapPool): {
                                typeUrl: string;
                                value: Uint8Array;
                            };
                            stableSwapAdjustScalingFactors(value: _143.MsgStableSwapAdjustScalingFactors): {
                                typeUrl: string;
                                value: Uint8Array;
                            };
                        };
                        withTypeUrl: {
                            createStableswapPool(value: _143.MsgCreateStableswapPool): {
                                typeUrl: string;
                                value: _143.MsgCreateStableswapPool;
                            };
                            stableSwapAdjustScalingFactors(value: _143.MsgStableSwapAdjustScalingFactors): {
                                typeUrl: string;
                                value: _143.MsgStableSwapAdjustScalingFactors;
                            };
                        };
                        toJSON: {
                            createStableswapPool(value: _143.MsgCreateStableswapPool): {
                                typeUrl: string;
                                value: unknown;
                            };
                            stableSwapAdjustScalingFactors(value: _143.MsgStableSwapAdjustScalingFactors): {
                                typeUrl: string;
                                value: unknown;
                            };
                        };
                        fromJSON: {
                            createStableswapPool(value: any): {
                                typeUrl: string;
                                value: _143.MsgCreateStableswapPool;
                            };
                            stableSwapAdjustScalingFactors(value: any): {
                                typeUrl: string;
                                value: _143.MsgStableSwapAdjustScalingFactors;
                            };
                        };
                        fromPartial: {
                            createStableswapPool(value: _143.MsgCreateStableswapPool): {
                                typeUrl: string;
                                value: _143.MsgCreateStableswapPool;
                            };
                            stableSwapAdjustScalingFactors(value: _143.MsgStableSwapAdjustScalingFactors): {
                                typeUrl: string;
                                value: _143.MsgStableSwapAdjustScalingFactors;
                            };
                        };
                    };
                    AminoConverter: {
                        "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool": {
                            aminoType: string;
                            toAmino: ({ sender, poolParams, initialPoolLiquidity, scalingFactors, futurePoolGovernor }: _143.MsgCreateStableswapPool) => {
                                sender: string;
                                pool_params: {
                                    swap_fee: string;
                                    exit_fee: string;
                                };
                                initial_pool_liquidity: {
                                    denom: string;
                                    amount: string;
                                }[];
                                scaling_factors: Long[];
                                future_pool_governor: string;
                            };
                            fromAmino: ({ sender, pool_params, initial_pool_liquidity, scaling_factors, future_pool_governor }: {
                                sender: string;
                                pool_params: {
                                    swap_fee: string;
                                    exit_fee: string;
                                };
                                initial_pool_liquidity: {
                                    denom: string;
                                    amount: string;
                                }[];
                                scaling_factors: Long[];
                                future_pool_governor: string;
                            }) => _143.MsgCreateStableswapPool;
                        };
                        "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors": {
                            aminoType: string;
                            toAmino: ({ sender, poolId, scalingFactors }: _143.MsgStableSwapAdjustScalingFactors) => {
                                sender: string;
                                pool_id: string;
                                scaling_factors: Long[];
                            };
                            fromAmino: ({ sender, pool_id, scaling_factors }: {
                                sender: string;
                                pool_id: string;
                                scaling_factors: Long[];
                            }) => _143.MsgStableSwapAdjustScalingFactors;
                        };
                    };
                    MsgCreateStableswapPool: {
                        encode(message: _143.MsgCreateStableswapPool, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _143.MsgCreateStableswapPool;
                        fromJSON(object: any): _143.MsgCreateStableswapPool;
                        toJSON(message: _143.MsgCreateStableswapPool): unknown;
                        fromPartial(object: {
                            sender?: string;
                            poolParams?: {
                                swapFee?: string;
                                exitFee?: string;
                            };
                            initialPoolLiquidity?: {
                                denom?: string;
                                amount?: string;
                            }[];
                            scalingFactors?: any[];
                            futurePoolGovernor?: string;
                        }): _143.MsgCreateStableswapPool;
                    };
                    MsgCreateStableswapPoolResponse: {
                        encode(message: _143.MsgCreateStableswapPoolResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _143.MsgCreateStableswapPoolResponse;
                        fromJSON(object: any): _143.MsgCreateStableswapPoolResponse;
                        toJSON(message: _143.MsgCreateStableswapPoolResponse): unknown;
                        fromPartial(object: {
                            poolId?: any;
                        }): _143.MsgCreateStableswapPoolResponse;
                    };
                    MsgStableSwapAdjustScalingFactors: {
                        encode(message: _143.MsgStableSwapAdjustScalingFactors, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _143.MsgStableSwapAdjustScalingFactors;
                        fromJSON(object: any): _143.MsgStableSwapAdjustScalingFactors;
                        toJSON(message: _143.MsgStableSwapAdjustScalingFactors): unknown;
                        fromPartial(object: {
                            sender?: string;
                            poolId?: any;
                            scalingFactors?: any[];
                        }): _143.MsgStableSwapAdjustScalingFactors;
                    };
                    MsgStableSwapAdjustScalingFactorsResponse: {
                        encode(_: _143.MsgStableSwapAdjustScalingFactorsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _143.MsgStableSwapAdjustScalingFactorsResponse;
                        fromJSON(_: any): _143.MsgStableSwapAdjustScalingFactorsResponse;
                        toJSON(_: _143.MsgStableSwapAdjustScalingFactorsResponse): unknown;
                        fromPartial(_: {}): _143.MsgStableSwapAdjustScalingFactorsResponse;
                    };
                    PoolParams: {
                        encode(message: _142.PoolParams, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _142.PoolParams;
                        fromJSON(object: any): _142.PoolParams;
                        toJSON(message: _142.PoolParams): unknown;
                        fromPartial(object: {
                            swapFee?: string;
                            exitFee?: string;
                        }): _142.PoolParams;
                    };
                    Pool: {
                        encode(message: _142.Pool, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                        decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _142.Pool;
                        fromJSON(object: any): _142.Pool;
                        toJSON(message: _142.Pool): unknown;
                        fromPartial(object: {
                            address?: string;
                            id?: any;
                            poolParams?: {
                                swapFee?: string;
                                exitFee?: string;
                            };
                            futurePoolGovernor?: string;
                            totalShares?: {
                                denom?: string;
                                amount?: string;
                            };
                            poolLiquidity?: {
                                denom?: string;
                                amount?: string;
                            }[];
                            scalingFactor?: any[];
                            scalingFactorGovernor?: string;
                        }): _142.Pool;
                    };
                };
            }
        }
    }
    const incentives: {
        registry: readonly [string, import("@cosmjs/proto-signing").GeneratedType][];
        load: (protoRegistry: import("@cosmjs/proto-signing").Registry) => void;
        MessageComposer: {
            encoded: {
                createGauge(value: _148.MsgCreateGauge): {
                    typeUrl: string;
                    value: Uint8Array;
                };
                addToGauge(value: _148.MsgAddToGauge): {
                    typeUrl: string;
                    value: Uint8Array;
                };
            };
            withTypeUrl: {
                createGauge(value: _148.MsgCreateGauge): {
                    typeUrl: string;
                    value: _148.MsgCreateGauge;
                };
                addToGauge(value: _148.MsgAddToGauge): {
                    typeUrl: string;
                    value: _148.MsgAddToGauge;
                };
            };
            toJSON: {
                createGauge(value: _148.MsgCreateGauge): {
                    typeUrl: string;
                    value: unknown;
                };
                addToGauge(value: _148.MsgAddToGauge): {
                    typeUrl: string;
                    value: unknown;
                };
            };
            fromJSON: {
                createGauge(value: any): {
                    typeUrl: string;
                    value: _148.MsgCreateGauge;
                };
                addToGauge(value: any): {
                    typeUrl: string;
                    value: _148.MsgAddToGauge;
                };
            };
            fromPartial: {
                createGauge(value: _148.MsgCreateGauge): {
                    typeUrl: string;
                    value: _148.MsgCreateGauge;
                };
                addToGauge(value: _148.MsgAddToGauge): {
                    typeUrl: string;
                    value: _148.MsgAddToGauge;
                };
            };
        };
        AminoConverter: {
            "/osmosis.incentives.MsgCreateGauge": {
                aminoType: string;
                toAmino: ({ isPerpetual, owner, distributeTo, coins, startTime, numEpochsPaidOver }: _148.MsgCreateGauge) => {
                    is_perpetual: boolean;
                    owner: string;
                    distribute_to: {
                        lock_query_type: number;
                        denom: string;
                        duration: {
                            seconds: string;
                            nanos: number;
                        };
                        timestamp: {
                            seconds: string;
                            nanos: number;
                        };
                    };
                    coins: {
                        denom: string;
                        amount: string;
                    }[];
                    start_time: {
                        seconds: string;
                        nanos: number;
                    };
                    num_epochs_paid_over: string;
                };
                fromAmino: ({ is_perpetual, owner, distribute_to, coins, start_time, num_epochs_paid_over }: {
                    is_perpetual: boolean;
                    owner: string;
                    distribute_to: {
                        lock_query_type: number;
                        denom: string;
                        duration: {
                            seconds: string;
                            nanos: number;
                        };
                        timestamp: {
                            seconds: string;
                            nanos: number;
                        };
                    };
                    coins: {
                        denom: string;
                        amount: string;
                    }[];
                    start_time: {
                        seconds: string;
                        nanos: number;
                    };
                    num_epochs_paid_over: string;
                }) => _148.MsgCreateGauge;
            };
            "/osmosis.incentives.MsgAddToGauge": {
                aminoType: string;
                toAmino: ({ owner, gaugeId, rewards }: _148.MsgAddToGauge) => {
                    owner: string;
                    gauge_id: string;
                    rewards: {
                        denom: string;
                        amount: string;
                    }[];
                };
                fromAmino: ({ owner, gauge_id, rewards }: {
                    owner: string;
                    gauge_id: string;
                    rewards: {
                        denom: string;
                        amount: string;
                    }[];
                }) => _148.MsgAddToGauge;
            };
        };
        MsgCreateGauge: {
            encode(message: _148.MsgCreateGauge, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _148.MsgCreateGauge;
            fromJSON(object: any): _148.MsgCreateGauge;
            toJSON(message: _148.MsgCreateGauge): unknown;
            fromPartial(object: {
                isPerpetual?: boolean;
                owner?: string;
                distributeTo?: {
                    lockQueryType?: _150.LockQueryType;
                    denom?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    timestamp?: Date;
                };
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
                startTime?: Date;
                numEpochsPaidOver?: any;
            }): _148.MsgCreateGauge;
        };
        MsgCreateGaugeResponse: {
            encode(_: _148.MsgCreateGaugeResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _148.MsgCreateGaugeResponse;
            fromJSON(_: any): _148.MsgCreateGaugeResponse;
            toJSON(_: _148.MsgCreateGaugeResponse): unknown;
            fromPartial(_: {}): _148.MsgCreateGaugeResponse;
        };
        MsgAddToGauge: {
            encode(message: _148.MsgAddToGauge, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _148.MsgAddToGauge;
            fromJSON(object: any): _148.MsgAddToGauge;
            toJSON(message: _148.MsgAddToGauge): unknown;
            fromPartial(object: {
                owner?: string;
                gaugeId?: any;
                rewards?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _148.MsgAddToGauge;
        };
        MsgAddToGaugeResponse: {
            encode(_: _148.MsgAddToGaugeResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _148.MsgAddToGaugeResponse;
            fromJSON(_: any): _148.MsgAddToGaugeResponse;
            toJSON(_: _148.MsgAddToGaugeResponse): unknown;
            fromPartial(_: {}): _148.MsgAddToGaugeResponse;
        };
        ModuleToDistributeCoinsRequest: {
            encode(_: _147.ModuleToDistributeCoinsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.ModuleToDistributeCoinsRequest;
            fromJSON(_: any): _147.ModuleToDistributeCoinsRequest;
            toJSON(_: _147.ModuleToDistributeCoinsRequest): unknown;
            fromPartial(_: {}): _147.ModuleToDistributeCoinsRequest;
        };
        ModuleToDistributeCoinsResponse: {
            encode(message: _147.ModuleToDistributeCoinsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.ModuleToDistributeCoinsResponse;
            fromJSON(object: any): _147.ModuleToDistributeCoinsResponse;
            toJSON(message: _147.ModuleToDistributeCoinsResponse): unknown;
            fromPartial(object: {
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _147.ModuleToDistributeCoinsResponse;
        };
        ModuleDistributedCoinsRequest: {
            encode(_: _147.ModuleDistributedCoinsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.ModuleDistributedCoinsRequest;
            fromJSON(_: any): _147.ModuleDistributedCoinsRequest;
            toJSON(_: _147.ModuleDistributedCoinsRequest): unknown;
            fromPartial(_: {}): _147.ModuleDistributedCoinsRequest;
        };
        ModuleDistributedCoinsResponse: {
            encode(message: _147.ModuleDistributedCoinsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.ModuleDistributedCoinsResponse;
            fromJSON(object: any): _147.ModuleDistributedCoinsResponse;
            toJSON(message: _147.ModuleDistributedCoinsResponse): unknown;
            fromPartial(object: {
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _147.ModuleDistributedCoinsResponse;
        };
        GaugeByIDRequest: {
            encode(message: _147.GaugeByIDRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.GaugeByIDRequest;
            fromJSON(object: any): _147.GaugeByIDRequest;
            toJSON(message: _147.GaugeByIDRequest): unknown;
            fromPartial(object: {
                id?: any;
            }): _147.GaugeByIDRequest;
        };
        GaugeByIDResponse: {
            encode(message: _147.GaugeByIDResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.GaugeByIDResponse;
            fromJSON(object: any): _147.GaugeByIDResponse;
            toJSON(message: _147.GaugeByIDResponse): unknown;
            fromPartial(object: {
                gauge?: {
                    id?: any;
                    isPerpetual?: boolean;
                    distributeTo?: {
                        lockQueryType?: _150.LockQueryType;
                        denom?: string;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        timestamp?: Date;
                    };
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    startTime?: Date;
                    numEpochsPaidOver?: any;
                    filledEpochs?: any;
                    distributedCoins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                };
            }): _147.GaugeByIDResponse;
        };
        GaugesRequest: {
            encode(message: _147.GaugesRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.GaugesRequest;
            fromJSON(object: any): _147.GaugesRequest;
            toJSON(message: _147.GaugesRequest): unknown;
            fromPartial(object: {
                pagination?: {
                    key?: Uint8Array;
                    offset?: any;
                    limit?: any;
                    countTotal?: boolean;
                    reverse?: boolean;
                };
            }): _147.GaugesRequest;
        };
        GaugesResponse: {
            encode(message: _147.GaugesResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.GaugesResponse;
            fromJSON(object: any): _147.GaugesResponse;
            toJSON(message: _147.GaugesResponse): unknown;
            fromPartial(object: {
                data?: {
                    id?: any;
                    isPerpetual?: boolean;
                    distributeTo?: {
                        lockQueryType?: _150.LockQueryType;
                        denom?: string;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        timestamp?: Date;
                    };
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    startTime?: Date;
                    numEpochsPaidOver?: any;
                    filledEpochs?: any;
                    distributedCoins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
                pagination?: {
                    nextKey?: Uint8Array;
                    total?: any;
                };
            }): _147.GaugesResponse;
        };
        ActiveGaugesRequest: {
            encode(message: _147.ActiveGaugesRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.ActiveGaugesRequest;
            fromJSON(object: any): _147.ActiveGaugesRequest;
            toJSON(message: _147.ActiveGaugesRequest): unknown;
            fromPartial(object: {
                pagination?: {
                    key?: Uint8Array;
                    offset?: any;
                    limit?: any;
                    countTotal?: boolean;
                    reverse?: boolean;
                };
            }): _147.ActiveGaugesRequest;
        };
        ActiveGaugesResponse: {
            encode(message: _147.ActiveGaugesResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.ActiveGaugesResponse;
            fromJSON(object: any): _147.ActiveGaugesResponse;
            toJSON(message: _147.ActiveGaugesResponse): unknown;
            fromPartial(object: {
                data?: {
                    id?: any;
                    isPerpetual?: boolean;
                    distributeTo?: {
                        lockQueryType?: _150.LockQueryType;
                        denom?: string;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        timestamp?: Date;
                    };
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    startTime?: Date;
                    numEpochsPaidOver?: any;
                    filledEpochs?: any;
                    distributedCoins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
                pagination?: {
                    nextKey?: Uint8Array;
                    total?: any;
                };
            }): _147.ActiveGaugesResponse;
        };
        ActiveGaugesPerDenomRequest: {
            encode(message: _147.ActiveGaugesPerDenomRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.ActiveGaugesPerDenomRequest;
            fromJSON(object: any): _147.ActiveGaugesPerDenomRequest;
            toJSON(message: _147.ActiveGaugesPerDenomRequest): unknown;
            fromPartial(object: {
                denom?: string;
                pagination?: {
                    key?: Uint8Array;
                    offset?: any;
                    limit?: any;
                    countTotal?: boolean;
                    reverse?: boolean;
                };
            }): _147.ActiveGaugesPerDenomRequest;
        };
        ActiveGaugesPerDenomResponse: {
            encode(message: _147.ActiveGaugesPerDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.ActiveGaugesPerDenomResponse;
            fromJSON(object: any): _147.ActiveGaugesPerDenomResponse;
            toJSON(message: _147.ActiveGaugesPerDenomResponse): unknown;
            fromPartial(object: {
                data?: {
                    id?: any;
                    isPerpetual?: boolean;
                    distributeTo?: {
                        lockQueryType?: _150.LockQueryType;
                        denom?: string;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        timestamp?: Date;
                    };
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    startTime?: Date;
                    numEpochsPaidOver?: any;
                    filledEpochs?: any;
                    distributedCoins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
                pagination?: {
                    nextKey?: Uint8Array;
                    total?: any;
                };
            }): _147.ActiveGaugesPerDenomResponse;
        };
        UpcomingGaugesRequest: {
            encode(message: _147.UpcomingGaugesRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.UpcomingGaugesRequest;
            fromJSON(object: any): _147.UpcomingGaugesRequest;
            toJSON(message: _147.UpcomingGaugesRequest): unknown;
            fromPartial(object: {
                pagination?: {
                    key?: Uint8Array;
                    offset?: any;
                    limit?: any;
                    countTotal?: boolean;
                    reverse?: boolean;
                };
            }): _147.UpcomingGaugesRequest;
        };
        UpcomingGaugesResponse: {
            encode(message: _147.UpcomingGaugesResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.UpcomingGaugesResponse;
            fromJSON(object: any): _147.UpcomingGaugesResponse;
            toJSON(message: _147.UpcomingGaugesResponse): unknown;
            fromPartial(object: {
                data?: {
                    id?: any;
                    isPerpetual?: boolean;
                    distributeTo?: {
                        lockQueryType?: _150.LockQueryType;
                        denom?: string;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        timestamp?: Date;
                    };
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    startTime?: Date;
                    numEpochsPaidOver?: any;
                    filledEpochs?: any;
                    distributedCoins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
                pagination?: {
                    nextKey?: Uint8Array;
                    total?: any;
                };
            }): _147.UpcomingGaugesResponse;
        };
        UpcomingGaugesPerDenomRequest: {
            encode(message: _147.UpcomingGaugesPerDenomRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.UpcomingGaugesPerDenomRequest;
            fromJSON(object: any): _147.UpcomingGaugesPerDenomRequest;
            toJSON(message: _147.UpcomingGaugesPerDenomRequest): unknown;
            fromPartial(object: {
                denom?: string;
                pagination?: {
                    key?: Uint8Array;
                    offset?: any;
                    limit?: any;
                    countTotal?: boolean;
                    reverse?: boolean;
                };
            }): _147.UpcomingGaugesPerDenomRequest;
        };
        UpcomingGaugesPerDenomResponse: {
            encode(message: _147.UpcomingGaugesPerDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.UpcomingGaugesPerDenomResponse;
            fromJSON(object: any): _147.UpcomingGaugesPerDenomResponse;
            toJSON(message: _147.UpcomingGaugesPerDenomResponse): unknown;
            fromPartial(object: {
                upcomingGauges?: {
                    id?: any;
                    isPerpetual?: boolean;
                    distributeTo?: {
                        lockQueryType?: _150.LockQueryType;
                        denom?: string;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        timestamp?: Date;
                    };
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    startTime?: Date;
                    numEpochsPaidOver?: any;
                    filledEpochs?: any;
                    distributedCoins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
                pagination?: {
                    nextKey?: Uint8Array;
                    total?: any;
                };
            }): _147.UpcomingGaugesPerDenomResponse;
        };
        RewardsEstRequest: {
            encode(message: _147.RewardsEstRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.RewardsEstRequest;
            fromJSON(object: any): _147.RewardsEstRequest;
            toJSON(message: _147.RewardsEstRequest): unknown;
            fromPartial(object: {
                owner?: string;
                lockIds?: any[];
                endEpoch?: any;
            }): _147.RewardsEstRequest;
        };
        RewardsEstResponse: {
            encode(message: _147.RewardsEstResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.RewardsEstResponse;
            fromJSON(object: any): _147.RewardsEstResponse;
            toJSON(message: _147.RewardsEstResponse): unknown;
            fromPartial(object: {
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _147.RewardsEstResponse;
        };
        QueryLockableDurationsRequest: {
            encode(_: _147.QueryLockableDurationsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.QueryLockableDurationsRequest;
            fromJSON(_: any): _147.QueryLockableDurationsRequest;
            toJSON(_: _147.QueryLockableDurationsRequest): unknown;
            fromPartial(_: {}): _147.QueryLockableDurationsRequest;
        };
        QueryLockableDurationsResponse: {
            encode(message: _147.QueryLockableDurationsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _147.QueryLockableDurationsResponse;
            fromJSON(object: any): _147.QueryLockableDurationsResponse;
            toJSON(message: _147.QueryLockableDurationsResponse): unknown;
            fromPartial(object: {
                lockableDurations?: {
                    seconds?: any;
                    nanos?: number;
                }[];
            }): _147.QueryLockableDurationsResponse;
        };
        Params: {
            encode(message: _146.Params, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _146.Params;
            fromJSON(object: any): _146.Params;
            toJSON(message: _146.Params): unknown;
            fromPartial(object: {
                distrEpochIdentifier?: string;
            }): _146.Params;
        };
        GenesisState: {
            encode(message: _145.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _145.GenesisState;
            fromJSON(object: any): _145.GenesisState;
            toJSON(message: _145.GenesisState): unknown;
            fromPartial(object: {
                params?: {
                    distrEpochIdentifier?: string;
                };
                gauges?: {
                    id?: any;
                    isPerpetual?: boolean;
                    distributeTo?: {
                        lockQueryType?: _150.LockQueryType;
                        denom?: string;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        timestamp?: Date;
                    };
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    startTime?: Date;
                    numEpochsPaidOver?: any;
                    filledEpochs?: any;
                    distributedCoins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
                lockableDurations?: {
                    seconds?: any;
                    nanos?: number;
                }[];
                lastGaugeId?: any;
            }): _145.GenesisState;
        };
        Gauge: {
            encode(message: _144.Gauge, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _144.Gauge;
            fromJSON(object: any): _144.Gauge;
            toJSON(message: _144.Gauge): unknown;
            fromPartial(object: {
                id?: any;
                isPerpetual?: boolean;
                distributeTo?: {
                    lockQueryType?: _150.LockQueryType;
                    denom?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    timestamp?: Date;
                };
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
                startTime?: Date;
                numEpochsPaidOver?: any;
                filledEpochs?: any;
                distributedCoins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _144.Gauge;
        };
        LockableDurationsInfo: {
            encode(message: _144.LockableDurationsInfo, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _144.LockableDurationsInfo;
            fromJSON(object: any): _144.LockableDurationsInfo;
            toJSON(message: _144.LockableDurationsInfo): unknown;
            fromPartial(object: {
                lockableDurations?: {
                    seconds?: any;
                    nanos?: number;
                }[];
            }): _144.LockableDurationsInfo;
        };
    };
    const lockup: {
        registry: readonly [string, import("@cosmjs/proto-signing").GeneratedType][];
        load: (protoRegistry: import("@cosmjs/proto-signing").Registry) => void;
        MessageComposer: {
            encoded: {
                lockTokens(value: _152.MsgLockTokens): {
                    typeUrl: string;
                    value: Uint8Array;
                };
                beginUnlockingAll(value: _152.MsgBeginUnlockingAll): {
                    typeUrl: string;
                    value: Uint8Array;
                };
                beginUnlocking(value: _152.MsgBeginUnlocking): {
                    typeUrl: string;
                    value: Uint8Array;
                };
                extendLockup(value: _152.MsgExtendLockup): {
                    typeUrl: string;
                    value: Uint8Array;
                };
            };
            withTypeUrl: {
                lockTokens(value: _152.MsgLockTokens): {
                    typeUrl: string;
                    value: _152.MsgLockTokens;
                };
                beginUnlockingAll(value: _152.MsgBeginUnlockingAll): {
                    typeUrl: string;
                    value: _152.MsgBeginUnlockingAll;
                };
                beginUnlocking(value: _152.MsgBeginUnlocking): {
                    typeUrl: string;
                    value: _152.MsgBeginUnlocking;
                };
                extendLockup(value: _152.MsgExtendLockup): {
                    typeUrl: string;
                    value: _152.MsgExtendLockup;
                };
            };
            toJSON: {
                lockTokens(value: _152.MsgLockTokens): {
                    typeUrl: string;
                    value: unknown;
                };
                beginUnlockingAll(value: _152.MsgBeginUnlockingAll): {
                    typeUrl: string;
                    value: unknown;
                };
                beginUnlocking(value: _152.MsgBeginUnlocking): {
                    typeUrl: string;
                    value: unknown;
                };
                extendLockup(value: _152.MsgExtendLockup): {
                    typeUrl: string;
                    value: unknown;
                };
            };
            fromJSON: {
                lockTokens(value: any): {
                    typeUrl: string;
                    value: _152.MsgLockTokens;
                };
                beginUnlockingAll(value: any): {
                    typeUrl: string;
                    value: _152.MsgBeginUnlockingAll;
                };
                beginUnlocking(value: any): {
                    typeUrl: string;
                    value: _152.MsgBeginUnlocking;
                };
                extendLockup(value: any): {
                    typeUrl: string;
                    value: _152.MsgExtendLockup;
                };
            };
            fromPartial: {
                lockTokens(value: _152.MsgLockTokens): {
                    typeUrl: string;
                    value: _152.MsgLockTokens;
                };
                beginUnlockingAll(value: _152.MsgBeginUnlockingAll): {
                    typeUrl: string;
                    value: _152.MsgBeginUnlockingAll;
                };
                beginUnlocking(value: _152.MsgBeginUnlocking): {
                    typeUrl: string;
                    value: _152.MsgBeginUnlocking;
                };
                extendLockup(value: _152.MsgExtendLockup): {
                    typeUrl: string;
                    value: _152.MsgExtendLockup;
                };
            };
        };
        AminoConverter: {
            "/osmosis.lockup.MsgLockTokens": {
                aminoType: string;
                toAmino: ({ owner, duration, coins }: _152.MsgLockTokens) => {
                    owner: string;
                    duration: {
                        seconds: string;
                        nanos: number;
                    };
                    coins: {
                        denom: string;
                        amount: string;
                    }[];
                };
                fromAmino: ({ owner, duration, coins }: {
                    owner: string;
                    duration: {
                        seconds: string;
                        nanos: number;
                    };
                    coins: {
                        denom: string;
                        amount: string;
                    }[];
                }) => _152.MsgLockTokens;
            };
            "/osmosis.lockup.MsgBeginUnlockingAll": {
                aminoType: string;
                toAmino: ({ owner }: _152.MsgBeginUnlockingAll) => {
                    owner: string;
                };
                fromAmino: ({ owner }: {
                    owner: string;
                }) => _152.MsgBeginUnlockingAll;
            };
            "/osmosis.lockup.MsgBeginUnlocking": {
                aminoType: string;
                toAmino: ({ owner, ID, coins }: _152.MsgBeginUnlocking) => {
                    owner: string;
                    ID: string;
                    coins: {
                        denom: string;
                        amount: string;
                    }[];
                };
                fromAmino: ({ owner, ID, coins }: {
                    owner: string;
                    ID: string;
                    coins: {
                        denom: string;
                        amount: string;
                    }[];
                }) => _152.MsgBeginUnlocking;
            };
            "/osmosis.lockup.MsgExtendLockup": {
                aminoType: string;
                toAmino: ({ owner, ID, duration }: _152.MsgExtendLockup) => {
                    owner: string;
                    ID: string;
                    duration: {
                        seconds: string;
                        nanos: number;
                    };
                };
                fromAmino: ({ owner, ID, duration }: {
                    owner: string;
                    ID: string;
                    duration: {
                        seconds: string;
                        nanos: number;
                    };
                }) => _152.MsgExtendLockup;
            };
        };
        MsgLockTokens: {
            encode(message: _152.MsgLockTokens, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _152.MsgLockTokens;
            fromJSON(object: any): _152.MsgLockTokens;
            toJSON(message: _152.MsgLockTokens): unknown;
            fromPartial(object: {
                owner?: string;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _152.MsgLockTokens;
        };
        MsgLockTokensResponse: {
            encode(message: _152.MsgLockTokensResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _152.MsgLockTokensResponse;
            fromJSON(object: any): _152.MsgLockTokensResponse;
            toJSON(message: _152.MsgLockTokensResponse): unknown;
            fromPartial(object: {
                ID?: any;
            }): _152.MsgLockTokensResponse;
        };
        MsgBeginUnlockingAll: {
            encode(message: _152.MsgBeginUnlockingAll, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _152.MsgBeginUnlockingAll;
            fromJSON(object: any): _152.MsgBeginUnlockingAll;
            toJSON(message: _152.MsgBeginUnlockingAll): unknown;
            fromPartial(object: {
                owner?: string;
            }): _152.MsgBeginUnlockingAll;
        };
        MsgBeginUnlockingAllResponse: {
            encode(message: _152.MsgBeginUnlockingAllResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _152.MsgBeginUnlockingAllResponse;
            fromJSON(object: any): _152.MsgBeginUnlockingAllResponse;
            toJSON(message: _152.MsgBeginUnlockingAllResponse): unknown;
            fromPartial(object: {
                unlocks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _152.MsgBeginUnlockingAllResponse;
        };
        MsgBeginUnlocking: {
            encode(message: _152.MsgBeginUnlocking, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _152.MsgBeginUnlocking;
            fromJSON(object: any): _152.MsgBeginUnlocking;
            toJSON(message: _152.MsgBeginUnlocking): unknown;
            fromPartial(object: {
                owner?: string;
                ID?: any;
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _152.MsgBeginUnlocking;
        };
        MsgBeginUnlockingResponse: {
            encode(message: _152.MsgBeginUnlockingResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _152.MsgBeginUnlockingResponse;
            fromJSON(object: any): _152.MsgBeginUnlockingResponse;
            toJSON(message: _152.MsgBeginUnlockingResponse): unknown;
            fromPartial(object: {
                success?: boolean;
            }): _152.MsgBeginUnlockingResponse;
        };
        MsgExtendLockup: {
            encode(message: _152.MsgExtendLockup, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _152.MsgExtendLockup;
            fromJSON(object: any): _152.MsgExtendLockup;
            toJSON(message: _152.MsgExtendLockup): unknown;
            fromPartial(object: {
                owner?: string;
                ID?: any;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
            }): _152.MsgExtendLockup;
        };
        MsgExtendLockupResponse: {
            encode(message: _152.MsgExtendLockupResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _152.MsgExtendLockupResponse;
            fromJSON(object: any): _152.MsgExtendLockupResponse;
            toJSON(message: _152.MsgExtendLockupResponse): unknown;
            fromPartial(object: {
                success?: boolean;
            }): _152.MsgExtendLockupResponse;
        };
        ModuleBalanceRequest: {
            encode(_: _151.ModuleBalanceRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.ModuleBalanceRequest;
            fromJSON(_: any): _151.ModuleBalanceRequest;
            toJSON(_: _151.ModuleBalanceRequest): unknown;
            fromPartial(_: {}): _151.ModuleBalanceRequest;
        };
        ModuleBalanceResponse: {
            encode(message: _151.ModuleBalanceResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.ModuleBalanceResponse;
            fromJSON(object: any): _151.ModuleBalanceResponse;
            toJSON(message: _151.ModuleBalanceResponse): unknown;
            fromPartial(object: {
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _151.ModuleBalanceResponse;
        };
        ModuleLockedAmountRequest: {
            encode(_: _151.ModuleLockedAmountRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.ModuleLockedAmountRequest;
            fromJSON(_: any): _151.ModuleLockedAmountRequest;
            toJSON(_: _151.ModuleLockedAmountRequest): unknown;
            fromPartial(_: {}): _151.ModuleLockedAmountRequest;
        };
        ModuleLockedAmountResponse: {
            encode(message: _151.ModuleLockedAmountResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.ModuleLockedAmountResponse;
            fromJSON(object: any): _151.ModuleLockedAmountResponse;
            toJSON(message: _151.ModuleLockedAmountResponse): unknown;
            fromPartial(object: {
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _151.ModuleLockedAmountResponse;
        };
        AccountUnlockableCoinsRequest: {
            encode(message: _151.AccountUnlockableCoinsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountUnlockableCoinsRequest;
            fromJSON(object: any): _151.AccountUnlockableCoinsRequest;
            toJSON(message: _151.AccountUnlockableCoinsRequest): unknown;
            fromPartial(object: {
                owner?: string;
            }): _151.AccountUnlockableCoinsRequest;
        };
        AccountUnlockableCoinsResponse: {
            encode(message: _151.AccountUnlockableCoinsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountUnlockableCoinsResponse;
            fromJSON(object: any): _151.AccountUnlockableCoinsResponse;
            toJSON(message: _151.AccountUnlockableCoinsResponse): unknown;
            fromPartial(object: {
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _151.AccountUnlockableCoinsResponse;
        };
        AccountUnlockingCoinsRequest: {
            encode(message: _151.AccountUnlockingCoinsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountUnlockingCoinsRequest;
            fromJSON(object: any): _151.AccountUnlockingCoinsRequest;
            toJSON(message: _151.AccountUnlockingCoinsRequest): unknown;
            fromPartial(object: {
                owner?: string;
            }): _151.AccountUnlockingCoinsRequest;
        };
        AccountUnlockingCoinsResponse: {
            encode(message: _151.AccountUnlockingCoinsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountUnlockingCoinsResponse;
            fromJSON(object: any): _151.AccountUnlockingCoinsResponse;
            toJSON(message: _151.AccountUnlockingCoinsResponse): unknown;
            fromPartial(object: {
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _151.AccountUnlockingCoinsResponse;
        };
        AccountLockedCoinsRequest: {
            encode(message: _151.AccountLockedCoinsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedCoinsRequest;
            fromJSON(object: any): _151.AccountLockedCoinsRequest;
            toJSON(message: _151.AccountLockedCoinsRequest): unknown;
            fromPartial(object: {
                owner?: string;
            }): _151.AccountLockedCoinsRequest;
        };
        AccountLockedCoinsResponse: {
            encode(message: _151.AccountLockedCoinsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedCoinsResponse;
            fromJSON(object: any): _151.AccountLockedCoinsResponse;
            toJSON(message: _151.AccountLockedCoinsResponse): unknown;
            fromPartial(object: {
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _151.AccountLockedCoinsResponse;
        };
        AccountLockedPastTimeRequest: {
            encode(message: _151.AccountLockedPastTimeRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedPastTimeRequest;
            fromJSON(object: any): _151.AccountLockedPastTimeRequest;
            toJSON(message: _151.AccountLockedPastTimeRequest): unknown;
            fromPartial(object: {
                owner?: string;
                timestamp?: Date;
            }): _151.AccountLockedPastTimeRequest;
        };
        AccountLockedPastTimeResponse: {
            encode(message: _151.AccountLockedPastTimeResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedPastTimeResponse;
            fromJSON(object: any): _151.AccountLockedPastTimeResponse;
            toJSON(message: _151.AccountLockedPastTimeResponse): unknown;
            fromPartial(object: {
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _151.AccountLockedPastTimeResponse;
        };
        AccountLockedPastTimeNotUnlockingOnlyRequest: {
            encode(message: _151.AccountLockedPastTimeNotUnlockingOnlyRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedPastTimeNotUnlockingOnlyRequest;
            fromJSON(object: any): _151.AccountLockedPastTimeNotUnlockingOnlyRequest;
            toJSON(message: _151.AccountLockedPastTimeNotUnlockingOnlyRequest): unknown;
            fromPartial(object: {
                owner?: string;
                timestamp?: Date;
            }): _151.AccountLockedPastTimeNotUnlockingOnlyRequest;
        };
        AccountLockedPastTimeNotUnlockingOnlyResponse: {
            encode(message: _151.AccountLockedPastTimeNotUnlockingOnlyResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedPastTimeNotUnlockingOnlyResponse;
            fromJSON(object: any): _151.AccountLockedPastTimeNotUnlockingOnlyResponse;
            toJSON(message: _151.AccountLockedPastTimeNotUnlockingOnlyResponse): unknown;
            fromPartial(object: {
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _151.AccountLockedPastTimeNotUnlockingOnlyResponse;
        };
        AccountUnlockedBeforeTimeRequest: {
            encode(message: _151.AccountUnlockedBeforeTimeRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountUnlockedBeforeTimeRequest;
            fromJSON(object: any): _151.AccountUnlockedBeforeTimeRequest;
            toJSON(message: _151.AccountUnlockedBeforeTimeRequest): unknown;
            fromPartial(object: {
                owner?: string;
                timestamp?: Date;
            }): _151.AccountUnlockedBeforeTimeRequest;
        };
        AccountUnlockedBeforeTimeResponse: {
            encode(message: _151.AccountUnlockedBeforeTimeResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountUnlockedBeforeTimeResponse;
            fromJSON(object: any): _151.AccountUnlockedBeforeTimeResponse;
            toJSON(message: _151.AccountUnlockedBeforeTimeResponse): unknown;
            fromPartial(object: {
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _151.AccountUnlockedBeforeTimeResponse;
        };
        AccountLockedPastTimeDenomRequest: {
            encode(message: _151.AccountLockedPastTimeDenomRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedPastTimeDenomRequest;
            fromJSON(object: any): _151.AccountLockedPastTimeDenomRequest;
            toJSON(message: _151.AccountLockedPastTimeDenomRequest): unknown;
            fromPartial(object: {
                owner?: string;
                timestamp?: Date;
                denom?: string;
            }): _151.AccountLockedPastTimeDenomRequest;
        };
        AccountLockedPastTimeDenomResponse: {
            encode(message: _151.AccountLockedPastTimeDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedPastTimeDenomResponse;
            fromJSON(object: any): _151.AccountLockedPastTimeDenomResponse;
            toJSON(message: _151.AccountLockedPastTimeDenomResponse): unknown;
            fromPartial(object: {
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _151.AccountLockedPastTimeDenomResponse;
        };
        LockedDenomRequest: {
            encode(message: _151.LockedDenomRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.LockedDenomRequest;
            fromJSON(object: any): _151.LockedDenomRequest;
            toJSON(message: _151.LockedDenomRequest): unknown;
            fromPartial(object: {
                denom?: string;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
            }): _151.LockedDenomRequest;
        };
        LockedDenomResponse: {
            encode(message: _151.LockedDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.LockedDenomResponse;
            fromJSON(object: any): _151.LockedDenomResponse;
            toJSON(message: _151.LockedDenomResponse): unknown;
            fromPartial(object: {
                amount?: string;
            }): _151.LockedDenomResponse;
        };
        LockedRequest: {
            encode(message: _151.LockedRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.LockedRequest;
            fromJSON(object: any): _151.LockedRequest;
            toJSON(message: _151.LockedRequest): unknown;
            fromPartial(object: {
                lockId?: any;
            }): _151.LockedRequest;
        };
        LockedResponse: {
            encode(message: _151.LockedResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.LockedResponse;
            fromJSON(object: any): _151.LockedResponse;
            toJSON(message: _151.LockedResponse): unknown;
            fromPartial(object: {
                lock?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                };
            }): _151.LockedResponse;
        };
        SyntheticLockupsByLockupIDRequest: {
            encode(message: _151.SyntheticLockupsByLockupIDRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.SyntheticLockupsByLockupIDRequest;
            fromJSON(object: any): _151.SyntheticLockupsByLockupIDRequest;
            toJSON(message: _151.SyntheticLockupsByLockupIDRequest): unknown;
            fromPartial(object: {
                lockId?: any;
            }): _151.SyntheticLockupsByLockupIDRequest;
        };
        SyntheticLockupsByLockupIDResponse: {
            encode(message: _151.SyntheticLockupsByLockupIDResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.SyntheticLockupsByLockupIDResponse;
            fromJSON(object: any): _151.SyntheticLockupsByLockupIDResponse;
            toJSON(message: _151.SyntheticLockupsByLockupIDResponse): unknown;
            fromPartial(object: {
                syntheticLocks?: {
                    underlyingLockId?: any;
                    synthDenom?: string;
                    endTime?: Date;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                }[];
            }): _151.SyntheticLockupsByLockupIDResponse;
        };
        AccountLockedLongerDurationRequest: {
            encode(message: _151.AccountLockedLongerDurationRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedLongerDurationRequest;
            fromJSON(object: any): _151.AccountLockedLongerDurationRequest;
            toJSON(message: _151.AccountLockedLongerDurationRequest): unknown;
            fromPartial(object: {
                owner?: string;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
            }): _151.AccountLockedLongerDurationRequest;
        };
        AccountLockedLongerDurationResponse: {
            encode(message: _151.AccountLockedLongerDurationResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedLongerDurationResponse;
            fromJSON(object: any): _151.AccountLockedLongerDurationResponse;
            toJSON(message: _151.AccountLockedLongerDurationResponse): unknown;
            fromPartial(object: {
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _151.AccountLockedLongerDurationResponse;
        };
        AccountLockedDurationRequest: {
            encode(message: _151.AccountLockedDurationRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedDurationRequest;
            fromJSON(object: any): _151.AccountLockedDurationRequest;
            toJSON(message: _151.AccountLockedDurationRequest): unknown;
            fromPartial(object: {
                owner?: string;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
            }): _151.AccountLockedDurationRequest;
        };
        AccountLockedDurationResponse: {
            encode(message: _151.AccountLockedDurationResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedDurationResponse;
            fromJSON(object: any): _151.AccountLockedDurationResponse;
            toJSON(message: _151.AccountLockedDurationResponse): unknown;
            fromPartial(object: {
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _151.AccountLockedDurationResponse;
        };
        AccountLockedLongerDurationNotUnlockingOnlyRequest: {
            encode(message: _151.AccountLockedLongerDurationNotUnlockingOnlyRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedLongerDurationNotUnlockingOnlyRequest;
            fromJSON(object: any): _151.AccountLockedLongerDurationNotUnlockingOnlyRequest;
            toJSON(message: _151.AccountLockedLongerDurationNotUnlockingOnlyRequest): unknown;
            fromPartial(object: {
                owner?: string;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
            }): _151.AccountLockedLongerDurationNotUnlockingOnlyRequest;
        };
        AccountLockedLongerDurationNotUnlockingOnlyResponse: {
            encode(message: _151.AccountLockedLongerDurationNotUnlockingOnlyResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedLongerDurationNotUnlockingOnlyResponse;
            fromJSON(object: any): _151.AccountLockedLongerDurationNotUnlockingOnlyResponse;
            toJSON(message: _151.AccountLockedLongerDurationNotUnlockingOnlyResponse): unknown;
            fromPartial(object: {
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _151.AccountLockedLongerDurationNotUnlockingOnlyResponse;
        };
        AccountLockedLongerDurationDenomRequest: {
            encode(message: _151.AccountLockedLongerDurationDenomRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedLongerDurationDenomRequest;
            fromJSON(object: any): _151.AccountLockedLongerDurationDenomRequest;
            toJSON(message: _151.AccountLockedLongerDurationDenomRequest): unknown;
            fromPartial(object: {
                owner?: string;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
                denom?: string;
            }): _151.AccountLockedLongerDurationDenomRequest;
        };
        AccountLockedLongerDurationDenomResponse: {
            encode(message: _151.AccountLockedLongerDurationDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _151.AccountLockedLongerDurationDenomResponse;
            fromJSON(object: any): _151.AccountLockedLongerDurationDenomResponse;
            toJSON(message: _151.AccountLockedLongerDurationDenomResponse): unknown;
            fromPartial(object: {
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
            }): _151.AccountLockedLongerDurationDenomResponse;
        };
        lockQueryTypeFromJSON(object: any): _150.LockQueryType;
        lockQueryTypeToJSON(object: _150.LockQueryType): string;
        LockQueryType: typeof _150.LockQueryType;
        PeriodLock: {
            encode(message: _150.PeriodLock, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _150.PeriodLock;
            fromJSON(object: any): _150.PeriodLock;
            toJSON(message: _150.PeriodLock): unknown;
            fromPartial(object: {
                ID?: any;
                owner?: string;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
                endTime?: Date;
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _150.PeriodLock;
        };
        QueryCondition: {
            encode(message: _150.QueryCondition, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _150.QueryCondition;
            fromJSON(object: any): _150.QueryCondition;
            toJSON(message: _150.QueryCondition): unknown;
            fromPartial(object: {
                lockQueryType?: _150.LockQueryType;
                denom?: string;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
                timestamp?: Date;
            }): _150.QueryCondition;
        };
        SyntheticLock: {
            encode(message: _150.SyntheticLock, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _150.SyntheticLock;
            fromJSON(object: any): _150.SyntheticLock;
            toJSON(message: _150.SyntheticLock): unknown;
            fromPartial(object: {
                underlyingLockId?: any;
                synthDenom?: string;
                endTime?: Date;
                duration?: {
                    seconds?: any;
                    nanos?: number;
                };
            }): _150.SyntheticLock;
        };
        GenesisState: {
            encode(message: _149.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _149.GenesisState;
            fromJSON(object: any): _149.GenesisState;
            toJSON(message: _149.GenesisState): unknown;
            fromPartial(object: {
                lastLockId?: any;
                locks?: {
                    ID?: any;
                    owner?: string;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    endTime?: Date;
                    coins?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }[];
                syntheticLocks?: {
                    underlyingLockId?: any;
                    synthDenom?: string;
                    endTime?: Date;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                }[];
            }): _149.GenesisState;
        };
    };
    namespace mint {
        const v1beta1: {
            QueryParamsRequest: {
                encode(_: _155.QueryParamsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _155.QueryParamsRequest;
                fromJSON(_: any): _155.QueryParamsRequest;
                toJSON(_: _155.QueryParamsRequest): unknown;
                fromPartial(_: {}): _155.QueryParamsRequest;
            };
            QueryParamsResponse: {
                encode(message: _155.QueryParamsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _155.QueryParamsResponse;
                fromJSON(object: any): _155.QueryParamsResponse;
                toJSON(message: _155.QueryParamsResponse): unknown;
                fromPartial(object: {
                    params?: {
                        mintDenom?: string;
                        genesisEpochProvisions?: string;
                        epochIdentifier?: string;
                        reductionPeriodInEpochs?: any;
                        reductionFactor?: string;
                        distributionProportions?: {
                            staking?: string;
                            poolIncentives?: string;
                            developerRewards?: string;
                            communityPool?: string;
                        };
                        weightedDeveloperRewardsReceivers?: {
                            address?: string;
                            weight?: string;
                        }[];
                        mintingRewardsDistributionStartEpoch?: any;
                    };
                }): _155.QueryParamsResponse;
            };
            QueryEpochProvisionsRequest: {
                encode(_: _155.QueryEpochProvisionsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _155.QueryEpochProvisionsRequest;
                fromJSON(_: any): _155.QueryEpochProvisionsRequest;
                toJSON(_: _155.QueryEpochProvisionsRequest): unknown;
                fromPartial(_: {}): _155.QueryEpochProvisionsRequest;
            };
            QueryEpochProvisionsResponse: {
                encode(message: _155.QueryEpochProvisionsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _155.QueryEpochProvisionsResponse;
                fromJSON(object: any): _155.QueryEpochProvisionsResponse;
                toJSON(message: _155.QueryEpochProvisionsResponse): unknown;
                fromPartial(object: {
                    epochProvisions?: Uint8Array;
                }): _155.QueryEpochProvisionsResponse;
            };
            Minter: {
                encode(message: _154.Minter, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _154.Minter;
                fromJSON(object: any): _154.Minter;
                toJSON(message: _154.Minter): unknown;
                fromPartial(object: {
                    epochProvisions?: string;
                }): _154.Minter;
            };
            WeightedAddress: {
                encode(message: _154.WeightedAddress, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _154.WeightedAddress;
                fromJSON(object: any): _154.WeightedAddress;
                toJSON(message: _154.WeightedAddress): unknown;
                fromPartial(object: {
                    address?: string;
                    weight?: string;
                }): _154.WeightedAddress;
            };
            DistributionProportions: {
                encode(message: _154.DistributionProportions, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _154.DistributionProportions;
                fromJSON(object: any): _154.DistributionProportions;
                toJSON(message: _154.DistributionProportions): unknown;
                fromPartial(object: {
                    staking?: string;
                    poolIncentives?: string;
                    developerRewards?: string;
                    communityPool?: string;
                }): _154.DistributionProportions;
            };
            Params: {
                encode(message: _154.Params, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _154.Params;
                fromJSON(object: any): _154.Params;
                toJSON(message: _154.Params): unknown;
                fromPartial(object: {
                    mintDenom?: string;
                    genesisEpochProvisions?: string;
                    epochIdentifier?: string;
                    reductionPeriodInEpochs?: any;
                    reductionFactor?: string;
                    distributionProportions?: {
                        staking?: string;
                        poolIncentives?: string;
                        developerRewards?: string;
                        communityPool?: string;
                    };
                    weightedDeveloperRewardsReceivers?: {
                        address?: string;
                        weight?: string;
                    }[];
                    mintingRewardsDistributionStartEpoch?: any;
                }): _154.Params;
            };
            GenesisState: {
                encode(message: _153.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _153.GenesisState;
                fromJSON(object: any): _153.GenesisState;
                toJSON(message: _153.GenesisState): unknown;
                fromPartial(object: {
                    minter?: {
                        epochProvisions?: string;
                    };
                    params?: {
                        mintDenom?: string;
                        genesisEpochProvisions?: string;
                        epochIdentifier?: string;
                        reductionPeriodInEpochs?: any;
                        reductionFactor?: string;
                        distributionProportions?: {
                            staking?: string;
                            poolIncentives?: string;
                            developerRewards?: string;
                            communityPool?: string;
                        };
                        weightedDeveloperRewardsReceivers?: {
                            address?: string;
                            weight?: string;
                        }[];
                        mintingRewardsDistributionStartEpoch?: any;
                    };
                    reductionStartedEpoch?: any;
                }): _153.GenesisState;
            };
        };
    }
    namespace poolincentives {
        const v1beta1: {
            QueryGaugeIdsRequest: {
                encode(message: _159.QueryGaugeIdsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryGaugeIdsRequest;
                fromJSON(object: any): _159.QueryGaugeIdsRequest;
                toJSON(message: _159.QueryGaugeIdsRequest): unknown;
                fromPartial(object: {
                    poolId?: any;
                }): _159.QueryGaugeIdsRequest;
            };
            QueryGaugeIdsResponse: {
                encode(message: _159.QueryGaugeIdsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryGaugeIdsResponse;
                fromJSON(object: any): _159.QueryGaugeIdsResponse;
                toJSON(message: _159.QueryGaugeIdsResponse): unknown;
                fromPartial(object: {
                    gaugeIdsWithDuration?: {
                        gaugeId?: any;
                        duration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        gaugeIncentivePercentage?: string;
                    }[];
                }): _159.QueryGaugeIdsResponse;
            };
            QueryGaugeIdsResponse_GaugeIdWithDuration: {
                encode(message: _159.QueryGaugeIdsResponse_GaugeIdWithDuration, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryGaugeIdsResponse_GaugeIdWithDuration;
                fromJSON(object: any): _159.QueryGaugeIdsResponse_GaugeIdWithDuration;
                toJSON(message: _159.QueryGaugeIdsResponse_GaugeIdWithDuration): unknown;
                fromPartial(object: {
                    gaugeId?: any;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    gaugeIncentivePercentage?: string;
                }): _159.QueryGaugeIdsResponse_GaugeIdWithDuration;
            };
            QueryDistrInfoRequest: {
                encode(_: _159.QueryDistrInfoRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryDistrInfoRequest;
                fromJSON(_: any): _159.QueryDistrInfoRequest;
                toJSON(_: _159.QueryDistrInfoRequest): unknown;
                fromPartial(_: {}): _159.QueryDistrInfoRequest;
            };
            QueryDistrInfoResponse: {
                encode(message: _159.QueryDistrInfoResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryDistrInfoResponse;
                fromJSON(object: any): _159.QueryDistrInfoResponse;
                toJSON(message: _159.QueryDistrInfoResponse): unknown;
                fromPartial(object: {
                    distrInfo?: {
                        totalWeight?: string;
                        records?: {
                            gaugeId?: any;
                            weight?: string;
                        }[];
                    };
                }): _159.QueryDistrInfoResponse;
            };
            QueryParamsRequest: {
                encode(_: _159.QueryParamsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryParamsRequest;
                fromJSON(_: any): _159.QueryParamsRequest;
                toJSON(_: _159.QueryParamsRequest): unknown;
                fromPartial(_: {}): _159.QueryParamsRequest;
            };
            QueryParamsResponse: {
                encode(message: _159.QueryParamsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryParamsResponse;
                fromJSON(object: any): _159.QueryParamsResponse;
                toJSON(message: _159.QueryParamsResponse): unknown;
                fromPartial(object: {
                    params?: {
                        mintedDenom?: string;
                    };
                }): _159.QueryParamsResponse;
            };
            QueryLockableDurationsRequest: {
                encode(_: _159.QueryLockableDurationsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryLockableDurationsRequest;
                fromJSON(_: any): _159.QueryLockableDurationsRequest;
                toJSON(_: _159.QueryLockableDurationsRequest): unknown;
                fromPartial(_: {}): _159.QueryLockableDurationsRequest;
            };
            QueryLockableDurationsResponse: {
                encode(message: _159.QueryLockableDurationsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryLockableDurationsResponse;
                fromJSON(object: any): _159.QueryLockableDurationsResponse;
                toJSON(message: _159.QueryLockableDurationsResponse): unknown;
                fromPartial(object: {
                    lockableDurations?: {
                        seconds?: any;
                        nanos?: number;
                    }[];
                }): _159.QueryLockableDurationsResponse;
            };
            QueryIncentivizedPoolsRequest: {
                encode(_: _159.QueryIncentivizedPoolsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryIncentivizedPoolsRequest;
                fromJSON(_: any): _159.QueryIncentivizedPoolsRequest;
                toJSON(_: _159.QueryIncentivizedPoolsRequest): unknown;
                fromPartial(_: {}): _159.QueryIncentivizedPoolsRequest;
            };
            IncentivizedPool: {
                encode(message: _159.IncentivizedPool, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.IncentivizedPool;
                fromJSON(object: any): _159.IncentivizedPool;
                toJSON(message: _159.IncentivizedPool): unknown;
                fromPartial(object: {
                    poolId?: any;
                    lockableDuration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    gaugeId?: any;
                }): _159.IncentivizedPool;
            };
            QueryIncentivizedPoolsResponse: {
                encode(message: _159.QueryIncentivizedPoolsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryIncentivizedPoolsResponse;
                fromJSON(object: any): _159.QueryIncentivizedPoolsResponse;
                toJSON(message: _159.QueryIncentivizedPoolsResponse): unknown;
                fromPartial(object: {
                    incentivizedPools?: {
                        poolId?: any;
                        lockableDuration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        gaugeId?: any;
                    }[];
                }): _159.QueryIncentivizedPoolsResponse;
            };
            QueryExternalIncentiveGaugesRequest: {
                encode(_: _159.QueryExternalIncentiveGaugesRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryExternalIncentiveGaugesRequest;
                fromJSON(_: any): _159.QueryExternalIncentiveGaugesRequest;
                toJSON(_: _159.QueryExternalIncentiveGaugesRequest): unknown;
                fromPartial(_: {}): _159.QueryExternalIncentiveGaugesRequest;
            };
            QueryExternalIncentiveGaugesResponse: {
                encode(message: _159.QueryExternalIncentiveGaugesResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _159.QueryExternalIncentiveGaugesResponse;
                fromJSON(object: any): _159.QueryExternalIncentiveGaugesResponse;
                toJSON(message: _159.QueryExternalIncentiveGaugesResponse): unknown;
                fromPartial(object: {
                    data?: {
                        id?: any;
                        isPerpetual?: boolean;
                        distributeTo?: {
                            lockQueryType?: _150.LockQueryType;
                            denom?: string;
                            duration?: {
                                seconds?: any;
                                nanos?: number;
                            };
                            timestamp?: Date;
                        };
                        coins?: {
                            denom?: string;
                            amount?: string;
                        }[];
                        startTime?: Date;
                        numEpochsPaidOver?: any;
                        filledEpochs?: any;
                        distributedCoins?: {
                            denom?: string;
                            amount?: string;
                        }[];
                    }[];
                }): _159.QueryExternalIncentiveGaugesResponse;
            };
            Params: {
                encode(message: _158.Params, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _158.Params;
                fromJSON(object: any): _158.Params;
                toJSON(message: _158.Params): unknown;
                fromPartial(object: {
                    mintedDenom?: string;
                }): _158.Params;
            };
            LockableDurationsInfo: {
                encode(message: _158.LockableDurationsInfo, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _158.LockableDurationsInfo;
                fromJSON(object: any): _158.LockableDurationsInfo;
                toJSON(message: _158.LockableDurationsInfo): unknown;
                fromPartial(object: {
                    lockableDurations?: {
                        seconds?: any;
                        nanos?: number;
                    }[];
                }): _158.LockableDurationsInfo;
            };
            DistrInfo: {
                encode(message: _158.DistrInfo, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _158.DistrInfo;
                fromJSON(object: any): _158.DistrInfo;
                toJSON(message: _158.DistrInfo): unknown;
                fromPartial(object: {
                    totalWeight?: string;
                    records?: {
                        gaugeId?: any;
                        weight?: string;
                    }[];
                }): _158.DistrInfo;
            };
            DistrRecord: {
                encode(message: _158.DistrRecord, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _158.DistrRecord;
                fromJSON(object: any): _158.DistrRecord;
                toJSON(message: _158.DistrRecord): unknown;
                fromPartial(object: {
                    gaugeId?: any;
                    weight?: string;
                }): _158.DistrRecord;
            };
            ReplacePoolIncentivesProposal: {
                encode(message: _157.ReplacePoolIncentivesProposal, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _157.ReplacePoolIncentivesProposal;
                fromJSON(object: any): _157.ReplacePoolIncentivesProposal;
                toJSON(message: _157.ReplacePoolIncentivesProposal): unknown;
                fromPartial(object: {
                    title?: string;
                    description?: string;
                    records?: {
                        gaugeId?: any;
                        weight?: string;
                    }[];
                }): _157.ReplacePoolIncentivesProposal;
            };
            UpdatePoolIncentivesProposal: {
                encode(message: _157.UpdatePoolIncentivesProposal, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _157.UpdatePoolIncentivesProposal;
                fromJSON(object: any): _157.UpdatePoolIncentivesProposal;
                toJSON(message: _157.UpdatePoolIncentivesProposal): unknown;
                fromPartial(object: {
                    title?: string;
                    description?: string;
                    records?: {
                        gaugeId?: any;
                        weight?: string;
                    }[];
                }): _157.UpdatePoolIncentivesProposal;
            };
            GenesisState: {
                encode(message: _156.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _156.GenesisState;
                fromJSON(object: any): _156.GenesisState;
                toJSON(message: _156.GenesisState): unknown;
                fromPartial(object: {
                    params?: {
                        mintedDenom?: string;
                    };
                    lockableDurations?: {
                        seconds?: any;
                        nanos?: number;
                    }[];
                    distrInfo?: {
                        totalWeight?: string;
                        records?: {
                            gaugeId?: any;
                            weight?: string;
                        }[];
                    };
                }): _156.GenesisState;
            };
        };
    }
    namespace store {
        const v1beta1: {
            Node: {
                encode(message: _160.Node, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _160.Node;
                fromJSON(object: any): _160.Node;
                toJSON(message: _160.Node): unknown;
                fromPartial(object: {
                    children?: {
                        index?: Uint8Array;
                        accumulation?: string;
                    }[];
                }): _160.Node;
            };
            Child: {
                encode(message: _160.Child, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _160.Child;
                fromJSON(object: any): _160.Child;
                toJSON(message: _160.Child): unknown;
                fromPartial(object: {
                    index?: Uint8Array;
                    accumulation?: string;
                }): _160.Child;
            };
            Leaf: {
                encode(message: _160.Leaf, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _160.Leaf;
                fromJSON(object: any): _160.Leaf;
                toJSON(message: _160.Leaf): unknown;
                fromPartial(object: {
                    leaf?: {
                        index?: Uint8Array;
                        accumulation?: string;
                    };
                }): _160.Leaf;
            };
        };
    }
    namespace streamswap {
        const v1: {
            registry: readonly [string, import("@cosmjs/proto-signing").GeneratedType][];
            load: (protoRegistry: import("@cosmjs/proto-signing").Registry) => void;
            MessageComposer: {
                encoded: {
                    createSale(value: _166.MsgCreateSale): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    subscribe(value: _166.MsgSubscribe): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    withdraw(value: _166.MsgWithdraw): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    exitSale(value: _166.MsgExitSale): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    finalizeSale(value: _166.MsgFinalizeSale): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                };
                withTypeUrl: {
                    createSale(value: _166.MsgCreateSale): {
                        typeUrl: string;
                        value: _166.MsgCreateSale;
                    };
                    subscribe(value: _166.MsgSubscribe): {
                        typeUrl: string;
                        value: _166.MsgSubscribe;
                    };
                    withdraw(value: _166.MsgWithdraw): {
                        typeUrl: string;
                        value: _166.MsgWithdraw;
                    };
                    exitSale(value: _166.MsgExitSale): {
                        typeUrl: string;
                        value: _166.MsgExitSale;
                    };
                    finalizeSale(value: _166.MsgFinalizeSale): {
                        typeUrl: string;
                        value: _166.MsgFinalizeSale;
                    };
                };
                toJSON: {
                    createSale(value: _166.MsgCreateSale): {
                        typeUrl: string;
                        value: unknown;
                    };
                    subscribe(value: _166.MsgSubscribe): {
                        typeUrl: string;
                        value: unknown;
                    };
                    withdraw(value: _166.MsgWithdraw): {
                        typeUrl: string;
                        value: unknown;
                    };
                    exitSale(value: _166.MsgExitSale): {
                        typeUrl: string;
                        value: unknown;
                    };
                    finalizeSale(value: _166.MsgFinalizeSale): {
                        typeUrl: string;
                        value: unknown;
                    };
                };
                fromJSON: {
                    createSale(value: any): {
                        typeUrl: string;
                        value: _166.MsgCreateSale;
                    };
                    subscribe(value: any): {
                        typeUrl: string;
                        value: _166.MsgSubscribe;
                    };
                    withdraw(value: any): {
                        typeUrl: string;
                        value: _166.MsgWithdraw;
                    };
                    exitSale(value: any): {
                        typeUrl: string;
                        value: _166.MsgExitSale;
                    };
                    finalizeSale(value: any): {
                        typeUrl: string;
                        value: _166.MsgFinalizeSale;
                    };
                };
                fromPartial: {
                    createSale(value: _166.MsgCreateSale): {
                        typeUrl: string;
                        value: _166.MsgCreateSale;
                    };
                    subscribe(value: _166.MsgSubscribe): {
                        typeUrl: string;
                        value: _166.MsgSubscribe;
                    };
                    withdraw(value: _166.MsgWithdraw): {
                        typeUrl: string;
                        value: _166.MsgWithdraw;
                    };
                    exitSale(value: _166.MsgExitSale): {
                        typeUrl: string;
                        value: _166.MsgExitSale;
                    };
                    finalizeSale(value: _166.MsgFinalizeSale): {
                        typeUrl: string;
                        value: _166.MsgFinalizeSale;
                    };
                };
            };
            AminoConverter: {
                "/osmosis.streamswap.v1.MsgCreateSale": {
                    aminoType: string;
                    toAmino: ({ creator, tokenIn, tokenOut, maxFee, startTime, duration, recipient, name, url }: _166.MsgCreateSale) => {
                        creator: string;
                        token_in: string;
                        token_out: {
                            denom: string;
                            amount: string;
                        };
                        max_fee: {
                            denom: string;
                            amount: string;
                        }[];
                        start_time: {
                            seconds: string;
                            nanos: number;
                        };
                        duration: {
                            seconds: string;
                            nanos: number;
                        };
                        recipient: string;
                        name: string;
                        url: string;
                    };
                    fromAmino: ({ creator, token_in, token_out, max_fee, start_time, duration, recipient, name, url }: {
                        creator: string;
                        token_in: string;
                        token_out: {
                            denom: string;
                            amount: string;
                        };
                        max_fee: {
                            denom: string;
                            amount: string;
                        }[];
                        start_time: {
                            seconds: string;
                            nanos: number;
                        };
                        duration: {
                            seconds: string;
                            nanos: number;
                        };
                        recipient: string;
                        name: string;
                        url: string;
                    }) => _166.MsgCreateSale;
                };
                "/osmosis.streamswap.v1.MsgSubscribe": {
                    aminoType: string;
                    toAmino: ({ sender, saleId, amount }: _166.MsgSubscribe) => {
                        sender: string;
                        sale_id: string;
                        amount: string;
                    };
                    fromAmino: ({ sender, sale_id, amount }: {
                        sender: string;
                        sale_id: string;
                        amount: string;
                    }) => _166.MsgSubscribe;
                };
                "/osmosis.streamswap.v1.MsgWithdraw": {
                    aminoType: string;
                    toAmino: ({ sender, saleId, amount }: _166.MsgWithdraw) => {
                        sender: string;
                        sale_id: string;
                        amount: string;
                    };
                    fromAmino: ({ sender, sale_id, amount }: {
                        sender: string;
                        sale_id: string;
                        amount: string;
                    }) => _166.MsgWithdraw;
                };
                "/osmosis.streamswap.v1.MsgExitSale": {
                    aminoType: string;
                    toAmino: ({ sender, saleId }: _166.MsgExitSale) => {
                        sender: string;
                        sale_id: string;
                    };
                    fromAmino: ({ sender, sale_id }: {
                        sender: string;
                        sale_id: string;
                    }) => _166.MsgExitSale;
                };
                "/osmosis.streamswap.v1.MsgFinalizeSale": {
                    aminoType: string;
                    toAmino: ({ sender, saleId }: _166.MsgFinalizeSale) => {
                        sender: string;
                        sale_id: string;
                    };
                    fromAmino: ({ sender, sale_id }: {
                        sender: string;
                        sale_id: string;
                    }) => _166.MsgFinalizeSale;
                };
            };
            MsgCreateSale: {
                encode(message: _166.MsgCreateSale, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _166.MsgCreateSale;
                fromJSON(object: any): _166.MsgCreateSale;
                toJSON(message: _166.MsgCreateSale): unknown;
                fromPartial(object: {
                    creator?: string;
                    tokenIn?: string;
                    tokenOut?: {
                        denom?: string;
                        amount?: string;
                    };
                    maxFee?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    startTime?: Date;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    recipient?: string;
                    name?: string;
                    url?: string;
                }): _166.MsgCreateSale;
            };
            MsgCreateSaleResponse: {
                encode(message: _166.MsgCreateSaleResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _166.MsgCreateSaleResponse;
                fromJSON(object: any): _166.MsgCreateSaleResponse;
                toJSON(message: _166.MsgCreateSaleResponse): unknown;
                fromPartial(object: {
                    saleId?: any;
                }): _166.MsgCreateSaleResponse;
            };
            MsgSubscribe: {
                encode(message: _166.MsgSubscribe, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _166.MsgSubscribe;
                fromJSON(object: any): _166.MsgSubscribe;
                toJSON(message: _166.MsgSubscribe): unknown;
                fromPartial(object: {
                    sender?: string;
                    saleId?: any;
                    amount?: string;
                }): _166.MsgSubscribe;
            };
            MsgWithdraw: {
                encode(message: _166.MsgWithdraw, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _166.MsgWithdraw;
                fromJSON(object: any): _166.MsgWithdraw;
                toJSON(message: _166.MsgWithdraw): unknown;
                fromPartial(object: {
                    sender?: string;
                    saleId?: any;
                    amount?: string;
                }): _166.MsgWithdraw;
            };
            MsgExitSale: {
                encode(message: _166.MsgExitSale, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _166.MsgExitSale;
                fromJSON(object: any): _166.MsgExitSale;
                toJSON(message: _166.MsgExitSale): unknown;
                fromPartial(object: {
                    sender?: string;
                    saleId?: any;
                }): _166.MsgExitSale;
            };
            MsgExitSaleResponse: {
                encode(message: _166.MsgExitSaleResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _166.MsgExitSaleResponse;
                fromJSON(object: any): _166.MsgExitSaleResponse;
                toJSON(message: _166.MsgExitSaleResponse): unknown;
                fromPartial(object: {
                    purchased?: string;
                }): _166.MsgExitSaleResponse;
            };
            MsgFinalizeSale: {
                encode(message: _166.MsgFinalizeSale, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _166.MsgFinalizeSale;
                fromJSON(object: any): _166.MsgFinalizeSale;
                toJSON(message: _166.MsgFinalizeSale): unknown;
                fromPartial(object: {
                    sender?: string;
                    saleId?: any;
                }): _166.MsgFinalizeSale;
            };
            MsgFinalizeSaleResponse: {
                encode(message: _166.MsgFinalizeSaleResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _166.MsgFinalizeSaleResponse;
                fromJSON(object: any): _166.MsgFinalizeSaleResponse;
                toJSON(message: _166.MsgFinalizeSaleResponse): unknown;
                fromPartial(object: {
                    income?: string;
                }): _166.MsgFinalizeSaleResponse;
            };
            Sale: {
                encode(message: _165.Sale, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _165.Sale;
                fromJSON(object: any): _165.Sale;
                toJSON(message: _165.Sale): unknown;
                fromPartial(object: {
                    treasury?: string;
                    id?: any;
                    tokenOut?: string;
                    tokenIn?: string;
                    tokenOutSupply?: string;
                    startTime?: Date;
                    endTime?: Date;
                    round?: any;
                    endRound?: any;
                    outRemaining?: string;
                    outSold?: string;
                    outPerShare?: string;
                    staked?: string;
                    income?: string;
                    shares?: string;
                    name?: string;
                    url?: string;
                }): _165.Sale;
            };
            UserPosition: {
                encode(message: _165.UserPosition, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _165.UserPosition;
                fromJSON(object: any): _165.UserPosition;
                toJSON(message: _165.UserPosition): unknown;
                fromPartial(object: {
                    shares?: string;
                    staked?: string;
                    outPerShare?: string;
                    spent?: string;
                    purchased?: string;
                }): _165.UserPosition;
            };
            QuerySales: {
                encode(message: _164.QuerySales, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _164.QuerySales;
                fromJSON(object: any): _164.QuerySales;
                toJSON(message: _164.QuerySales): unknown;
                fromPartial(object: {
                    pagination?: {
                        key?: Uint8Array;
                        offset?: any;
                        limit?: any;
                        countTotal?: boolean;
                        reverse?: boolean;
                    };
                }): _164.QuerySales;
            };
            QuerySalesResponse: {
                encode(message: _164.QuerySalesResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _164.QuerySalesResponse;
                fromJSON(object: any): _164.QuerySalesResponse;
                toJSON(message: _164.QuerySalesResponse): unknown;
                fromPartial(object: {
                    sales?: {
                        treasury?: string;
                        id?: any;
                        tokenOut?: string;
                        tokenIn?: string;
                        tokenOutSupply?: string;
                        startTime?: Date;
                        endTime?: Date;
                        round?: any;
                        endRound?: any;
                        outRemaining?: string;
                        outSold?: string;
                        outPerShare?: string;
                        staked?: string;
                        income?: string;
                        shares?: string;
                        name?: string;
                        url?: string;
                    }[];
                    pagination?: {
                        nextKey?: Uint8Array;
                        total?: any;
                    };
                }): _164.QuerySalesResponse;
            };
            QuerySale: {
                encode(message: _164.QuerySale, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _164.QuerySale;
                fromJSON(object: any): _164.QuerySale;
                toJSON(message: _164.QuerySale): unknown;
                fromPartial(object: {
                    saleId?: any;
                }): _164.QuerySale;
            };
            QuerySaleResponse: {
                encode(message: _164.QuerySaleResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _164.QuerySaleResponse;
                fromJSON(object: any): _164.QuerySaleResponse;
                toJSON(message: _164.QuerySaleResponse): unknown;
                fromPartial(object: {
                    sale?: {
                        treasury?: string;
                        id?: any;
                        tokenOut?: string;
                        tokenIn?: string;
                        tokenOutSupply?: string;
                        startTime?: Date;
                        endTime?: Date;
                        round?: any;
                        endRound?: any;
                        outRemaining?: string;
                        outSold?: string;
                        outPerShare?: string;
                        staked?: string;
                        income?: string;
                        shares?: string;
                        name?: string;
                        url?: string;
                    };
                }): _164.QuerySaleResponse;
            };
            QueryUserPosition: {
                encode(message: _164.QueryUserPosition, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _164.QueryUserPosition;
                fromJSON(object: any): _164.QueryUserPosition;
                toJSON(message: _164.QueryUserPosition): unknown;
                fromPartial(object: {
                    saleId?: any;
                    user?: string;
                }): _164.QueryUserPosition;
            };
            QueryUserPositionResponse: {
                encode(message: _164.QueryUserPositionResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _164.QueryUserPositionResponse;
                fromJSON(object: any): _164.QueryUserPositionResponse;
                toJSON(message: _164.QueryUserPositionResponse): unknown;
                fromPartial(object: {
                    userPosition?: {
                        shares?: string;
                        staked?: string;
                        outPerShare?: string;
                        spent?: string;
                        purchased?: string;
                    };
                }): _164.QueryUserPositionResponse;
            };
            Params: {
                encode(message: _163.Params, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _163.Params;
                fromJSON(object: any): _163.Params;
                toJSON(message: _163.Params): unknown;
                fromPartial(object: {
                    saleCreationFee?: {
                        denom?: string;
                        amount?: string;
                    }[];
                    saleCreationFeeRecipient?: string;
                    minDurationUntilStartTime?: {
                        seconds?: any;
                        nanos?: number;
                    };
                    minSaleDuration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                }): _163.Params;
            };
            GenesisState: {
                encode(message: _162.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _162.GenesisState;
                fromJSON(object: any): _162.GenesisState;
                toJSON(message: _162.GenesisState): unknown;
                fromPartial(object: {
                    sales?: {
                        treasury?: string;
                        id?: any;
                        tokenOut?: string;
                        tokenIn?: string;
                        tokenOutSupply?: string;
                        startTime?: Date;
                        endTime?: Date;
                        round?: any;
                        endRound?: any;
                        outRemaining?: string;
                        outSold?: string;
                        outPerShare?: string;
                        staked?: string;
                        income?: string;
                        shares?: string;
                        name?: string;
                        url?: string;
                    }[];
                    userPositions?: {
                        accAddress?: string;
                        saleId?: any;
                        userPosition?: {
                            shares?: string;
                            staked?: string;
                            outPerShare?: string;
                            spent?: string;
                            purchased?: string;
                        };
                    }[];
                    nextSaleId?: any;
                    params?: {
                        saleCreationFee?: {
                            denom?: string;
                            amount?: string;
                        }[];
                        saleCreationFeeRecipient?: string;
                        minDurationUntilStartTime?: {
                            seconds?: any;
                            nanos?: number;
                        };
                        minSaleDuration?: {
                            seconds?: any;
                            nanos?: number;
                        };
                    };
                }): _162.GenesisState;
            };
            UserPositionKV: {
                encode(message: _162.UserPositionKV, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _162.UserPositionKV;
                fromJSON(object: any): _162.UserPositionKV;
                toJSON(message: _162.UserPositionKV): unknown;
                fromPartial(object: {
                    accAddress?: string;
                    saleId?: any;
                    userPosition?: {
                        shares?: string;
                        staked?: string;
                        outPerShare?: string;
                        spent?: string;
                        purchased?: string;
                    };
                }): _162.UserPositionKV;
            };
            EventCreateSale: {
                encode(message: _161.EventCreateSale, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _161.EventCreateSale;
                fromJSON(object: any): _161.EventCreateSale;
                toJSON(message: _161.EventCreateSale): unknown;
                fromPartial(object: {
                    id?: any;
                    creator?: string;
                    tokenIn?: string;
                    tokenOut?: {
                        denom?: string;
                        amount?: string;
                    };
                }): _161.EventCreateSale;
            };
            EventSubscribe: {
                encode(message: _161.EventSubscribe, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _161.EventSubscribe;
                fromJSON(object: any): _161.EventSubscribe;
                toJSON(message: _161.EventSubscribe): unknown;
                fromPartial(object: {
                    sender?: string;
                    saleId?: any;
                    amount?: string;
                }): _161.EventSubscribe;
            };
            EventWithdraw: {
                encode(message: _161.EventWithdraw, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _161.EventWithdraw;
                fromJSON(object: any): _161.EventWithdraw;
                toJSON(message: _161.EventWithdraw): unknown;
                fromPartial(object: {
                    sender?: string;
                    saleId?: any;
                    amount?: string;
                }): _161.EventWithdraw;
            };
            EventExit: {
                encode(message: _161.EventExit, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _161.EventExit;
                fromJSON(object: any): _161.EventExit;
                toJSON(message: _161.EventExit): unknown;
                fromPartial(object: {
                    sender?: string;
                    saleId?: any;
                    purchased?: string;
                }): _161.EventExit;
            };
            EventFinalizeSale: {
                encode(message: _161.EventFinalizeSale, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _161.EventFinalizeSale;
                fromJSON(object: any): _161.EventFinalizeSale;
                toJSON(message: _161.EventFinalizeSale): unknown;
                fromPartial(object: {
                    saleId?: any;
                    income?: string;
                }): _161.EventFinalizeSale;
            };
        };
    }
    const superfluid: {
        registry: readonly [string, import("@cosmjs/proto-signing").GeneratedType][];
        load: (protoRegistry: import("@cosmjs/proto-signing").Registry) => void;
        MessageComposer: {
            encoded: {
                superfluidDelegate(value: _171.MsgSuperfluidDelegate): {
                    typeUrl: string;
                    value: Uint8Array;
                };
                superfluidUndelegate(value: _171.MsgSuperfluidUndelegate): {
                    typeUrl: string;
                    value: Uint8Array;
                };
                superfluidUnbondLock(value: _171.MsgSuperfluidUnbondLock): {
                    typeUrl: string;
                    value: Uint8Array;
                };
                lockAndSuperfluidDelegate(value: _171.MsgLockAndSuperfluidDelegate): {
                    typeUrl: string;
                    value: Uint8Array;
                };
                unPoolWhitelistedPool(value: _171.MsgUnPoolWhitelistedPool): {
                    typeUrl: string;
                    value: Uint8Array;
                };
            };
            withTypeUrl: {
                superfluidDelegate(value: _171.MsgSuperfluidDelegate): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidDelegate;
                };
                superfluidUndelegate(value: _171.MsgSuperfluidUndelegate): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidUndelegate;
                };
                superfluidUnbondLock(value: _171.MsgSuperfluidUnbondLock): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidUnbondLock;
                };
                lockAndSuperfluidDelegate(value: _171.MsgLockAndSuperfluidDelegate): {
                    typeUrl: string;
                    value: _171.MsgLockAndSuperfluidDelegate;
                };
                unPoolWhitelistedPool(value: _171.MsgUnPoolWhitelistedPool): {
                    typeUrl: string;
                    value: _171.MsgUnPoolWhitelistedPool;
                };
            };
            toJSON: {
                superfluidDelegate(value: _171.MsgSuperfluidDelegate): {
                    typeUrl: string;
                    value: unknown;
                };
                superfluidUndelegate(value: _171.MsgSuperfluidUndelegate): {
                    typeUrl: string;
                    value: unknown;
                };
                superfluidUnbondLock(value: _171.MsgSuperfluidUnbondLock): {
                    typeUrl: string;
                    value: unknown;
                };
                lockAndSuperfluidDelegate(value: _171.MsgLockAndSuperfluidDelegate): {
                    typeUrl: string;
                    value: unknown;
                };
                unPoolWhitelistedPool(value: _171.MsgUnPoolWhitelistedPool): {
                    typeUrl: string;
                    value: unknown;
                };
            };
            fromJSON: {
                superfluidDelegate(value: any): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidDelegate;
                };
                superfluidUndelegate(value: any): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidUndelegate;
                };
                superfluidUnbondLock(value: any): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidUnbondLock;
                };
                lockAndSuperfluidDelegate(value: any): {
                    typeUrl: string;
                    value: _171.MsgLockAndSuperfluidDelegate;
                };
                unPoolWhitelistedPool(value: any): {
                    typeUrl: string;
                    value: _171.MsgUnPoolWhitelistedPool;
                };
            };
            fromPartial: {
                superfluidDelegate(value: _171.MsgSuperfluidDelegate): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidDelegate;
                };
                superfluidUndelegate(value: _171.MsgSuperfluidUndelegate): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidUndelegate;
                };
                superfluidUnbondLock(value: _171.MsgSuperfluidUnbondLock): {
                    typeUrl: string;
                    value: _171.MsgSuperfluidUnbondLock;
                };
                lockAndSuperfluidDelegate(value: _171.MsgLockAndSuperfluidDelegate): {
                    typeUrl: string;
                    value: _171.MsgLockAndSuperfluidDelegate;
                };
                unPoolWhitelistedPool(value: _171.MsgUnPoolWhitelistedPool): {
                    typeUrl: string;
                    value: _171.MsgUnPoolWhitelistedPool;
                };
            };
        };
        AminoConverter: {
            "/osmosis.superfluid.MsgSuperfluidDelegate": {
                aminoType: string;
                toAmino: ({ sender, lockId, valAddr }: _171.MsgSuperfluidDelegate) => {
                    sender: string;
                    lock_id: string;
                    val_addr: string;
                };
                fromAmino: ({ sender, lock_id, val_addr }: {
                    sender: string;
                    lock_id: string;
                    val_addr: string;
                }) => _171.MsgSuperfluidDelegate;
            };
            "/osmosis.superfluid.MsgSuperfluidUndelegate": {
                aminoType: string;
                toAmino: ({ sender, lockId }: _171.MsgSuperfluidUndelegate) => {
                    sender: string;
                    lock_id: string;
                };
                fromAmino: ({ sender, lock_id }: {
                    sender: string;
                    lock_id: string;
                }) => _171.MsgSuperfluidUndelegate;
            };
            "/osmosis.superfluid.MsgSuperfluidUnbondLock": {
                aminoType: string;
                toAmino: ({ sender, lockId }: _171.MsgSuperfluidUnbondLock) => {
                    sender: string;
                    lock_id: string;
                };
                fromAmino: ({ sender, lock_id }: {
                    sender: string;
                    lock_id: string;
                }) => _171.MsgSuperfluidUnbondLock;
            };
            "/osmosis.superfluid.MsgLockAndSuperfluidDelegate": {
                aminoType: string;
                toAmino: ({ sender, coins, valAddr }: _171.MsgLockAndSuperfluidDelegate) => {
                    sender: string;
                    coins: {
                        denom: string;
                        amount: string;
                    }[];
                    val_addr: string;
                };
                fromAmino: ({ sender, coins, val_addr }: {
                    sender: string;
                    coins: {
                        denom: string;
                        amount: string;
                    }[];
                    val_addr: string;
                }) => _171.MsgLockAndSuperfluidDelegate;
            };
            "/osmosis.superfluid.MsgUnPoolWhitelistedPool": {
                aminoType: string;
                toAmino: ({ sender, poolId }: _171.MsgUnPoolWhitelistedPool) => {
                    sender: string;
                    pool_id: string;
                };
                fromAmino: ({ sender, pool_id }: {
                    sender: string;
                    pool_id: string;
                }) => _171.MsgUnPoolWhitelistedPool;
            };
        };
        MsgSuperfluidDelegate: {
            encode(message: _171.MsgSuperfluidDelegate, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgSuperfluidDelegate;
            fromJSON(object: any): _171.MsgSuperfluidDelegate;
            toJSON(message: _171.MsgSuperfluidDelegate): unknown;
            fromPartial(object: {
                sender?: string;
                lockId?: any;
                valAddr?: string;
            }): _171.MsgSuperfluidDelegate;
        };
        MsgSuperfluidDelegateResponse: {
            encode(_: _171.MsgSuperfluidDelegateResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgSuperfluidDelegateResponse;
            fromJSON(_: any): _171.MsgSuperfluidDelegateResponse;
            toJSON(_: _171.MsgSuperfluidDelegateResponse): unknown;
            fromPartial(_: {}): _171.MsgSuperfluidDelegateResponse;
        };
        MsgSuperfluidUndelegate: {
            encode(message: _171.MsgSuperfluidUndelegate, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgSuperfluidUndelegate;
            fromJSON(object: any): _171.MsgSuperfluidUndelegate;
            toJSON(message: _171.MsgSuperfluidUndelegate): unknown;
            fromPartial(object: {
                sender?: string;
                lockId?: any;
            }): _171.MsgSuperfluidUndelegate;
        };
        MsgSuperfluidUndelegateResponse: {
            encode(_: _171.MsgSuperfluidUndelegateResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgSuperfluidUndelegateResponse;
            fromJSON(_: any): _171.MsgSuperfluidUndelegateResponse;
            toJSON(_: _171.MsgSuperfluidUndelegateResponse): unknown;
            fromPartial(_: {}): _171.MsgSuperfluidUndelegateResponse;
        };
        MsgSuperfluidUnbondLock: {
            encode(message: _171.MsgSuperfluidUnbondLock, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgSuperfluidUnbondLock;
            fromJSON(object: any): _171.MsgSuperfluidUnbondLock;
            toJSON(message: _171.MsgSuperfluidUnbondLock): unknown;
            fromPartial(object: {
                sender?: string;
                lockId?: any;
            }): _171.MsgSuperfluidUnbondLock;
        };
        MsgSuperfluidUnbondLockResponse: {
            encode(_: _171.MsgSuperfluidUnbondLockResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgSuperfluidUnbondLockResponse;
            fromJSON(_: any): _171.MsgSuperfluidUnbondLockResponse;
            toJSON(_: _171.MsgSuperfluidUnbondLockResponse): unknown;
            fromPartial(_: {}): _171.MsgSuperfluidUnbondLockResponse;
        };
        MsgLockAndSuperfluidDelegate: {
            encode(message: _171.MsgLockAndSuperfluidDelegate, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgLockAndSuperfluidDelegate;
            fromJSON(object: any): _171.MsgLockAndSuperfluidDelegate;
            toJSON(message: _171.MsgLockAndSuperfluidDelegate): unknown;
            fromPartial(object: {
                sender?: string;
                coins?: {
                    denom?: string;
                    amount?: string;
                }[];
                valAddr?: string;
            }): _171.MsgLockAndSuperfluidDelegate;
        };
        MsgLockAndSuperfluidDelegateResponse: {
            encode(message: _171.MsgLockAndSuperfluidDelegateResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgLockAndSuperfluidDelegateResponse;
            fromJSON(object: any): _171.MsgLockAndSuperfluidDelegateResponse;
            toJSON(message: _171.MsgLockAndSuperfluidDelegateResponse): unknown;
            fromPartial(object: {
                ID?: any;
            }): _171.MsgLockAndSuperfluidDelegateResponse;
        };
        MsgUnPoolWhitelistedPool: {
            encode(message: _171.MsgUnPoolWhitelistedPool, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgUnPoolWhitelistedPool;
            fromJSON(object: any): _171.MsgUnPoolWhitelistedPool;
            toJSON(message: _171.MsgUnPoolWhitelistedPool): unknown;
            fromPartial(object: {
                sender?: string;
                poolId?: any;
            }): _171.MsgUnPoolWhitelistedPool;
        };
        MsgUnPoolWhitelistedPoolResponse: {
            encode(message: _171.MsgUnPoolWhitelistedPoolResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _171.MsgUnPoolWhitelistedPoolResponse;
            fromJSON(object: any): _171.MsgUnPoolWhitelistedPoolResponse;
            toJSON(message: _171.MsgUnPoolWhitelistedPoolResponse): unknown;
            fromPartial(object: {
                exitedLockIds?: any[];
            }): _171.MsgUnPoolWhitelistedPoolResponse;
        };
        superfluidAssetTypeFromJSON(object: any): _170.SuperfluidAssetType;
        superfluidAssetTypeToJSON(object: _170.SuperfluidAssetType): string;
        SuperfluidAssetType: typeof _170.SuperfluidAssetType;
        SuperfluidAsset: {
            encode(message: _170.SuperfluidAsset, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _170.SuperfluidAsset;
            fromJSON(object: any): _170.SuperfluidAsset;
            toJSON(message: _170.SuperfluidAsset): unknown;
            fromPartial(object: {
                denom?: string;
                assetType?: _170.SuperfluidAssetType;
            }): _170.SuperfluidAsset;
        };
        SuperfluidIntermediaryAccount: {
            encode(message: _170.SuperfluidIntermediaryAccount, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _170.SuperfluidIntermediaryAccount;
            fromJSON(object: any): _170.SuperfluidIntermediaryAccount;
            toJSON(message: _170.SuperfluidIntermediaryAccount): unknown;
            fromPartial(object: {
                denom?: string;
                valAddr?: string;
                gaugeId?: any;
            }): _170.SuperfluidIntermediaryAccount;
        };
        OsmoEquivalentMultiplierRecord: {
            encode(message: _170.OsmoEquivalentMultiplierRecord, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _170.OsmoEquivalentMultiplierRecord;
            fromJSON(object: any): _170.OsmoEquivalentMultiplierRecord;
            toJSON(message: _170.OsmoEquivalentMultiplierRecord): unknown;
            fromPartial(object: {
                epochNumber?: any;
                denom?: string;
                multiplier?: string;
            }): _170.OsmoEquivalentMultiplierRecord;
        };
        SuperfluidDelegationRecord: {
            encode(message: _170.SuperfluidDelegationRecord, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _170.SuperfluidDelegationRecord;
            fromJSON(object: any): _170.SuperfluidDelegationRecord;
            toJSON(message: _170.SuperfluidDelegationRecord): unknown;
            fromPartial(object: {
                delegatorAddress?: string;
                validatorAddress?: string;
                delegationAmount?: {
                    denom?: string;
                    amount?: string;
                };
                equivalentStakedAmount?: {
                    denom?: string;
                    amount?: string;
                };
            }): _170.SuperfluidDelegationRecord;
        };
        LockIdIntermediaryAccountConnection: {
            encode(message: _170.LockIdIntermediaryAccountConnection, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _170.LockIdIntermediaryAccountConnection;
            fromJSON(object: any): _170.LockIdIntermediaryAccountConnection;
            toJSON(message: _170.LockIdIntermediaryAccountConnection): unknown;
            fromPartial(object: {
                lockId?: any;
                intermediaryAccount?: string;
            }): _170.LockIdIntermediaryAccountConnection;
        };
        UnpoolWhitelistedPools: {
            encode(message: _170.UnpoolWhitelistedPools, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _170.UnpoolWhitelistedPools;
            fromJSON(object: any): _170.UnpoolWhitelistedPools;
            toJSON(message: _170.UnpoolWhitelistedPools): unknown;
            fromPartial(object: {
                ids?: any[];
            }): _170.UnpoolWhitelistedPools;
        };
        QueryParamsRequest: {
            encode(_: _169.QueryParamsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.QueryParamsRequest;
            fromJSON(_: any): _169.QueryParamsRequest;
            toJSON(_: _169.QueryParamsRequest): unknown;
            fromPartial(_: {}): _169.QueryParamsRequest;
        };
        QueryParamsResponse: {
            encode(message: _169.QueryParamsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.QueryParamsResponse;
            fromJSON(object: any): _169.QueryParamsResponse;
            toJSON(message: _169.QueryParamsResponse): unknown;
            fromPartial(object: {
                params?: {
                    minimumRiskFactor?: string;
                };
            }): _169.QueryParamsResponse;
        };
        AssetTypeRequest: {
            encode(message: _169.AssetTypeRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.AssetTypeRequest;
            fromJSON(object: any): _169.AssetTypeRequest;
            toJSON(message: _169.AssetTypeRequest): unknown;
            fromPartial(object: {
                denom?: string;
            }): _169.AssetTypeRequest;
        };
        AssetTypeResponse: {
            encode(message: _169.AssetTypeResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.AssetTypeResponse;
            fromJSON(object: any): _169.AssetTypeResponse;
            toJSON(message: _169.AssetTypeResponse): unknown;
            fromPartial(object: {
                assetType?: _170.SuperfluidAssetType;
            }): _169.AssetTypeResponse;
        };
        AllAssetsRequest: {
            encode(_: _169.AllAssetsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.AllAssetsRequest;
            fromJSON(_: any): _169.AllAssetsRequest;
            toJSON(_: _169.AllAssetsRequest): unknown;
            fromPartial(_: {}): _169.AllAssetsRequest;
        };
        AllAssetsResponse: {
            encode(message: _169.AllAssetsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.AllAssetsResponse;
            fromJSON(object: any): _169.AllAssetsResponse;
            toJSON(message: _169.AllAssetsResponse): unknown;
            fromPartial(object: {
                assets?: {
                    denom?: string;
                    assetType?: _170.SuperfluidAssetType;
                }[];
            }): _169.AllAssetsResponse;
        };
        AssetMultiplierRequest: {
            encode(message: _169.AssetMultiplierRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.AssetMultiplierRequest;
            fromJSON(object: any): _169.AssetMultiplierRequest;
            toJSON(message: _169.AssetMultiplierRequest): unknown;
            fromPartial(object: {
                denom?: string;
            }): _169.AssetMultiplierRequest;
        };
        AssetMultiplierResponse: {
            encode(message: _169.AssetMultiplierResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.AssetMultiplierResponse;
            fromJSON(object: any): _169.AssetMultiplierResponse;
            toJSON(message: _169.AssetMultiplierResponse): unknown;
            fromPartial(object: {
                osmoEquivalentMultiplier?: {
                    epochNumber?: any;
                    denom?: string;
                    multiplier?: string;
                };
            }): _169.AssetMultiplierResponse;
        };
        SuperfluidIntermediaryAccountInfo: {
            encode(message: _169.SuperfluidIntermediaryAccountInfo, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidIntermediaryAccountInfo;
            fromJSON(object: any): _169.SuperfluidIntermediaryAccountInfo;
            toJSON(message: _169.SuperfluidIntermediaryAccountInfo): unknown;
            fromPartial(object: {
                denom?: string;
                valAddr?: string;
                gaugeId?: any;
                address?: string;
            }): _169.SuperfluidIntermediaryAccountInfo;
        };
        AllIntermediaryAccountsRequest: {
            encode(message: _169.AllIntermediaryAccountsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.AllIntermediaryAccountsRequest;
            fromJSON(object: any): _169.AllIntermediaryAccountsRequest;
            toJSON(message: _169.AllIntermediaryAccountsRequest): unknown;
            fromPartial(object: {
                pagination?: {
                    key?: Uint8Array;
                    offset?: any;
                    limit?: any;
                    countTotal?: boolean;
                    reverse?: boolean;
                };
            }): _169.AllIntermediaryAccountsRequest;
        };
        AllIntermediaryAccountsResponse: {
            encode(message: _169.AllIntermediaryAccountsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.AllIntermediaryAccountsResponse;
            fromJSON(object: any): _169.AllIntermediaryAccountsResponse;
            toJSON(message: _169.AllIntermediaryAccountsResponse): unknown;
            fromPartial(object: {
                accounts?: {
                    denom?: string;
                    valAddr?: string;
                    gaugeId?: any;
                    address?: string;
                }[];
                pagination?: {
                    nextKey?: Uint8Array;
                    total?: any;
                };
            }): _169.AllIntermediaryAccountsResponse;
        };
        ConnectedIntermediaryAccountRequest: {
            encode(message: _169.ConnectedIntermediaryAccountRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.ConnectedIntermediaryAccountRequest;
            fromJSON(object: any): _169.ConnectedIntermediaryAccountRequest;
            toJSON(message: _169.ConnectedIntermediaryAccountRequest): unknown;
            fromPartial(object: {
                lockId?: any;
            }): _169.ConnectedIntermediaryAccountRequest;
        };
        ConnectedIntermediaryAccountResponse: {
            encode(message: _169.ConnectedIntermediaryAccountResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.ConnectedIntermediaryAccountResponse;
            fromJSON(object: any): _169.ConnectedIntermediaryAccountResponse;
            toJSON(message: _169.ConnectedIntermediaryAccountResponse): unknown;
            fromPartial(object: {
                account?: {
                    denom?: string;
                    valAddr?: string;
                    gaugeId?: any;
                    address?: string;
                };
            }): _169.ConnectedIntermediaryAccountResponse;
        };
        TotalSuperfluidDelegationsRequest: {
            encode(_: _169.TotalSuperfluidDelegationsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.TotalSuperfluidDelegationsRequest;
            fromJSON(_: any): _169.TotalSuperfluidDelegationsRequest;
            toJSON(_: _169.TotalSuperfluidDelegationsRequest): unknown;
            fromPartial(_: {}): _169.TotalSuperfluidDelegationsRequest;
        };
        TotalSuperfluidDelegationsResponse: {
            encode(message: _169.TotalSuperfluidDelegationsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.TotalSuperfluidDelegationsResponse;
            fromJSON(object: any): _169.TotalSuperfluidDelegationsResponse;
            toJSON(message: _169.TotalSuperfluidDelegationsResponse): unknown;
            fromPartial(object: {
                totalDelegations?: string;
            }): _169.TotalSuperfluidDelegationsResponse;
        };
        SuperfluidDelegationAmountRequest: {
            encode(message: _169.SuperfluidDelegationAmountRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidDelegationAmountRequest;
            fromJSON(object: any): _169.SuperfluidDelegationAmountRequest;
            toJSON(message: _169.SuperfluidDelegationAmountRequest): unknown;
            fromPartial(object: {
                delegatorAddress?: string;
                validatorAddress?: string;
                denom?: string;
            }): _169.SuperfluidDelegationAmountRequest;
        };
        SuperfluidDelegationAmountResponse: {
            encode(message: _169.SuperfluidDelegationAmountResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidDelegationAmountResponse;
            fromJSON(object: any): _169.SuperfluidDelegationAmountResponse;
            toJSON(message: _169.SuperfluidDelegationAmountResponse): unknown;
            fromPartial(object: {
                amount?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _169.SuperfluidDelegationAmountResponse;
        };
        SuperfluidDelegationsByDelegatorRequest: {
            encode(message: _169.SuperfluidDelegationsByDelegatorRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidDelegationsByDelegatorRequest;
            fromJSON(object: any): _169.SuperfluidDelegationsByDelegatorRequest;
            toJSON(message: _169.SuperfluidDelegationsByDelegatorRequest): unknown;
            fromPartial(object: {
                delegatorAddress?: string;
            }): _169.SuperfluidDelegationsByDelegatorRequest;
        };
        SuperfluidDelegationsByDelegatorResponse: {
            encode(message: _169.SuperfluidDelegationsByDelegatorResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidDelegationsByDelegatorResponse;
            fromJSON(object: any): _169.SuperfluidDelegationsByDelegatorResponse;
            toJSON(message: _169.SuperfluidDelegationsByDelegatorResponse): unknown;
            fromPartial(object: {
                superfluidDelegationRecords?: {
                    delegatorAddress?: string;
                    validatorAddress?: string;
                    delegationAmount?: {
                        denom?: string;
                        amount?: string;
                    };
                    equivalentStakedAmount?: {
                        denom?: string;
                        amount?: string;
                    };
                }[];
                totalDelegatedCoins?: {
                    denom?: string;
                    amount?: string;
                }[];
                totalEquivalentStakedAmount?: {
                    denom?: string;
                    amount?: string;
                };
            }): _169.SuperfluidDelegationsByDelegatorResponse;
        };
        SuperfluidUndelegationsByDelegatorRequest: {
            encode(message: _169.SuperfluidUndelegationsByDelegatorRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidUndelegationsByDelegatorRequest;
            fromJSON(object: any): _169.SuperfluidUndelegationsByDelegatorRequest;
            toJSON(message: _169.SuperfluidUndelegationsByDelegatorRequest): unknown;
            fromPartial(object: {
                delegatorAddress?: string;
                denom?: string;
            }): _169.SuperfluidUndelegationsByDelegatorRequest;
        };
        SuperfluidUndelegationsByDelegatorResponse: {
            encode(message: _169.SuperfluidUndelegationsByDelegatorResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidUndelegationsByDelegatorResponse;
            fromJSON(object: any): _169.SuperfluidUndelegationsByDelegatorResponse;
            toJSON(message: _169.SuperfluidUndelegationsByDelegatorResponse): unknown;
            fromPartial(object: {
                superfluidDelegationRecords?: {
                    delegatorAddress?: string;
                    validatorAddress?: string;
                    delegationAmount?: {
                        denom?: string;
                        amount?: string;
                    };
                    equivalentStakedAmount?: {
                        denom?: string;
                        amount?: string;
                    };
                }[];
                totalUndelegatedCoins?: {
                    denom?: string;
                    amount?: string;
                }[];
                syntheticLocks?: {
                    underlyingLockId?: any;
                    synthDenom?: string;
                    endTime?: Date;
                    duration?: {
                        seconds?: any;
                        nanos?: number;
                    };
                }[];
            }): _169.SuperfluidUndelegationsByDelegatorResponse;
        };
        SuperfluidDelegationsByValidatorDenomRequest: {
            encode(message: _169.SuperfluidDelegationsByValidatorDenomRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidDelegationsByValidatorDenomRequest;
            fromJSON(object: any): _169.SuperfluidDelegationsByValidatorDenomRequest;
            toJSON(message: _169.SuperfluidDelegationsByValidatorDenomRequest): unknown;
            fromPartial(object: {
                validatorAddress?: string;
                denom?: string;
            }): _169.SuperfluidDelegationsByValidatorDenomRequest;
        };
        SuperfluidDelegationsByValidatorDenomResponse: {
            encode(message: _169.SuperfluidDelegationsByValidatorDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.SuperfluidDelegationsByValidatorDenomResponse;
            fromJSON(object: any): _169.SuperfluidDelegationsByValidatorDenomResponse;
            toJSON(message: _169.SuperfluidDelegationsByValidatorDenomResponse): unknown;
            fromPartial(object: {
                superfluidDelegationRecords?: {
                    delegatorAddress?: string;
                    validatorAddress?: string;
                    delegationAmount?: {
                        denom?: string;
                        amount?: string;
                    };
                    equivalentStakedAmount?: {
                        denom?: string;
                        amount?: string;
                    };
                }[];
            }): _169.SuperfluidDelegationsByValidatorDenomResponse;
        };
        EstimateSuperfluidDelegatedAmountByValidatorDenomRequest: {
            encode(message: _169.EstimateSuperfluidDelegatedAmountByValidatorDenomRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.EstimateSuperfluidDelegatedAmountByValidatorDenomRequest;
            fromJSON(object: any): _169.EstimateSuperfluidDelegatedAmountByValidatorDenomRequest;
            toJSON(message: _169.EstimateSuperfluidDelegatedAmountByValidatorDenomRequest): unknown;
            fromPartial(object: {
                validatorAddress?: string;
                denom?: string;
            }): _169.EstimateSuperfluidDelegatedAmountByValidatorDenomRequest;
        };
        EstimateSuperfluidDelegatedAmountByValidatorDenomResponse: {
            encode(message: _169.EstimateSuperfluidDelegatedAmountByValidatorDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.EstimateSuperfluidDelegatedAmountByValidatorDenomResponse;
            fromJSON(object: any): _169.EstimateSuperfluidDelegatedAmountByValidatorDenomResponse;
            toJSON(message: _169.EstimateSuperfluidDelegatedAmountByValidatorDenomResponse): unknown;
            fromPartial(object: {
                totalDelegatedCoins?: {
                    denom?: string;
                    amount?: string;
                }[];
            }): _169.EstimateSuperfluidDelegatedAmountByValidatorDenomResponse;
        };
        QueryTotalDelegationByDelegatorRequest: {
            encode(message: _169.QueryTotalDelegationByDelegatorRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.QueryTotalDelegationByDelegatorRequest;
            fromJSON(object: any): _169.QueryTotalDelegationByDelegatorRequest;
            toJSON(message: _169.QueryTotalDelegationByDelegatorRequest): unknown;
            fromPartial(object: {
                delegatorAddress?: string;
            }): _169.QueryTotalDelegationByDelegatorRequest;
        };
        QueryTotalDelegationByDelegatorResponse: {
            encode(message: _169.QueryTotalDelegationByDelegatorResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _169.QueryTotalDelegationByDelegatorResponse;
            fromJSON(object: any): _169.QueryTotalDelegationByDelegatorResponse;
            toJSON(message: _169.QueryTotalDelegationByDelegatorResponse): unknown;
            fromPartial(object: {
                superfluidDelegationRecords?: {
                    delegatorAddress?: string;
                    validatorAddress?: string;
                    delegationAmount?: {
                        denom?: string;
                        amount?: string;
                    };
                    equivalentStakedAmount?: {
                        denom?: string;
                        amount?: string;
                    };
                }[];
                delegationResponse?: {
                    delegation?: {
                        delegatorAddress?: string;
                        validatorAddress?: string;
                        shares?: string;
                    };
                    balance?: {
                        denom?: string;
                        amount?: string;
                    };
                }[];
                totalDelegatedCoins?: {
                    denom?: string;
                    amount?: string;
                }[];
                totalEquivalentStakedAmount?: {
                    denom?: string;
                    amount?: string;
                };
            }): _169.QueryTotalDelegationByDelegatorResponse;
        };
        Params: {
            encode(message: _168.Params, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _168.Params;
            fromJSON(object: any): _168.Params;
            toJSON(message: _168.Params): unknown;
            fromPartial(object: {
                minimumRiskFactor?: string;
            }): _168.Params;
        };
        GenesisState: {
            encode(message: _167.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
            decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _167.GenesisState;
            fromJSON(object: any): _167.GenesisState;
            toJSON(message: _167.GenesisState): unknown;
            fromPartial(object: {
                params?: {
                    minimumRiskFactor?: string;
                };
                superfluidAssets?: {
                    denom?: string;
                    assetType?: _170.SuperfluidAssetType;
                }[];
                osmoEquivalentMultipliers?: {
                    epochNumber?: any;
                    denom?: string;
                    multiplier?: string;
                }[];
                intermediaryAccounts?: {
                    denom?: string;
                    valAddr?: string;
                    gaugeId?: any;
                }[];
                intemediaryAccountConnections?: {
                    lockId?: any;
                    intermediaryAccount?: string;
                }[];
            }): _167.GenesisState;
        };
    };
    namespace tokenfactory {
        const v1beta1: {
            registry: readonly [string, import("@cosmjs/proto-signing").GeneratedType][];
            load: (protoRegistry: import("@cosmjs/proto-signing").Registry) => void;
            MessageComposer: {
                encoded: {
                    createDenom(value: _176.MsgCreateDenom): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    mint(value: _176.MsgMint): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    burn(value: _176.MsgBurn): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    changeAdmin(value: _176.MsgChangeAdmin): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                    setDenomMetadata(value: _176.MsgSetDenomMetadata): {
                        typeUrl: string;
                        value: Uint8Array;
                    };
                };
                withTypeUrl: {
                    createDenom(value: _176.MsgCreateDenom): {
                        typeUrl: string;
                        value: _176.MsgCreateDenom;
                    };
                    mint(value: _176.MsgMint): {
                        typeUrl: string;
                        value: _176.MsgMint;
                    };
                    burn(value: _176.MsgBurn): {
                        typeUrl: string;
                        value: _176.MsgBurn;
                    };
                    changeAdmin(value: _176.MsgChangeAdmin): {
                        typeUrl: string;
                        value: _176.MsgChangeAdmin;
                    };
                    setDenomMetadata(value: _176.MsgSetDenomMetadata): {
                        typeUrl: string;
                        value: _176.MsgSetDenomMetadata;
                    };
                };
                toJSON: {
                    createDenom(value: _176.MsgCreateDenom): {
                        typeUrl: string;
                        value: unknown;
                    };
                    mint(value: _176.MsgMint): {
                        typeUrl: string;
                        value: unknown;
                    };
                    burn(value: _176.MsgBurn): {
                        typeUrl: string;
                        value: unknown;
                    };
                    changeAdmin(value: _176.MsgChangeAdmin): {
                        typeUrl: string;
                        value: unknown;
                    };
                    setDenomMetadata(value: _176.MsgSetDenomMetadata): {
                        typeUrl: string;
                        value: unknown;
                    };
                };
                fromJSON: {
                    createDenom(value: any): {
                        typeUrl: string;
                        value: _176.MsgCreateDenom;
                    };
                    mint(value: any): {
                        typeUrl: string;
                        value: _176.MsgMint;
                    };
                    burn(value: any): {
                        typeUrl: string;
                        value: _176.MsgBurn;
                    };
                    changeAdmin(value: any): {
                        typeUrl: string;
                        value: _176.MsgChangeAdmin;
                    };
                    setDenomMetadata(value: any): {
                        typeUrl: string;
                        value: _176.MsgSetDenomMetadata;
                    };
                };
                fromPartial: {
                    createDenom(value: _176.MsgCreateDenom): {
                        typeUrl: string;
                        value: _176.MsgCreateDenom;
                    };
                    mint(value: _176.MsgMint): {
                        typeUrl: string;
                        value: _176.MsgMint;
                    };
                    burn(value: _176.MsgBurn): {
                        typeUrl: string;
                        value: _176.MsgBurn;
                    };
                    changeAdmin(value: _176.MsgChangeAdmin): {
                        typeUrl: string;
                        value: _176.MsgChangeAdmin;
                    };
                    setDenomMetadata(value: _176.MsgSetDenomMetadata): {
                        typeUrl: string;
                        value: _176.MsgSetDenomMetadata;
                    };
                };
            };
            AminoConverter: {
                "/osmosis.tokenfactory.v1beta1.MsgCreateDenom": {
                    aminoType: string;
                    toAmino: ({ sender, subdenom }: _176.MsgCreateDenom) => {
                        sender: string;
                        subdenom: string;
                    };
                    fromAmino: ({ sender, subdenom }: {
                        sender: string;
                        subdenom: string;
                    }) => _176.MsgCreateDenom;
                };
                "/osmosis.tokenfactory.v1beta1.MsgMint": {
                    aminoType: string;
                    toAmino: ({ sender, amount }: _176.MsgMint) => {
                        sender: string;
                        amount: {
                            denom: string;
                            amount: string;
                        };
                    };
                    fromAmino: ({ sender, amount }: {
                        sender: string;
                        amount: {
                            denom: string;
                            amount: string;
                        };
                    }) => _176.MsgMint;
                };
                "/osmosis.tokenfactory.v1beta1.MsgBurn": {
                    aminoType: string;
                    toAmino: ({ sender, amount }: _176.MsgBurn) => {
                        sender: string;
                        amount: {
                            denom: string;
                            amount: string;
                        };
                    };
                    fromAmino: ({ sender, amount }: {
                        sender: string;
                        amount: {
                            denom: string;
                            amount: string;
                        };
                    }) => _176.MsgBurn;
                };
                "/osmosis.tokenfactory.v1beta1.MsgChangeAdmin": {
                    aminoType: string;
                    toAmino: ({ sender, denom, newAdmin }: _176.MsgChangeAdmin) => {
                        sender: string;
                        denom: string;
                        new_admin: string;
                    };
                    fromAmino: ({ sender, denom, new_admin }: {
                        sender: string;
                        denom: string;
                        new_admin: string;
                    }) => _176.MsgChangeAdmin;
                };
                "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata": {
                    aminoType: string;
                    toAmino: ({ sender, metadata }: _176.MsgSetDenomMetadata) => {
                        sender: string;
                        metadata: {
                            description: string;
                            denom_units: {
                                denom: string;
                                exponent: number;
                                aliases: string[];
                            }[];
                            base: string;
                            display: string;
                            name: string;
                            symbol: string;
                            uri: string;
                            uri_hash: string;
                        };
                    };
                    fromAmino: ({ sender, metadata }: {
                        sender: string;
                        metadata: {
                            description: string;
                            denom_units: {
                                denom: string;
                                exponent: number;
                                aliases: string[];
                            }[];
                            base: string;
                            display: string;
                            name: string;
                            symbol: string;
                            uri: string;
                            uri_hash: string;
                        };
                    }) => _176.MsgSetDenomMetadata;
                };
            };
            MsgCreateDenom: {
                encode(message: _176.MsgCreateDenom, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgCreateDenom;
                fromJSON(object: any): _176.MsgCreateDenom;
                toJSON(message: _176.MsgCreateDenom): unknown;
                fromPartial(object: {
                    sender?: string;
                    subdenom?: string;
                }): _176.MsgCreateDenom;
            };
            MsgCreateDenomResponse: {
                encode(message: _176.MsgCreateDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgCreateDenomResponse;
                fromJSON(object: any): _176.MsgCreateDenomResponse;
                toJSON(message: _176.MsgCreateDenomResponse): unknown;
                fromPartial(object: {
                    newTokenDenom?: string;
                }): _176.MsgCreateDenomResponse;
            };
            MsgMint: {
                encode(message: _176.MsgMint, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgMint;
                fromJSON(object: any): _176.MsgMint;
                toJSON(message: _176.MsgMint): unknown;
                fromPartial(object: {
                    sender?: string;
                    amount?: {
                        denom?: string;
                        amount?: string;
                    };
                }): _176.MsgMint;
            };
            MsgMintResponse: {
                encode(_: _176.MsgMintResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgMintResponse;
                fromJSON(_: any): _176.MsgMintResponse;
                toJSON(_: _176.MsgMintResponse): unknown;
                fromPartial(_: {}): _176.MsgMintResponse;
            };
            MsgBurn: {
                encode(message: _176.MsgBurn, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgBurn;
                fromJSON(object: any): _176.MsgBurn;
                toJSON(message: _176.MsgBurn): unknown;
                fromPartial(object: {
                    sender?: string;
                    amount?: {
                        denom?: string;
                        amount?: string;
                    };
                }): _176.MsgBurn;
            };
            MsgBurnResponse: {
                encode(_: _176.MsgBurnResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgBurnResponse;
                fromJSON(_: any): _176.MsgBurnResponse;
                toJSON(_: _176.MsgBurnResponse): unknown;
                fromPartial(_: {}): _176.MsgBurnResponse;
            };
            MsgChangeAdmin: {
                encode(message: _176.MsgChangeAdmin, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgChangeAdmin;
                fromJSON(object: any): _176.MsgChangeAdmin;
                toJSON(message: _176.MsgChangeAdmin): unknown;
                fromPartial(object: {
                    sender?: string;
                    denom?: string;
                    newAdmin?: string;
                }): _176.MsgChangeAdmin;
            };
            MsgChangeAdminResponse: {
                encode(_: _176.MsgChangeAdminResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgChangeAdminResponse;
                fromJSON(_: any): _176.MsgChangeAdminResponse;
                toJSON(_: _176.MsgChangeAdminResponse): unknown;
                fromPartial(_: {}): _176.MsgChangeAdminResponse;
            };
            MsgSetDenomMetadata: {
                encode(message: _176.MsgSetDenomMetadata, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgSetDenomMetadata;
                fromJSON(object: any): _176.MsgSetDenomMetadata;
                toJSON(message: _176.MsgSetDenomMetadata): unknown;
                fromPartial(object: {
                    sender?: string;
                    metadata?: {
                        description?: string;
                        denomUnits?: {
                            denom?: string;
                            exponent?: number;
                            aliases?: string[];
                        }[];
                        base?: string;
                        display?: string;
                        name?: string;
                        symbol?: string;
                        uri?: string;
                        uriHash?: string;
                    };
                }): _176.MsgSetDenomMetadata;
            };
            MsgSetDenomMetadataResponse: {
                encode(_: _176.MsgSetDenomMetadataResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _176.MsgSetDenomMetadataResponse;
                fromJSON(_: any): _176.MsgSetDenomMetadataResponse;
                toJSON(_: _176.MsgSetDenomMetadataResponse): unknown;
                fromPartial(_: {}): _176.MsgSetDenomMetadataResponse;
            };
            QueryParamsRequest: {
                encode(_: _175.QueryParamsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _175.QueryParamsRequest;
                fromJSON(_: any): _175.QueryParamsRequest;
                toJSON(_: _175.QueryParamsRequest): unknown;
                fromPartial(_: {}): _175.QueryParamsRequest;
            };
            QueryParamsResponse: {
                encode(message: _175.QueryParamsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _175.QueryParamsResponse;
                fromJSON(object: any): _175.QueryParamsResponse;
                toJSON(message: _175.QueryParamsResponse): unknown;
                fromPartial(object: {
                    params?: {
                        denomCreationFee?: {
                            denom?: string;
                            amount?: string;
                        }[];
                    };
                }): _175.QueryParamsResponse;
            };
            QueryDenomAuthorityMetadataRequest: {
                encode(message: _175.QueryDenomAuthorityMetadataRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _175.QueryDenomAuthorityMetadataRequest;
                fromJSON(object: any): _175.QueryDenomAuthorityMetadataRequest;
                toJSON(message: _175.QueryDenomAuthorityMetadataRequest): unknown;
                fromPartial(object: {
                    denom?: string;
                }): _175.QueryDenomAuthorityMetadataRequest;
            };
            QueryDenomAuthorityMetadataResponse: {
                encode(message: _175.QueryDenomAuthorityMetadataResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _175.QueryDenomAuthorityMetadataResponse;
                fromJSON(object: any): _175.QueryDenomAuthorityMetadataResponse;
                toJSON(message: _175.QueryDenomAuthorityMetadataResponse): unknown;
                fromPartial(object: {
                    authorityMetadata?: {
                        admin?: string;
                    };
                }): _175.QueryDenomAuthorityMetadataResponse;
            };
            QueryDenomsFromCreatorRequest: {
                encode(message: _175.QueryDenomsFromCreatorRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _175.QueryDenomsFromCreatorRequest;
                fromJSON(object: any): _175.QueryDenomsFromCreatorRequest;
                toJSON(message: _175.QueryDenomsFromCreatorRequest): unknown;
                fromPartial(object: {
                    creator?: string;
                }): _175.QueryDenomsFromCreatorRequest;
            };
            QueryDenomsFromCreatorResponse: {
                encode(message: _175.QueryDenomsFromCreatorResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _175.QueryDenomsFromCreatorResponse;
                fromJSON(object: any): _175.QueryDenomsFromCreatorResponse;
                toJSON(message: _175.QueryDenomsFromCreatorResponse): unknown;
                fromPartial(object: {
                    denoms?: string[];
                }): _175.QueryDenomsFromCreatorResponse;
            };
            Params: {
                encode(message: _174.Params, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _174.Params;
                fromJSON(object: any): _174.Params;
                toJSON(message: _174.Params): unknown;
                fromPartial(object: {
                    denomCreationFee?: {
                        denom?: string;
                        amount?: string;
                    }[];
                }): _174.Params;
            };
            GenesisState: {
                encode(message: _173.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _173.GenesisState;
                fromJSON(object: any): _173.GenesisState;
                toJSON(message: _173.GenesisState): unknown;
                fromPartial(object: {
                    params?: {
                        denomCreationFee?: {
                            denom?: string;
                            amount?: string;
                        }[];
                    };
                    factoryDenoms?: {
                        denom?: string;
                        authorityMetadata?: {
                            admin?: string;
                        };
                    }[];
                }): _173.GenesisState;
            };
            GenesisDenom: {
                encode(message: _173.GenesisDenom, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _173.GenesisDenom;
                fromJSON(object: any): _173.GenesisDenom;
                toJSON(message: _173.GenesisDenom): unknown;
                fromPartial(object: {
                    denom?: string;
                    authorityMetadata?: {
                        admin?: string;
                    };
                }): _173.GenesisDenom;
            };
            DenomAuthorityMetadata: {
                encode(message: _172.DenomAuthorityMetadata, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _172.DenomAuthorityMetadata;
                fromJSON(object: any): _172.DenomAuthorityMetadata;
                toJSON(message: _172.DenomAuthorityMetadata): unknown;
                fromPartial(object: {
                    admin?: string;
                }): _172.DenomAuthorityMetadata;
            };
        };
    }
    namespace twap {
        const v1beta1: {
            TwapRecord: {
                encode(message: _179.TwapRecord, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _179.TwapRecord;
                fromJSON(object: any): _179.TwapRecord;
                toJSON(message: _179.TwapRecord): unknown;
                fromPartial(object: {
                    poolId?: any;
                    asset0Denom?: string;
                    asset1Denom?: string;
                    height?: any;
                    time?: Date;
                    p0LastSpotPrice?: string;
                    p1LastSpotPrice?: string;
                    p0ArithmeticTwapAccumulator?: string;
                    p1ArithmeticTwapAccumulator?: string;
                    lastErrorTime?: Date;
                }): _179.TwapRecord;
            };
            GetArithmeticTwapRequest: {
                encode(message: _178.GetArithmeticTwapRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _178.GetArithmeticTwapRequest;
                fromJSON(object: any): _178.GetArithmeticTwapRequest;
                toJSON(message: _178.GetArithmeticTwapRequest): unknown;
                fromPartial(object: {
                    poolId?: any;
                    baseAsset?: string;
                    quoteAsset?: string;
                    startTime?: Date;
                    endTime?: Date;
                }): _178.GetArithmeticTwapRequest;
            };
            GetArithmeticTwapResponse: {
                encode(message: _178.GetArithmeticTwapResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _178.GetArithmeticTwapResponse;
                fromJSON(object: any): _178.GetArithmeticTwapResponse;
                toJSON(message: _178.GetArithmeticTwapResponse): unknown;
                fromPartial(object: {
                    arithmeticTwap?: string;
                }): _178.GetArithmeticTwapResponse;
            };
            GetArithmeticTwapToNowRequest: {
                encode(message: _178.GetArithmeticTwapToNowRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _178.GetArithmeticTwapToNowRequest;
                fromJSON(object: any): _178.GetArithmeticTwapToNowRequest;
                toJSON(message: _178.GetArithmeticTwapToNowRequest): unknown;
                fromPartial(object: {
                    poolId?: any;
                    baseAsset?: string;
                    quoteAsset?: string;
                    startTime?: Date;
                }): _178.GetArithmeticTwapToNowRequest;
            };
            GetArithmeticTwapToNowResponse: {
                encode(message: _178.GetArithmeticTwapToNowResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _178.GetArithmeticTwapToNowResponse;
                fromJSON(object: any): _178.GetArithmeticTwapToNowResponse;
                toJSON(message: _178.GetArithmeticTwapToNowResponse): unknown;
                fromPartial(object: {
                    arithmeticTwap?: string;
                }): _178.GetArithmeticTwapToNowResponse;
            };
            ParamsRequest: {
                encode(_: _178.ParamsRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _178.ParamsRequest;
                fromJSON(_: any): _178.ParamsRequest;
                toJSON(_: _178.ParamsRequest): unknown;
                fromPartial(_: {}): _178.ParamsRequest;
            };
            ParamsResponse: {
                encode(message: _178.ParamsResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _178.ParamsResponse;
                fromJSON(object: any): _178.ParamsResponse;
                toJSON(message: _178.ParamsResponse): unknown;
                fromPartial(object: {
                    params?: {
                        pruneEpochIdentifier?: string;
                        recordHistoryKeepPeriod?: {
                            seconds?: any;
                            nanos?: number;
                        };
                    };
                }): _178.ParamsResponse;
            };
            Params: {
                encode(message: _177.Params, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _177.Params;
                fromJSON(object: any): _177.Params;
                toJSON(message: _177.Params): unknown;
                fromPartial(object: {
                    pruneEpochIdentifier?: string;
                    recordHistoryKeepPeriod?: {
                        seconds?: any;
                        nanos?: number;
                    };
                }): _177.Params;
            };
            GenesisState: {
                encode(message: _177.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _177.GenesisState;
                fromJSON(object: any): _177.GenesisState;
                toJSON(message: _177.GenesisState): unknown;
                fromPartial(object: {
                    twaps?: {
                        poolId?: any;
                        asset0Denom?: string;
                        asset1Denom?: string;
                        height?: any;
                        time?: Date;
                        p0LastSpotPrice?: string;
                        p1LastSpotPrice?: string;
                        p0ArithmeticTwapAccumulator?: string;
                        p1ArithmeticTwapAccumulator?: string;
                        lastErrorTime?: Date;
                    }[];
                    params?: {
                        pruneEpochIdentifier?: string;
                        recordHistoryKeepPeriod?: {
                            seconds?: any;
                            nanos?: number;
                        };
                    };
                }): _177.GenesisState;
            };
        };
    }
    namespace txfees {
        const v1beta1: {
            QueryFeeTokensRequest: {
                encode(_: _183.QueryFeeTokensRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _183.QueryFeeTokensRequest;
                fromJSON(_: any): _183.QueryFeeTokensRequest;
                toJSON(_: _183.QueryFeeTokensRequest): unknown;
                fromPartial(_: {}): _183.QueryFeeTokensRequest;
            };
            QueryFeeTokensResponse: {
                encode(message: _183.QueryFeeTokensResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _183.QueryFeeTokensResponse;
                fromJSON(object: any): _183.QueryFeeTokensResponse;
                toJSON(message: _183.QueryFeeTokensResponse): unknown;
                fromPartial(object: {
                    feeTokens?: {
                        denom?: string;
                        poolID?: any;
                    }[];
                }): _183.QueryFeeTokensResponse;
            };
            QueryDenomSpotPriceRequest: {
                encode(message: _183.QueryDenomSpotPriceRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _183.QueryDenomSpotPriceRequest;
                fromJSON(object: any): _183.QueryDenomSpotPriceRequest;
                toJSON(message: _183.QueryDenomSpotPriceRequest): unknown;
                fromPartial(object: {
                    denom?: string;
                }): _183.QueryDenomSpotPriceRequest;
            };
            QueryDenomSpotPriceResponse: {
                encode(message: _183.QueryDenomSpotPriceResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _183.QueryDenomSpotPriceResponse;
                fromJSON(object: any): _183.QueryDenomSpotPriceResponse;
                toJSON(message: _183.QueryDenomSpotPriceResponse): unknown;
                fromPartial(object: {
                    poolID?: any;
                    spotPrice?: string;
                }): _183.QueryDenomSpotPriceResponse;
            };
            QueryDenomPoolIdRequest: {
                encode(message: _183.QueryDenomPoolIdRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _183.QueryDenomPoolIdRequest;
                fromJSON(object: any): _183.QueryDenomPoolIdRequest;
                toJSON(message: _183.QueryDenomPoolIdRequest): unknown;
                fromPartial(object: {
                    denom?: string;
                }): _183.QueryDenomPoolIdRequest;
            };
            QueryDenomPoolIdResponse: {
                encode(message: _183.QueryDenomPoolIdResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _183.QueryDenomPoolIdResponse;
                fromJSON(object: any): _183.QueryDenomPoolIdResponse;
                toJSON(message: _183.QueryDenomPoolIdResponse): unknown;
                fromPartial(object: {
                    poolID?: any;
                }): _183.QueryDenomPoolIdResponse;
            };
            QueryBaseDenomRequest: {
                encode(_: _183.QueryBaseDenomRequest, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _183.QueryBaseDenomRequest;
                fromJSON(_: any): _183.QueryBaseDenomRequest;
                toJSON(_: _183.QueryBaseDenomRequest): unknown;
                fromPartial(_: {}): _183.QueryBaseDenomRequest;
            };
            QueryBaseDenomResponse: {
                encode(message: _183.QueryBaseDenomResponse, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _183.QueryBaseDenomResponse;
                fromJSON(object: any): _183.QueryBaseDenomResponse;
                toJSON(message: _183.QueryBaseDenomResponse): unknown;
                fromPartial(object: {
                    baseDenom?: string;
                }): _183.QueryBaseDenomResponse;
            };
            UpdateFeeTokenProposal: {
                encode(message: _182.UpdateFeeTokenProposal, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _182.UpdateFeeTokenProposal;
                fromJSON(object: any): _182.UpdateFeeTokenProposal;
                toJSON(message: _182.UpdateFeeTokenProposal): unknown;
                fromPartial(object: {
                    title?: string;
                    description?: string;
                    feetoken?: {
                        denom?: string;
                        poolID?: any;
                    };
                }): _182.UpdateFeeTokenProposal;
            };
            GenesisState: {
                encode(message: _181.GenesisState, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _181.GenesisState;
                fromJSON(object: any): _181.GenesisState;
                toJSON(message: _181.GenesisState): unknown;
                fromPartial(object: {
                    basedenom?: string;
                    feetokens?: {
                        denom?: string;
                        poolID?: any;
                    }[];
                }): _181.GenesisState;
            };
            FeeToken: {
                encode(message: _180.FeeToken, writer?: import("protobufjs").Writer): import("protobufjs").Writer;
                decode(input: Uint8Array | import("protobufjs").Reader, length?: number): _180.FeeToken;
                fromJSON(object: any): _180.FeeToken;
                toJSON(message: _180.FeeToken): unknown;
                fromPartial(object: {
                    denom?: string;
                    poolID?: any;
                }): _180.FeeToken;
            };
        };
    }
}
