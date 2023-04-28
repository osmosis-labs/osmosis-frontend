import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import { Long } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** TokenPairArbRoutes tracks all of the hot routes for a given pair of tokens */
export interface TokenPairArbRoutes {
  /** Stores all of the possible hot paths for a given pair of tokens */
  arbRoutes: Route[];
  /** Token denomination of the first asset */
  tokenIn: string;
  /** Token denomination of the second asset */
  tokenOut: string;
}
export interface TokenPairArbRoutesProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.TokenPairArbRoutes";
  value: Uint8Array;
}
/** TokenPairArbRoutes tracks all of the hot routes for a given pair of tokens */
export interface TokenPairArbRoutesAmino {
  /** Stores all of the possible hot paths for a given pair of tokens */
  arb_routes: RouteAmino[];
  /** Token denomination of the first asset */
  token_in: string;
  /** Token denomination of the second asset */
  token_out: string;
}
export interface TokenPairArbRoutesAminoMsg {
  type: "osmosis/protorev/token-pair-arb-routes";
  value: TokenPairArbRoutesAmino;
}
/** TokenPairArbRoutes tracks all of the hot routes for a given pair of tokens */
export interface TokenPairArbRoutesSDKType {
  arb_routes: RouteSDKType[];
  token_in: string;
  token_out: string;
}
/** Route is a hot route for a given pair of tokens */
export interface Route {
  /**
   * The pool IDs that are travered in the directed cyclic graph (traversed left
   * -> right)
   */
  trades: Trade[];
  /**
   * The step size that will be used to find the optimal swap amount in the
   * binary search
   */
  stepSize: string;
}
export interface RouteProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.Route";
  value: Uint8Array;
}
/** Route is a hot route for a given pair of tokens */
export interface RouteAmino {
  /**
   * The pool IDs that are travered in the directed cyclic graph (traversed left
   * -> right)
   */
  trades: TradeAmino[];
  /**
   * The step size that will be used to find the optimal swap amount in the
   * binary search
   */
  step_size: string;
}
export interface RouteAminoMsg {
  type: "osmosis/protorev/route";
  value: RouteAmino;
}
/** Route is a hot route for a given pair of tokens */
export interface RouteSDKType {
  trades: TradeSDKType[];
  step_size: string;
}
/** Trade is a single trade in a route */
export interface Trade {
  /** The pool id of the pool that is traded on */
  pool: Long;
  /** The denom of the token that is traded */
  tokenIn: string;
  /** The denom of the token that is received */
  tokenOut: string;
}
export interface TradeProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.Trade";
  value: Uint8Array;
}
/** Trade is a single trade in a route */
export interface TradeAmino {
  /** The pool id of the pool that is traded on */
  pool: string;
  /** The denom of the token that is traded */
  token_in: string;
  /** The denom of the token that is received */
  token_out: string;
}
export interface TradeAminoMsg {
  type: "osmosis/protorev/trade";
  value: TradeAmino;
}
/** Trade is a single trade in a route */
export interface TradeSDKType {
  pool: Long;
  token_in: string;
  token_out: string;
}
/**
 * RouteStatistics contains the number of trades the module has executed after a
 * swap on a given route and the profits from the trades
 */
export interface RouteStatistics {
  /** profits is the total profit from all trades on this route */
  profits: Coin[];
  /**
   * number_of_trades is the number of trades the module has executed using this
   * route
   */
  numberOfTrades: string;
  /** route is the route that was used (pool ids along the arbitrage route) */
  route: Long[];
}
export interface RouteStatisticsProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.RouteStatistics";
  value: Uint8Array;
}
/**
 * RouteStatistics contains the number of trades the module has executed after a
 * swap on a given route and the profits from the trades
 */
export interface RouteStatisticsAmino {
  /** profits is the total profit from all trades on this route */
  profits: CoinAmino[];
  /**
   * number_of_trades is the number of trades the module has executed using this
   * route
   */
  number_of_trades: string;
  /** route is the route that was used (pool ids along the arbitrage route) */
  route: string[];
}
export interface RouteStatisticsAminoMsg {
  type: "osmosis/protorev/route-statistics";
  value: RouteStatisticsAmino;
}
/**
 * RouteStatistics contains the number of trades the module has executed after a
 * swap on a given route and the profits from the trades
 */
export interface RouteStatisticsSDKType {
  profits: CoinSDKType[];
  number_of_trades: string;
  route: Long[];
}
/**
 * PoolWeights contains the weights of all of the different pool types. This
 * distinction is made and necessary because the execution time ranges
 * significantly between the different pool types. Each weight roughly
 * corresponds to the amount of time (in ms) it takes to execute a swap on that
 * pool type.
 */
export interface PoolWeights {
  /** The weight of a stableswap pool */
  stableWeight: Long;
  /** The weight of a balancer pool */
  balancerWeight: Long;
  /** The weight of a concentrated pool */
  concentratedWeight: Long;
}
export interface PoolWeightsProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.PoolWeights";
  value: Uint8Array;
}
/**
 * PoolWeights contains the weights of all of the different pool types. This
 * distinction is made and necessary because the execution time ranges
 * significantly between the different pool types. Each weight roughly
 * corresponds to the amount of time (in ms) it takes to execute a swap on that
 * pool type.
 */
export interface PoolWeightsAmino {
  /** The weight of a stableswap pool */
  stable_weight: string;
  /** The weight of a balancer pool */
  balancer_weight: string;
  /** The weight of a concentrated pool */
  concentrated_weight: string;
}
export interface PoolWeightsAminoMsg {
  type: "osmosis/protorev/pool-weights";
  value: PoolWeightsAmino;
}
/**
 * PoolWeights contains the weights of all of the different pool types. This
 * distinction is made and necessary because the execution time ranges
 * significantly between the different pool types. Each weight roughly
 * corresponds to the amount of time (in ms) it takes to execute a swap on that
 * pool type.
 */
export interface PoolWeightsSDKType {
  stable_weight: Long;
  balancer_weight: Long;
  concentrated_weight: Long;
}
/**
 * BaseDenom represents a single base denom that the module uses for its
 * arbitrage trades. It contains the denom name alongside the step size of the
 * binary search that is used to find the optimal swap amount
 */
export interface BaseDenom {
  /** The denom i.e. name of the base denom (ex. uosmo) */
  denom: string;
  /**
   * The step size of the binary search that is used to find the optimal swap
   * amount
   */
  stepSize: string;
}
export interface BaseDenomProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.BaseDenom";
  value: Uint8Array;
}
/**
 * BaseDenom represents a single base denom that the module uses for its
 * arbitrage trades. It contains the denom name alongside the step size of the
 * binary search that is used to find the optimal swap amount
 */
export interface BaseDenomAmino {
  /** The denom i.e. name of the base denom (ex. uosmo) */
  denom: string;
  /**
   * The step size of the binary search that is used to find the optimal swap
   * amount
   */
  step_size: string;
}
export interface BaseDenomAminoMsg {
  type: "osmosis/protorev/base-denom";
  value: BaseDenomAmino;
}
/**
 * BaseDenom represents a single base denom that the module uses for its
 * arbitrage trades. It contains the denom name alongside the step size of the
 * binary search that is used to find the optimal swap amount
 */
export interface BaseDenomSDKType {
  denom: string;
  step_size: string;
}
function createBaseTokenPairArbRoutes(): TokenPairArbRoutes {
  return {
    arbRoutes: [],
    tokenIn: "",
    tokenOut: "",
  };
}
export const TokenPairArbRoutes = {
  typeUrl: "/osmosis.protorev.v1beta1.TokenPairArbRoutes",
  encode(
    message: TokenPairArbRoutes,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.arbRoutes) {
      Route.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.tokenIn !== "") {
      writer.uint32(18).string(message.tokenIn);
    }
    if (message.tokenOut !== "") {
      writer.uint32(26).string(message.tokenOut);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): TokenPairArbRoutes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTokenPairArbRoutes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.arbRoutes.push(Route.decode(reader, reader.uint32()));
          break;
        case 2:
          message.tokenIn = reader.string();
          break;
        case 3:
          message.tokenOut = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TokenPairArbRoutes>): TokenPairArbRoutes {
    const message = createBaseTokenPairArbRoutes();
    message.arbRoutes =
      object.arbRoutes?.map((e) => Route.fromPartial(e)) || [];
    message.tokenIn = object.tokenIn ?? "";
    message.tokenOut = object.tokenOut ?? "";
    return message;
  },
  fromAmino(object: TokenPairArbRoutesAmino): TokenPairArbRoutes {
    return {
      arbRoutes: Array.isArray(object?.arb_routes)
        ? object.arb_routes.map((e: any) => Route.fromAmino(e))
        : [],
      tokenIn: object.token_in,
      tokenOut: object.token_out,
    };
  },
  toAmino(message: TokenPairArbRoutes): TokenPairArbRoutesAmino {
    const obj: any = {};
    if (message.arbRoutes) {
      obj.arb_routes = message.arbRoutes.map((e) =>
        e ? Route.toAmino(e) : undefined
      );
    } else {
      obj.arb_routes = [];
    }
    obj.token_in = message.tokenIn;
    obj.token_out = message.tokenOut;
    return obj;
  },
  fromAminoMsg(object: TokenPairArbRoutesAminoMsg): TokenPairArbRoutes {
    return TokenPairArbRoutes.fromAmino(object.value);
  },
  toAminoMsg(message: TokenPairArbRoutes): TokenPairArbRoutesAminoMsg {
    return {
      type: "osmosis/protorev/token-pair-arb-routes",
      value: TokenPairArbRoutes.toAmino(message),
    };
  },
  fromProtoMsg(message: TokenPairArbRoutesProtoMsg): TokenPairArbRoutes {
    return TokenPairArbRoutes.decode(message.value);
  },
  toProto(message: TokenPairArbRoutes): Uint8Array {
    return TokenPairArbRoutes.encode(message).finish();
  },
  toProtoMsg(message: TokenPairArbRoutes): TokenPairArbRoutesProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.TokenPairArbRoutes",
      value: TokenPairArbRoutes.encode(message).finish(),
    };
  },
};
function createBaseRoute(): Route {
  return {
    trades: [],
    stepSize: "",
  };
}
export const Route = {
  typeUrl: "/osmosis.protorev.v1beta1.Route",
  encode(message: Route, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.trades) {
      Trade.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.stepSize !== "") {
      writer.uint32(18).string(message.stepSize);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Route {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRoute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.trades.push(Trade.decode(reader, reader.uint32()));
          break;
        case 2:
          message.stepSize = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Route>): Route {
    const message = createBaseRoute();
    message.trades = object.trades?.map((e) => Trade.fromPartial(e)) || [];
    message.stepSize = object.stepSize ?? "";
    return message;
  },
  fromAmino(object: RouteAmino): Route {
    return {
      trades: Array.isArray(object?.trades)
        ? object.trades.map((e: any) => Trade.fromAmino(e))
        : [],
      stepSize: object.step_size,
    };
  },
  toAmino(message: Route): RouteAmino {
    const obj: any = {};
    if (message.trades) {
      obj.trades = message.trades.map((e) =>
        e ? Trade.toAmino(e) : undefined
      );
    } else {
      obj.trades = [];
    }
    obj.step_size = message.stepSize;
    return obj;
  },
  fromAminoMsg(object: RouteAminoMsg): Route {
    return Route.fromAmino(object.value);
  },
  toAminoMsg(message: Route): RouteAminoMsg {
    return {
      type: "osmosis/protorev/route",
      value: Route.toAmino(message),
    };
  },
  fromProtoMsg(message: RouteProtoMsg): Route {
    return Route.decode(message.value);
  },
  toProto(message: Route): Uint8Array {
    return Route.encode(message).finish();
  },
  toProtoMsg(message: Route): RouteProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.Route",
      value: Route.encode(message).finish(),
    };
  },
};
function createBaseTrade(): Trade {
  return {
    pool: Long.UZERO,
    tokenIn: "",
    tokenOut: "",
  };
}
export const Trade = {
  typeUrl: "/osmosis.protorev.v1beta1.Trade",
  encode(message: Trade, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.pool.isZero()) {
      writer.uint32(8).uint64(message.pool);
    }
    if (message.tokenIn !== "") {
      writer.uint32(18).string(message.tokenIn);
    }
    if (message.tokenOut !== "") {
      writer.uint32(26).string(message.tokenOut);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Trade {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrade();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pool = reader.uint64() as Long;
          break;
        case 2:
          message.tokenIn = reader.string();
          break;
        case 3:
          message.tokenOut = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Trade>): Trade {
    const message = createBaseTrade();
    message.pool =
      object.pool !== undefined && object.pool !== null
        ? Long.fromValue(object.pool)
        : Long.UZERO;
    message.tokenIn = object.tokenIn ?? "";
    message.tokenOut = object.tokenOut ?? "";
    return message;
  },
  fromAmino(object: TradeAmino): Trade {
    return {
      pool: Long.fromString(object.pool),
      tokenIn: object.token_in,
      tokenOut: object.token_out,
    };
  },
  toAmino(message: Trade): TradeAmino {
    const obj: any = {};
    obj.pool = message.pool ? message.pool.toString() : undefined;
    obj.token_in = message.tokenIn;
    obj.token_out = message.tokenOut;
    return obj;
  },
  fromAminoMsg(object: TradeAminoMsg): Trade {
    return Trade.fromAmino(object.value);
  },
  toAminoMsg(message: Trade): TradeAminoMsg {
    return {
      type: "osmosis/protorev/trade",
      value: Trade.toAmino(message),
    };
  },
  fromProtoMsg(message: TradeProtoMsg): Trade {
    return Trade.decode(message.value);
  },
  toProto(message: Trade): Uint8Array {
    return Trade.encode(message).finish();
  },
  toProtoMsg(message: Trade): TradeProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.Trade",
      value: Trade.encode(message).finish(),
    };
  },
};
function createBaseRouteStatistics(): RouteStatistics {
  return {
    profits: [],
    numberOfTrades: "",
    route: [],
  };
}
export const RouteStatistics = {
  typeUrl: "/osmosis.protorev.v1beta1.RouteStatistics",
  encode(
    message: RouteStatistics,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.profits) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.numberOfTrades !== "") {
      writer.uint32(18).string(message.numberOfTrades);
    }
    writer.uint32(26).fork();
    for (const v of message.route) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): RouteStatistics {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRouteStatistics();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.profits.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.numberOfTrades = reader.string();
          break;
        case 3:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.route.push(reader.uint64() as Long);
            }
          } else {
            message.route.push(reader.uint64() as Long);
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<RouteStatistics>): RouteStatistics {
    const message = createBaseRouteStatistics();
    message.profits = object.profits?.map((e) => Coin.fromPartial(e)) || [];
    message.numberOfTrades = object.numberOfTrades ?? "";
    message.route = object.route?.map((e) => Long.fromValue(e)) || [];
    return message;
  },
  fromAmino(object: RouteStatisticsAmino): RouteStatistics {
    return {
      profits: Array.isArray(object?.profits)
        ? object.profits.map((e: any) => Coin.fromAmino(e))
        : [],
      numberOfTrades: object.number_of_trades,
      route: Array.isArray(object?.route)
        ? object.route.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: RouteStatistics): RouteStatisticsAmino {
    const obj: any = {};
    if (message.profits) {
      obj.profits = message.profits.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.profits = [];
    }
    obj.number_of_trades = message.numberOfTrades;
    if (message.route) {
      obj.route = message.route.map((e) => e);
    } else {
      obj.route = [];
    }
    return obj;
  },
  fromAminoMsg(object: RouteStatisticsAminoMsg): RouteStatistics {
    return RouteStatistics.fromAmino(object.value);
  },
  toAminoMsg(message: RouteStatistics): RouteStatisticsAminoMsg {
    return {
      type: "osmosis/protorev/route-statistics",
      value: RouteStatistics.toAmino(message),
    };
  },
  fromProtoMsg(message: RouteStatisticsProtoMsg): RouteStatistics {
    return RouteStatistics.decode(message.value);
  },
  toProto(message: RouteStatistics): Uint8Array {
    return RouteStatistics.encode(message).finish();
  },
  toProtoMsg(message: RouteStatistics): RouteStatisticsProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.RouteStatistics",
      value: RouteStatistics.encode(message).finish(),
    };
  },
};
function createBasePoolWeights(): PoolWeights {
  return {
    stableWeight: Long.UZERO,
    balancerWeight: Long.UZERO,
    concentratedWeight: Long.UZERO,
  };
}
export const PoolWeights = {
  typeUrl: "/osmosis.protorev.v1beta1.PoolWeights",
  encode(
    message: PoolWeights,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.stableWeight.isZero()) {
      writer.uint32(8).uint64(message.stableWeight);
    }
    if (!message.balancerWeight.isZero()) {
      writer.uint32(16).uint64(message.balancerWeight);
    }
    if (!message.concentratedWeight.isZero()) {
      writer.uint32(24).uint64(message.concentratedWeight);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PoolWeights {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolWeights();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stableWeight = reader.uint64() as Long;
          break;
        case 2:
          message.balancerWeight = reader.uint64() as Long;
          break;
        case 3:
          message.concentratedWeight = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PoolWeights>): PoolWeights {
    const message = createBasePoolWeights();
    message.stableWeight =
      object.stableWeight !== undefined && object.stableWeight !== null
        ? Long.fromValue(object.stableWeight)
        : Long.UZERO;
    message.balancerWeight =
      object.balancerWeight !== undefined && object.balancerWeight !== null
        ? Long.fromValue(object.balancerWeight)
        : Long.UZERO;
    message.concentratedWeight =
      object.concentratedWeight !== undefined &&
      object.concentratedWeight !== null
        ? Long.fromValue(object.concentratedWeight)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: PoolWeightsAmino): PoolWeights {
    return {
      stableWeight: Long.fromString(object.stable_weight),
      balancerWeight: Long.fromString(object.balancer_weight),
      concentratedWeight: Long.fromString(object.concentrated_weight),
    };
  },
  toAmino(message: PoolWeights): PoolWeightsAmino {
    const obj: any = {};
    obj.stable_weight = message.stableWeight
      ? message.stableWeight.toString()
      : undefined;
    obj.balancer_weight = message.balancerWeight
      ? message.balancerWeight.toString()
      : undefined;
    obj.concentrated_weight = message.concentratedWeight
      ? message.concentratedWeight.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: PoolWeightsAminoMsg): PoolWeights {
    return PoolWeights.fromAmino(object.value);
  },
  toAminoMsg(message: PoolWeights): PoolWeightsAminoMsg {
    return {
      type: "osmosis/protorev/pool-weights",
      value: PoolWeights.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolWeightsProtoMsg): PoolWeights {
    return PoolWeights.decode(message.value);
  },
  toProto(message: PoolWeights): Uint8Array {
    return PoolWeights.encode(message).finish();
  },
  toProtoMsg(message: PoolWeights): PoolWeightsProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.PoolWeights",
      value: PoolWeights.encode(message).finish(),
    };
  },
};
function createBaseBaseDenom(): BaseDenom {
  return {
    denom: "",
    stepSize: "",
  };
}
export const BaseDenom = {
  typeUrl: "/osmosis.protorev.v1beta1.BaseDenom",
  encode(
    message: BaseDenom,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.stepSize !== "") {
      writer.uint32(18).string(message.stepSize);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): BaseDenom {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBaseDenom();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        case 2:
          message.stepSize = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BaseDenom>): BaseDenom {
    const message = createBaseBaseDenom();
    message.denom = object.denom ?? "";
    message.stepSize = object.stepSize ?? "";
    return message;
  },
  fromAmino(object: BaseDenomAmino): BaseDenom {
    return {
      denom: object.denom,
      stepSize: object.step_size,
    };
  },
  toAmino(message: BaseDenom): BaseDenomAmino {
    const obj: any = {};
    obj.denom = message.denom;
    obj.step_size = message.stepSize;
    return obj;
  },
  fromAminoMsg(object: BaseDenomAminoMsg): BaseDenom {
    return BaseDenom.fromAmino(object.value);
  },
  toAminoMsg(message: BaseDenom): BaseDenomAminoMsg {
    return {
      type: "osmosis/protorev/base-denom",
      value: BaseDenom.toAmino(message),
    };
  },
  fromProtoMsg(message: BaseDenomProtoMsg): BaseDenom {
    return BaseDenom.decode(message.value);
  },
  toProto(message: BaseDenom): Uint8Array {
    return BaseDenom.encode(message).finish();
  },
  toProtoMsg(message: BaseDenom): BaseDenomProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.BaseDenom",
      value: BaseDenom.encode(message).finish(),
    };
  },
};
