//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
/** ===================== MsgCreatePosition */
export interface MsgCreatePosition {
  poolId: bigint;
  sender: string;
  lowerTick: bigint;
  upperTick: bigint;
  /**
   * tokens_provided is the amount of tokens provided for the position.
   * It must at a minimum be of length 1 (for a single sided position)
   * and at a maximum be of length 2 (for a position that straddles the current
   * tick).
   */
  tokensProvided: Coin[];
  tokenMinAmount0: string;
  tokenMinAmount1: string;
}
export interface MsgCreatePositionProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition";
  value: Uint8Array;
}
/** ===================== MsgCreatePosition */
export interface MsgCreatePositionAmino {
  pool_id?: string;
  sender?: string;
  lower_tick?: string;
  upper_tick?: string;
  /**
   * tokens_provided is the amount of tokens provided for the position.
   * It must at a minimum be of length 1 (for a single sided position)
   * and at a maximum be of length 2 (for a position that straddles the current
   * tick).
   */
  tokens_provided?: CoinAmino[];
  token_min_amount0?: string;
  token_min_amount1?: string;
}
export interface MsgCreatePositionAminoMsg {
  type: "osmosis/cl-create-position";
  value: MsgCreatePositionAmino;
}
/** ===================== MsgCreatePosition */
export interface MsgCreatePositionSDKType {
  pool_id: bigint;
  sender: string;
  lower_tick: bigint;
  upper_tick: bigint;
  tokens_provided: CoinSDKType[];
  token_min_amount0: string;
  token_min_amount1: string;
}
export interface MsgCreatePositionResponse {
  positionId: bigint;
  amount0: string;
  amount1: string;
  liquidityCreated: string;
  /**
   * the lower and upper tick are in the response because there are
   * instances in which multiple ticks represent the same price, so
   * we may move their provided tick to the canonical tick that represents
   * the same price.
   */
  lowerTick: bigint;
  upperTick: bigint;
}
export interface MsgCreatePositionResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse";
  value: Uint8Array;
}
export interface MsgCreatePositionResponseAmino {
  position_id?: string;
  amount0?: string;
  amount1?: string;
  liquidity_created?: string;
  /**
   * the lower and upper tick are in the response because there are
   * instances in which multiple ticks represent the same price, so
   * we may move their provided tick to the canonical tick that represents
   * the same price.
   */
  lower_tick?: string;
  upper_tick?: string;
}
export interface MsgCreatePositionResponseAminoMsg {
  type: "osmosis/concentratedliquidity/create-position-response";
  value: MsgCreatePositionResponseAmino;
}
export interface MsgCreatePositionResponseSDKType {
  position_id: bigint;
  amount0: string;
  amount1: string;
  liquidity_created: string;
  lower_tick: bigint;
  upper_tick: bigint;
}
/** ===================== MsgAddToPosition */
export interface MsgAddToPosition {
  positionId: bigint;
  sender: string;
  /** amount0 represents the amount of token0 willing to put in. */
  amount0: string;
  /** amount1 represents the amount of token1 willing to put in. */
  amount1: string;
  /**
   * token_min_amount0 represents the minimum amount of token0 desired from the
   * new position being created. Note that this field indicates the min amount0
   * corresponding to the liquidity that is being added, not the total
   * liquidity of the position.
   */
  tokenMinAmount0: string;
  /**
   * token_min_amount1 represents the minimum amount of token1 desired from the
   * new position being created. Note that this field indicates the min amount1
   * corresponding to the liquidity that is being added, not the total
   * liquidity of the position.
   */
  tokenMinAmount1: string;
}
export interface MsgAddToPositionProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition";
  value: Uint8Array;
}
/** ===================== MsgAddToPosition */
export interface MsgAddToPositionAmino {
  position_id?: string;
  sender?: string;
  /** amount0 represents the amount of token0 willing to put in. */
  amount0?: string;
  /** amount1 represents the amount of token1 willing to put in. */
  amount1?: string;
  /**
   * token_min_amount0 represents the minimum amount of token0 desired from the
   * new position being created. Note that this field indicates the min amount0
   * corresponding to the liquidity that is being added, not the total
   * liquidity of the position.
   */
  token_min_amount0?: string;
  /**
   * token_min_amount1 represents the minimum amount of token1 desired from the
   * new position being created. Note that this field indicates the min amount1
   * corresponding to the liquidity that is being added, not the total
   * liquidity of the position.
   */
  token_min_amount1?: string;
}
export interface MsgAddToPositionAminoMsg {
  type: "osmosis/cl-add-to-position";
  value: MsgAddToPositionAmino;
}
/** ===================== MsgAddToPosition */
export interface MsgAddToPositionSDKType {
  position_id: bigint;
  sender: string;
  amount0: string;
  amount1: string;
  token_min_amount0: string;
  token_min_amount1: string;
}
export interface MsgAddToPositionResponse {
  positionId: bigint;
  amount0: string;
  amount1: string;
}
export interface MsgAddToPositionResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPositionResponse";
  value: Uint8Array;
}
export interface MsgAddToPositionResponseAmino {
  position_id?: string;
  amount0?: string;
  amount1?: string;
}
export interface MsgAddToPositionResponseAminoMsg {
  type: "osmosis/concentratedliquidity/add-to-position-response";
  value: MsgAddToPositionResponseAmino;
}
export interface MsgAddToPositionResponseSDKType {
  position_id: bigint;
  amount0: string;
  amount1: string;
}
/** ===================== MsgWithdrawPosition */
export interface MsgWithdrawPosition {
  positionId: bigint;
  sender: string;
  liquidityAmount: string;
}
export interface MsgWithdrawPositionProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition";
  value: Uint8Array;
}
/** ===================== MsgWithdrawPosition */
export interface MsgWithdrawPositionAmino {
  position_id?: string;
  sender?: string;
  liquidity_amount?: string;
}
export interface MsgWithdrawPositionAminoMsg {
  type: "osmosis/cl-withdraw-position";
  value: MsgWithdrawPositionAmino;
}
/** ===================== MsgWithdrawPosition */
export interface MsgWithdrawPositionSDKType {
  position_id: bigint;
  sender: string;
  liquidity_amount: string;
}
export interface MsgWithdrawPositionResponse {
  amount0: string;
  amount1: string;
}
export interface MsgWithdrawPositionResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPositionResponse";
  value: Uint8Array;
}
export interface MsgWithdrawPositionResponseAmino {
  amount0?: string;
  amount1?: string;
}
export interface MsgWithdrawPositionResponseAminoMsg {
  type: "osmosis/concentratedliquidity/withdraw-position-response";
  value: MsgWithdrawPositionResponseAmino;
}
export interface MsgWithdrawPositionResponseSDKType {
  amount0: string;
  amount1: string;
}
/** ===================== MsgCollectSpreadRewards */
export interface MsgCollectSpreadRewards {
  positionIds: bigint[];
  sender: string;
}
export interface MsgCollectSpreadRewardsProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards";
  value: Uint8Array;
}
/** ===================== MsgCollectSpreadRewards */
export interface MsgCollectSpreadRewardsAmino {
  position_ids?: string[];
  sender?: string;
}
export interface MsgCollectSpreadRewardsAminoMsg {
  type: "osmosis/cl-col-sp-rewards";
  value: MsgCollectSpreadRewardsAmino;
}
/** ===================== MsgCollectSpreadRewards */
export interface MsgCollectSpreadRewardsSDKType {
  position_ids: bigint[];
  sender: string;
}
export interface MsgCollectSpreadRewardsResponse {
  collectedSpreadRewards: Coin[];
}
export interface MsgCollectSpreadRewardsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewardsResponse";
  value: Uint8Array;
}
export interface MsgCollectSpreadRewardsResponseAmino {
  collected_spread_rewards?: CoinAmino[];
}
export interface MsgCollectSpreadRewardsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/collect-spread-rewards-response";
  value: MsgCollectSpreadRewardsResponseAmino;
}
export interface MsgCollectSpreadRewardsResponseSDKType {
  collected_spread_rewards: CoinSDKType[];
}
/** ===================== MsgCollectIncentives */
export interface MsgCollectIncentives {
  positionIds: bigint[];
  sender: string;
}
export interface MsgCollectIncentivesProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives";
  value: Uint8Array;
}
/** ===================== MsgCollectIncentives */
export interface MsgCollectIncentivesAmino {
  position_ids?: string[];
  sender?: string;
}
export interface MsgCollectIncentivesAminoMsg {
  type: "osmosis/cl-collect-incentives";
  value: MsgCollectIncentivesAmino;
}
/** ===================== MsgCollectIncentives */
export interface MsgCollectIncentivesSDKType {
  position_ids: bigint[];
  sender: string;
}
export interface MsgCollectIncentivesResponse {
  collectedIncentives: Coin[];
  forfeitedIncentives: Coin[];
}
export interface MsgCollectIncentivesResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse";
  value: Uint8Array;
}
export interface MsgCollectIncentivesResponseAmino {
  collected_incentives?: CoinAmino[];
  forfeited_incentives?: CoinAmino[];
}
export interface MsgCollectIncentivesResponseAminoMsg {
  type: "osmosis/concentratedliquidity/collect-incentives-response";
  value: MsgCollectIncentivesResponseAmino;
}
export interface MsgCollectIncentivesResponseSDKType {
  collected_incentives: CoinSDKType[];
  forfeited_incentives: CoinSDKType[];
}
/** ===================== MsgFungifyChargedPositions */
export interface MsgFungifyChargedPositions {
  positionIds: bigint[];
  sender: string;
}
export interface MsgFungifyChargedPositionsProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions";
  value: Uint8Array;
}
/** ===================== MsgFungifyChargedPositions */
export interface MsgFungifyChargedPositionsAmino {
  position_ids?: string[];
  sender?: string;
}
export interface MsgFungifyChargedPositionsAminoMsg {
  type: "osmosis/cl-fungify-charged-positions";
  value: MsgFungifyChargedPositionsAmino;
}
/** ===================== MsgFungifyChargedPositions */
export interface MsgFungifyChargedPositionsSDKType {
  position_ids: bigint[];
  sender: string;
}
export interface MsgFungifyChargedPositionsResponse {
  newPositionId: bigint;
}
export interface MsgFungifyChargedPositionsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositionsResponse";
  value: Uint8Array;
}
export interface MsgFungifyChargedPositionsResponseAmino {
  new_position_id?: string;
}
export interface MsgFungifyChargedPositionsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/fungify-charged-positions-response";
  value: MsgFungifyChargedPositionsResponseAmino;
}
export interface MsgFungifyChargedPositionsResponseSDKType {
  new_position_id: bigint;
}
/** ===================== MsgTransferPositions */
export interface MsgTransferPositions {
  positionIds: bigint[];
  sender: string;
  newOwner: string;
}
export interface MsgTransferPositionsProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgTransferPositions";
  value: Uint8Array;
}
/** ===================== MsgTransferPositions */
export interface MsgTransferPositionsAmino {
  position_ids?: string[];
  sender?: string;
  new_owner?: string;
}
export interface MsgTransferPositionsAminoMsg {
  type: "osmosis/cl-transfer-positions";
  value: MsgTransferPositionsAmino;
}
/** ===================== MsgTransferPositions */
export interface MsgTransferPositionsSDKType {
  position_ids: bigint[];
  sender: string;
  new_owner: string;
}
export interface MsgTransferPositionsResponse {}
export interface MsgTransferPositionsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgTransferPositionsResponse";
  value: Uint8Array;
}
export interface MsgTransferPositionsResponseAmino {}
export interface MsgTransferPositionsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/transfer-positions-response";
  value: MsgTransferPositionsResponseAmino;
}
export interface MsgTransferPositionsResponseSDKType {}
function createBaseMsgCreatePosition(): MsgCreatePosition {
  return {
    poolId: BigInt(0),
    sender: "",
    lowerTick: BigInt(0),
    upperTick: BigInt(0),
    tokensProvided: [],
    tokenMinAmount0: "",
    tokenMinAmount1: "",
  };
}
export const MsgCreatePosition = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
  encode(
    message: MsgCreatePosition,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.lowerTick !== BigInt(0)) {
      writer.uint32(24).int64(message.lowerTick);
    }
    if (message.upperTick !== BigInt(0)) {
      writer.uint32(32).int64(message.upperTick);
    }
    for (const v of message.tokensProvided) {
      Coin.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.tokenMinAmount0 !== "") {
      writer.uint32(50).string(message.tokenMinAmount0);
    }
    if (message.tokenMinAmount1 !== "") {
      writer.uint32(58).string(message.tokenMinAmount1);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreatePosition {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.lowerTick = reader.int64();
          break;
        case 4:
          message.upperTick = reader.int64();
          break;
        case 5:
          message.tokensProvided.push(Coin.decode(reader, reader.uint32()));
          break;
        case 6:
          message.tokenMinAmount0 = reader.string();
          break;
        case 7:
          message.tokenMinAmount1 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreatePosition>): MsgCreatePosition {
    const message = createBaseMsgCreatePosition();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.sender = object.sender ?? "";
    message.lowerTick =
      object.lowerTick !== undefined && object.lowerTick !== null
        ? BigInt(object.lowerTick.toString())
        : BigInt(0);
    message.upperTick =
      object.upperTick !== undefined && object.upperTick !== null
        ? BigInt(object.upperTick.toString())
        : BigInt(0);
    message.tokensProvided =
      object.tokensProvided?.map((e) => Coin.fromPartial(e)) || [];
    message.tokenMinAmount0 = object.tokenMinAmount0 ?? "";
    message.tokenMinAmount1 = object.tokenMinAmount1 ?? "";
    return message;
  },
  fromAmino(object: MsgCreatePositionAmino): MsgCreatePosition {
    const message = createBaseMsgCreatePosition();
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.poolId = BigInt(object.pool_id);
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.lower_tick !== undefined && object.lower_tick !== null) {
      message.lowerTick = BigInt(object.lower_tick);
    }
    if (object.upper_tick !== undefined && object.upper_tick !== null) {
      message.upperTick = BigInt(object.upper_tick);
    }
    message.tokensProvided =
      object.tokens_provided?.map((e) => Coin.fromAmino(e)) || [];
    if (
      object.token_min_amount0 !== undefined &&
      object.token_min_amount0 !== null
    ) {
      message.tokenMinAmount0 = object.token_min_amount0;
    }
    if (
      object.token_min_amount1 !== undefined &&
      object.token_min_amount1 !== null
    ) {
      message.tokenMinAmount1 = object.token_min_amount1;
    }
    return message;
  },
  toAmino(message: MsgCreatePosition): MsgCreatePositionAmino {
    const obj: any = {};
    obj.pool_id =
      message.poolId !== BigInt(0) ? message.poolId.toString() : undefined;
    obj.sender = message.sender === "" ? undefined : message.sender;
    obj.lower_tick =
      message.lowerTick !== BigInt(0)
        ? message.lowerTick.toString()
        : undefined;
    obj.upper_tick =
      message.upperTick !== BigInt(0)
        ? message.upperTick.toString()
        : undefined;
    if (message.tokensProvided) {
      obj.tokens_provided = message.tokensProvided.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.tokens_provided = message.tokensProvided;
    }
    obj.token_min_amount0 =
      message.tokenMinAmount0 === "" ? undefined : message.tokenMinAmount0;
    obj.token_min_amount1 =
      message.tokenMinAmount1 === "" ? undefined : message.tokenMinAmount1;
    return obj;
  },
  fromAminoMsg(object: MsgCreatePositionAminoMsg): MsgCreatePosition {
    return MsgCreatePosition.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreatePosition): MsgCreatePositionAminoMsg {
    return {
      type: "osmosis/cl-create-position",
      value: MsgCreatePosition.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreatePositionProtoMsg): MsgCreatePosition {
    return MsgCreatePosition.decode(message.value);
  },
  toProto(message: MsgCreatePosition): Uint8Array {
    return MsgCreatePosition.encode(message).finish();
  },
  toProtoMsg(message: MsgCreatePosition): MsgCreatePositionProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
      value: MsgCreatePosition.encode(message).finish(),
    };
  },
};
function createBaseMsgCreatePositionResponse(): MsgCreatePositionResponse {
  return {
    positionId: BigInt(0),
    amount0: "",
    amount1: "",
    liquidityCreated: "",
    lowerTick: BigInt(0),
    upperTick: BigInt(0),
  };
}
export const MsgCreatePositionResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse",
  encode(
    message: MsgCreatePositionResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.positionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.amount0 !== "") {
      writer.uint32(18).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(26).string(message.amount1);
    }
    if (message.liquidityCreated !== "") {
      writer
        .uint32(42)
        .string(Decimal.fromUserInput(message.liquidityCreated, 18).atomics);
    }
    if (message.lowerTick !== BigInt(0)) {
      writer.uint32(48).int64(message.lowerTick);
    }
    if (message.upperTick !== BigInt(0)) {
      writer.uint32(56).int64(message.upperTick);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCreatePositionResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64();
          break;
        case 2:
          message.amount0 = reader.string();
          break;
        case 3:
          message.amount1 = reader.string();
          break;
        case 5:
          message.liquidityCreated = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        case 6:
          message.lowerTick = reader.int64();
          break;
        case 7:
          message.upperTick = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCreatePositionResponse>
  ): MsgCreatePositionResponse {
    const message = createBaseMsgCreatePositionResponse();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    message.liquidityCreated = object.liquidityCreated ?? "";
    message.lowerTick =
      object.lowerTick !== undefined && object.lowerTick !== null
        ? BigInt(object.lowerTick.toString())
        : BigInt(0);
    message.upperTick =
      object.upperTick !== undefined && object.upperTick !== null
        ? BigInt(object.upperTick.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgCreatePositionResponseAmino): MsgCreatePositionResponse {
    const message = createBaseMsgCreatePositionResponse();
    if (object.position_id !== undefined && object.position_id !== null) {
      message.positionId = BigInt(object.position_id);
    }
    if (object.amount0 !== undefined && object.amount0 !== null) {
      message.amount0 = object.amount0;
    }
    if (object.amount1 !== undefined && object.amount1 !== null) {
      message.amount1 = object.amount1;
    }
    if (
      object.liquidity_created !== undefined &&
      object.liquidity_created !== null
    ) {
      message.liquidityCreated = object.liquidity_created;
    }
    if (object.lower_tick !== undefined && object.lower_tick !== null) {
      message.lowerTick = BigInt(object.lower_tick);
    }
    if (object.upper_tick !== undefined && object.upper_tick !== null) {
      message.upperTick = BigInt(object.upper_tick);
    }
    return message;
  },
  toAmino(message: MsgCreatePositionResponse): MsgCreatePositionResponseAmino {
    const obj: any = {};
    obj.position_id =
      message.positionId !== BigInt(0)
        ? message.positionId.toString()
        : undefined;
    obj.amount0 = message.amount0 === "" ? undefined : message.amount0;
    obj.amount1 = message.amount1 === "" ? undefined : message.amount1;
    obj.liquidity_created =
      message.liquidityCreated === "" ? undefined : message.liquidityCreated;
    obj.lower_tick =
      message.lowerTick !== BigInt(0)
        ? message.lowerTick.toString()
        : undefined;
    obj.upper_tick =
      message.upperTick !== BigInt(0)
        ? message.upperTick.toString()
        : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreatePositionResponseAminoMsg
  ): MsgCreatePositionResponse {
    return MsgCreatePositionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreatePositionResponse
  ): MsgCreatePositionResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-position-response",
      value: MsgCreatePositionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreatePositionResponseProtoMsg
  ): MsgCreatePositionResponse {
    return MsgCreatePositionResponse.decode(message.value);
  },
  toProto(message: MsgCreatePositionResponse): Uint8Array {
    return MsgCreatePositionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreatePositionResponse
  ): MsgCreatePositionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse",
      value: MsgCreatePositionResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgAddToPosition(): MsgAddToPosition {
  return {
    positionId: BigInt(0),
    sender: "",
    amount0: "",
    amount1: "",
    tokenMinAmount0: "",
    tokenMinAmount1: "",
  };
}
export const MsgAddToPosition = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
  encode(
    message: MsgAddToPosition,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.positionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.amount0 !== "") {
      writer.uint32(26).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(34).string(message.amount1);
    }
    if (message.tokenMinAmount0 !== "") {
      writer.uint32(42).string(message.tokenMinAmount0);
    }
    if (message.tokenMinAmount1 !== "") {
      writer.uint32(50).string(message.tokenMinAmount1);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAddToPosition {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddToPosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64();
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.amount0 = reader.string();
          break;
        case 4:
          message.amount1 = reader.string();
          break;
        case 5:
          message.tokenMinAmount0 = reader.string();
          break;
        case 6:
          message.tokenMinAmount1 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgAddToPosition>): MsgAddToPosition {
    const message = createBaseMsgAddToPosition();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    message.sender = object.sender ?? "";
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    message.tokenMinAmount0 = object.tokenMinAmount0 ?? "";
    message.tokenMinAmount1 = object.tokenMinAmount1 ?? "";
    return message;
  },
  fromAmino(object: MsgAddToPositionAmino): MsgAddToPosition {
    const message = createBaseMsgAddToPosition();
    if (object.position_id !== undefined && object.position_id !== null) {
      message.positionId = BigInt(object.position_id);
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.amount0 !== undefined && object.amount0 !== null) {
      message.amount0 = object.amount0;
    }
    if (object.amount1 !== undefined && object.amount1 !== null) {
      message.amount1 = object.amount1;
    }
    if (
      object.token_min_amount0 !== undefined &&
      object.token_min_amount0 !== null
    ) {
      message.tokenMinAmount0 = object.token_min_amount0;
    }
    if (
      object.token_min_amount1 !== undefined &&
      object.token_min_amount1 !== null
    ) {
      message.tokenMinAmount1 = object.token_min_amount1;
    }
    return message;
  },
  toAmino(message: MsgAddToPosition): MsgAddToPositionAmino {
    const obj: any = {};
    obj.position_id =
      message.positionId !== BigInt(0)
        ? message.positionId.toString()
        : undefined;
    obj.sender = message.sender === "" ? undefined : message.sender;
    obj.amount0 = message.amount0 === "" ? undefined : message.amount0;
    obj.amount1 = message.amount1 === "" ? undefined : message.amount1;
    obj.token_min_amount0 =
      message.tokenMinAmount0 === "" ? undefined : message.tokenMinAmount0;
    obj.token_min_amount1 =
      message.tokenMinAmount1 === "" ? undefined : message.tokenMinAmount1;
    return obj;
  },
  fromAminoMsg(object: MsgAddToPositionAminoMsg): MsgAddToPosition {
    return MsgAddToPosition.fromAmino(object.value);
  },
  toAminoMsg(message: MsgAddToPosition): MsgAddToPositionAminoMsg {
    return {
      type: "osmosis/cl-add-to-position",
      value: MsgAddToPosition.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgAddToPositionProtoMsg): MsgAddToPosition {
    return MsgAddToPosition.decode(message.value);
  },
  toProto(message: MsgAddToPosition): Uint8Array {
    return MsgAddToPosition.encode(message).finish();
  },
  toProtoMsg(message: MsgAddToPosition): MsgAddToPositionProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
      value: MsgAddToPosition.encode(message).finish(),
    };
  },
};
function createBaseMsgAddToPositionResponse(): MsgAddToPositionResponse {
  return {
    positionId: BigInt(0),
    amount0: "",
    amount1: "",
  };
}
export const MsgAddToPositionResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPositionResponse",
  encode(
    message: MsgAddToPositionResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.positionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.amount0 !== "") {
      writer.uint32(18).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(26).string(message.amount1);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgAddToPositionResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddToPositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64();
          break;
        case 2:
          message.amount0 = reader.string();
          break;
        case 3:
          message.amount1 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgAddToPositionResponse>
  ): MsgAddToPositionResponse {
    const message = createBaseMsgAddToPositionResponse();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    return message;
  },
  fromAmino(object: MsgAddToPositionResponseAmino): MsgAddToPositionResponse {
    const message = createBaseMsgAddToPositionResponse();
    if (object.position_id !== undefined && object.position_id !== null) {
      message.positionId = BigInt(object.position_id);
    }
    if (object.amount0 !== undefined && object.amount0 !== null) {
      message.amount0 = object.amount0;
    }
    if (object.amount1 !== undefined && object.amount1 !== null) {
      message.amount1 = object.amount1;
    }
    return message;
  },
  toAmino(message: MsgAddToPositionResponse): MsgAddToPositionResponseAmino {
    const obj: any = {};
    obj.position_id =
      message.positionId !== BigInt(0)
        ? message.positionId.toString()
        : undefined;
    obj.amount0 = message.amount0 === "" ? undefined : message.amount0;
    obj.amount1 = message.amount1 === "" ? undefined : message.amount1;
    return obj;
  },
  fromAminoMsg(
    object: MsgAddToPositionResponseAminoMsg
  ): MsgAddToPositionResponse {
    return MsgAddToPositionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgAddToPositionResponse
  ): MsgAddToPositionResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/add-to-position-response",
      value: MsgAddToPositionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgAddToPositionResponseProtoMsg
  ): MsgAddToPositionResponse {
    return MsgAddToPositionResponse.decode(message.value);
  },
  toProto(message: MsgAddToPositionResponse): Uint8Array {
    return MsgAddToPositionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgAddToPositionResponse
  ): MsgAddToPositionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgAddToPositionResponse",
      value: MsgAddToPositionResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdrawPosition(): MsgWithdrawPosition {
  return {
    positionId: BigInt(0),
    sender: "",
    liquidityAmount: "",
  };
}
export const MsgWithdrawPosition = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
  encode(
    message: MsgWithdrawPosition,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.positionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.liquidityAmount !== "") {
      writer
        .uint32(26)
        .string(Decimal.fromUserInput(message.liquidityAmount, 18).atomics);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgWithdrawPosition {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawPosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64();
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.liquidityAmount = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWithdrawPosition>): MsgWithdrawPosition {
    const message = createBaseMsgWithdrawPosition();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    message.sender = object.sender ?? "";
    message.liquidityAmount = object.liquidityAmount ?? "";
    return message;
  },
  fromAmino(object: MsgWithdrawPositionAmino): MsgWithdrawPosition {
    const message = createBaseMsgWithdrawPosition();
    if (object.position_id !== undefined && object.position_id !== null) {
      message.positionId = BigInt(object.position_id);
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (
      object.liquidity_amount !== undefined &&
      object.liquidity_amount !== null
    ) {
      message.liquidityAmount = object.liquidity_amount;
    }
    return message;
  },
  toAmino(message: MsgWithdrawPosition): MsgWithdrawPositionAmino {
    const obj: any = {};
    obj.position_id =
      message.positionId !== BigInt(0)
        ? message.positionId.toString()
        : undefined;
    obj.sender = message.sender === "" ? undefined : message.sender;
    obj.liquidity_amount =
      message.liquidityAmount === "" ? undefined : message.liquidityAmount;
    return obj;
  },
  fromAminoMsg(object: MsgWithdrawPositionAminoMsg): MsgWithdrawPosition {
    return MsgWithdrawPosition.fromAmino(object.value);
  },
  toAminoMsg(message: MsgWithdrawPosition): MsgWithdrawPositionAminoMsg {
    return {
      type: "osmosis/cl-withdraw-position",
      value: MsgWithdrawPosition.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgWithdrawPositionProtoMsg): MsgWithdrawPosition {
    return MsgWithdrawPosition.decode(message.value);
  },
  toProto(message: MsgWithdrawPosition): Uint8Array {
    return MsgWithdrawPosition.encode(message).finish();
  },
  toProtoMsg(message: MsgWithdrawPosition): MsgWithdrawPositionProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
      value: MsgWithdrawPosition.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdrawPositionResponse(): MsgWithdrawPositionResponse {
  return {
    amount0: "",
    amount1: "",
  };
}
export const MsgWithdrawPositionResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPositionResponse",
  encode(
    message: MsgWithdrawPositionResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.amount0 !== "") {
      writer.uint32(10).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(18).string(message.amount1);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgWithdrawPositionResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawPositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.amount0 = reader.string();
          break;
        case 2:
          message.amount1 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgWithdrawPositionResponse>
  ): MsgWithdrawPositionResponse {
    const message = createBaseMsgWithdrawPositionResponse();
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    return message;
  },
  fromAmino(
    object: MsgWithdrawPositionResponseAmino
  ): MsgWithdrawPositionResponse {
    const message = createBaseMsgWithdrawPositionResponse();
    if (object.amount0 !== undefined && object.amount0 !== null) {
      message.amount0 = object.amount0;
    }
    if (object.amount1 !== undefined && object.amount1 !== null) {
      message.amount1 = object.amount1;
    }
    return message;
  },
  toAmino(
    message: MsgWithdrawPositionResponse
  ): MsgWithdrawPositionResponseAmino {
    const obj: any = {};
    obj.amount0 = message.amount0 === "" ? undefined : message.amount0;
    obj.amount1 = message.amount1 === "" ? undefined : message.amount1;
    return obj;
  },
  fromAminoMsg(
    object: MsgWithdrawPositionResponseAminoMsg
  ): MsgWithdrawPositionResponse {
    return MsgWithdrawPositionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgWithdrawPositionResponse
  ): MsgWithdrawPositionResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/withdraw-position-response",
      value: MsgWithdrawPositionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgWithdrawPositionResponseProtoMsg
  ): MsgWithdrawPositionResponse {
    return MsgWithdrawPositionResponse.decode(message.value);
  },
  toProto(message: MsgWithdrawPositionResponse): Uint8Array {
    return MsgWithdrawPositionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgWithdrawPositionResponse
  ): MsgWithdrawPositionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPositionResponse",
      value: MsgWithdrawPositionResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectSpreadRewards(): MsgCollectSpreadRewards {
  return {
    positionIds: [],
    sender: "",
  };
}
export const MsgCollectSpreadRewards = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
  encode(
    message: MsgCollectSpreadRewards,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.positionIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCollectSpreadRewards {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectSpreadRewards();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.positionIds.push(reader.uint64());
            }
          } else {
            message.positionIds.push(reader.uint64());
          }
          break;
        case 2:
          message.sender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCollectSpreadRewards>
  ): MsgCollectSpreadRewards {
    const message = createBaseMsgCollectSpreadRewards();
    message.positionIds =
      object.positionIds?.map((e) => BigInt(e.toString())) || [];
    message.sender = object.sender ?? "";
    return message;
  },
  fromAmino(object: MsgCollectSpreadRewardsAmino): MsgCollectSpreadRewards {
    const message = createBaseMsgCollectSpreadRewards();
    message.positionIds = object.position_ids?.map((e) => BigInt(e)) || [];
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    return message;
  },
  toAmino(message: MsgCollectSpreadRewards): MsgCollectSpreadRewardsAmino {
    const obj: any = {};
    if (message.positionIds) {
      obj.position_ids = message.positionIds.map((e) => e.toString());
    } else {
      obj.position_ids = message.positionIds;
    }
    obj.sender = message.sender === "" ? undefined : message.sender;
    return obj;
  },
  fromAminoMsg(
    object: MsgCollectSpreadRewardsAminoMsg
  ): MsgCollectSpreadRewards {
    return MsgCollectSpreadRewards.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCollectSpreadRewards
  ): MsgCollectSpreadRewardsAminoMsg {
    return {
      type: "osmosis/cl-col-sp-rewards",
      value: MsgCollectSpreadRewards.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCollectSpreadRewardsProtoMsg
  ): MsgCollectSpreadRewards {
    return MsgCollectSpreadRewards.decode(message.value);
  },
  toProto(message: MsgCollectSpreadRewards): Uint8Array {
    return MsgCollectSpreadRewards.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCollectSpreadRewards
  ): MsgCollectSpreadRewardsProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
      value: MsgCollectSpreadRewards.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectSpreadRewardsResponse(): MsgCollectSpreadRewardsResponse {
  return {
    collectedSpreadRewards: [],
  };
}
export const MsgCollectSpreadRewardsResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewardsResponse",
  encode(
    message: MsgCollectSpreadRewardsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.collectedSpreadRewards) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCollectSpreadRewardsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectSpreadRewardsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.collectedSpreadRewards.push(
            Coin.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCollectSpreadRewardsResponse>
  ): MsgCollectSpreadRewardsResponse {
    const message = createBaseMsgCollectSpreadRewardsResponse();
    message.collectedSpreadRewards =
      object.collectedSpreadRewards?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: MsgCollectSpreadRewardsResponseAmino
  ): MsgCollectSpreadRewardsResponse {
    const message = createBaseMsgCollectSpreadRewardsResponse();
    message.collectedSpreadRewards =
      object.collected_spread_rewards?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(
    message: MsgCollectSpreadRewardsResponse
  ): MsgCollectSpreadRewardsResponseAmino {
    const obj: any = {};
    if (message.collectedSpreadRewards) {
      obj.collected_spread_rewards = message.collectedSpreadRewards.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.collected_spread_rewards = message.collectedSpreadRewards;
    }
    return obj;
  },
  fromAminoMsg(
    object: MsgCollectSpreadRewardsResponseAminoMsg
  ): MsgCollectSpreadRewardsResponse {
    return MsgCollectSpreadRewardsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCollectSpreadRewardsResponse
  ): MsgCollectSpreadRewardsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/collect-spread-rewards-response",
      value: MsgCollectSpreadRewardsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCollectSpreadRewardsResponseProtoMsg
  ): MsgCollectSpreadRewardsResponse {
    return MsgCollectSpreadRewardsResponse.decode(message.value);
  },
  toProto(message: MsgCollectSpreadRewardsResponse): Uint8Array {
    return MsgCollectSpreadRewardsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCollectSpreadRewardsResponse
  ): MsgCollectSpreadRewardsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewardsResponse",
      value: MsgCollectSpreadRewardsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectIncentives(): MsgCollectIncentives {
  return {
    positionIds: [],
    sender: "",
  };
}
export const MsgCollectIncentives = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
  encode(
    message: MsgCollectIncentives,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.positionIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCollectIncentives {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectIncentives();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.positionIds.push(reader.uint64());
            }
          } else {
            message.positionIds.push(reader.uint64());
          }
          break;
        case 2:
          message.sender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCollectIncentives>): MsgCollectIncentives {
    const message = createBaseMsgCollectIncentives();
    message.positionIds =
      object.positionIds?.map((e) => BigInt(e.toString())) || [];
    message.sender = object.sender ?? "";
    return message;
  },
  fromAmino(object: MsgCollectIncentivesAmino): MsgCollectIncentives {
    const message = createBaseMsgCollectIncentives();
    message.positionIds = object.position_ids?.map((e) => BigInt(e)) || [];
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    return message;
  },
  toAmino(message: MsgCollectIncentives): MsgCollectIncentivesAmino {
    const obj: any = {};
    if (message.positionIds) {
      obj.position_ids = message.positionIds.map((e) => e.toString());
    } else {
      obj.position_ids = message.positionIds;
    }
    obj.sender = message.sender === "" ? undefined : message.sender;
    return obj;
  },
  fromAminoMsg(object: MsgCollectIncentivesAminoMsg): MsgCollectIncentives {
    return MsgCollectIncentives.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCollectIncentives): MsgCollectIncentivesAminoMsg {
    return {
      type: "osmosis/cl-collect-incentives",
      value: MsgCollectIncentives.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCollectIncentivesProtoMsg): MsgCollectIncentives {
    return MsgCollectIncentives.decode(message.value);
  },
  toProto(message: MsgCollectIncentives): Uint8Array {
    return MsgCollectIncentives.encode(message).finish();
  },
  toProtoMsg(message: MsgCollectIncentives): MsgCollectIncentivesProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
      value: MsgCollectIncentives.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectIncentivesResponse(): MsgCollectIncentivesResponse {
  return {
    collectedIncentives: [],
    forfeitedIncentives: [],
  };
}
export const MsgCollectIncentivesResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse",
  encode(
    message: MsgCollectIncentivesResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.collectedIncentives) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.forfeitedIncentives) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCollectIncentivesResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectIncentivesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.collectedIncentives.push(
            Coin.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.forfeitedIncentives.push(
            Coin.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCollectIncentivesResponse>
  ): MsgCollectIncentivesResponse {
    const message = createBaseMsgCollectIncentivesResponse();
    message.collectedIncentives =
      object.collectedIncentives?.map((e) => Coin.fromPartial(e)) || [];
    message.forfeitedIncentives =
      object.forfeitedIncentives?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: MsgCollectIncentivesResponseAmino
  ): MsgCollectIncentivesResponse {
    const message = createBaseMsgCollectIncentivesResponse();
    message.collectedIncentives =
      object.collected_incentives?.map((e) => Coin.fromAmino(e)) || [];
    message.forfeitedIncentives =
      object.forfeited_incentives?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(
    message: MsgCollectIncentivesResponse
  ): MsgCollectIncentivesResponseAmino {
    const obj: any = {};
    if (message.collectedIncentives) {
      obj.collected_incentives = message.collectedIncentives.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.collected_incentives = message.collectedIncentives;
    }
    if (message.forfeitedIncentives) {
      obj.forfeited_incentives = message.forfeitedIncentives.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.forfeited_incentives = message.forfeitedIncentives;
    }
    return obj;
  },
  fromAminoMsg(
    object: MsgCollectIncentivesResponseAminoMsg
  ): MsgCollectIncentivesResponse {
    return MsgCollectIncentivesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCollectIncentivesResponse
  ): MsgCollectIncentivesResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/collect-incentives-response",
      value: MsgCollectIncentivesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCollectIncentivesResponseProtoMsg
  ): MsgCollectIncentivesResponse {
    return MsgCollectIncentivesResponse.decode(message.value);
  },
  toProto(message: MsgCollectIncentivesResponse): Uint8Array {
    return MsgCollectIncentivesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCollectIncentivesResponse
  ): MsgCollectIncentivesResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse",
      value: MsgCollectIncentivesResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgFungifyChargedPositions(): MsgFungifyChargedPositions {
  return {
    positionIds: [],
    sender: "",
  };
}
export const MsgFungifyChargedPositions = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions",
  encode(
    message: MsgFungifyChargedPositions,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.positionIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgFungifyChargedPositions {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgFungifyChargedPositions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.positionIds.push(reader.uint64());
            }
          } else {
            message.positionIds.push(reader.uint64());
          }
          break;
        case 2:
          message.sender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgFungifyChargedPositions>
  ): MsgFungifyChargedPositions {
    const message = createBaseMsgFungifyChargedPositions();
    message.positionIds =
      object.positionIds?.map((e) => BigInt(e.toString())) || [];
    message.sender = object.sender ?? "";
    return message;
  },
  fromAmino(
    object: MsgFungifyChargedPositionsAmino
  ): MsgFungifyChargedPositions {
    const message = createBaseMsgFungifyChargedPositions();
    message.positionIds = object.position_ids?.map((e) => BigInt(e)) || [];
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    return message;
  },
  toAmino(
    message: MsgFungifyChargedPositions
  ): MsgFungifyChargedPositionsAmino {
    const obj: any = {};
    if (message.positionIds) {
      obj.position_ids = message.positionIds.map((e) => e.toString());
    } else {
      obj.position_ids = message.positionIds;
    }
    obj.sender = message.sender === "" ? undefined : message.sender;
    return obj;
  },
  fromAminoMsg(
    object: MsgFungifyChargedPositionsAminoMsg
  ): MsgFungifyChargedPositions {
    return MsgFungifyChargedPositions.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgFungifyChargedPositions
  ): MsgFungifyChargedPositionsAminoMsg {
    return {
      type: "osmosis/cl-fungify-charged-positions",
      value: MsgFungifyChargedPositions.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgFungifyChargedPositionsProtoMsg
  ): MsgFungifyChargedPositions {
    return MsgFungifyChargedPositions.decode(message.value);
  },
  toProto(message: MsgFungifyChargedPositions): Uint8Array {
    return MsgFungifyChargedPositions.encode(message).finish();
  },
  toProtoMsg(
    message: MsgFungifyChargedPositions
  ): MsgFungifyChargedPositionsProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions",
      value: MsgFungifyChargedPositions.encode(message).finish(),
    };
  },
};
function createBaseMsgFungifyChargedPositionsResponse(): MsgFungifyChargedPositionsResponse {
  return {
    newPositionId: BigInt(0),
  };
}
export const MsgFungifyChargedPositionsResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositionsResponse",
  encode(
    message: MsgFungifyChargedPositionsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.newPositionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.newPositionId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgFungifyChargedPositionsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgFungifyChargedPositionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.newPositionId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgFungifyChargedPositionsResponse>
  ): MsgFungifyChargedPositionsResponse {
    const message = createBaseMsgFungifyChargedPositionsResponse();
    message.newPositionId =
      object.newPositionId !== undefined && object.newPositionId !== null
        ? BigInt(object.newPositionId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: MsgFungifyChargedPositionsResponseAmino
  ): MsgFungifyChargedPositionsResponse {
    const message = createBaseMsgFungifyChargedPositionsResponse();
    if (
      object.new_position_id !== undefined &&
      object.new_position_id !== null
    ) {
      message.newPositionId = BigInt(object.new_position_id);
    }
    return message;
  },
  toAmino(
    message: MsgFungifyChargedPositionsResponse
  ): MsgFungifyChargedPositionsResponseAmino {
    const obj: any = {};
    obj.new_position_id =
      message.newPositionId !== BigInt(0)
        ? message.newPositionId.toString()
        : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgFungifyChargedPositionsResponseAminoMsg
  ): MsgFungifyChargedPositionsResponse {
    return MsgFungifyChargedPositionsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgFungifyChargedPositionsResponse
  ): MsgFungifyChargedPositionsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/fungify-charged-positions-response",
      value: MsgFungifyChargedPositionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgFungifyChargedPositionsResponseProtoMsg
  ): MsgFungifyChargedPositionsResponse {
    return MsgFungifyChargedPositionsResponse.decode(message.value);
  },
  toProto(message: MsgFungifyChargedPositionsResponse): Uint8Array {
    return MsgFungifyChargedPositionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgFungifyChargedPositionsResponse
  ): MsgFungifyChargedPositionsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositionsResponse",
      value: MsgFungifyChargedPositionsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgTransferPositions(): MsgTransferPositions {
  return {
    positionIds: [],
    sender: "",
    newOwner: "",
  };
}
export const MsgTransferPositions = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgTransferPositions",
  encode(
    message: MsgTransferPositions,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.positionIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.newOwner !== "") {
      writer.uint32(26).string(message.newOwner);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgTransferPositions {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgTransferPositions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.positionIds.push(reader.uint64());
            }
          } else {
            message.positionIds.push(reader.uint64());
          }
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.newOwner = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgTransferPositions>): MsgTransferPositions {
    const message = createBaseMsgTransferPositions();
    message.positionIds =
      object.positionIds?.map((e) => BigInt(e.toString())) || [];
    message.sender = object.sender ?? "";
    message.newOwner = object.newOwner ?? "";
    return message;
  },
  fromAmino(object: MsgTransferPositionsAmino): MsgTransferPositions {
    const message = createBaseMsgTransferPositions();
    message.positionIds = object.position_ids?.map((e) => BigInt(e)) || [];
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.new_owner !== undefined && object.new_owner !== null) {
      message.newOwner = object.new_owner;
    }
    return message;
  },
  toAmino(message: MsgTransferPositions): MsgTransferPositionsAmino {
    const obj: any = {};
    if (message.positionIds) {
      obj.position_ids = message.positionIds.map((e) => e.toString());
    } else {
      obj.position_ids = message.positionIds;
    }
    obj.sender = message.sender === "" ? undefined : message.sender;
    obj.new_owner = message.newOwner === "" ? undefined : message.newOwner;
    return obj;
  },
  fromAminoMsg(object: MsgTransferPositionsAminoMsg): MsgTransferPositions {
    return MsgTransferPositions.fromAmino(object.value);
  },
  toAminoMsg(message: MsgTransferPositions): MsgTransferPositionsAminoMsg {
    return {
      type: "osmosis/cl-transfer-positions",
      value: MsgTransferPositions.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgTransferPositionsProtoMsg): MsgTransferPositions {
    return MsgTransferPositions.decode(message.value);
  },
  toProto(message: MsgTransferPositions): Uint8Array {
    return MsgTransferPositions.encode(message).finish();
  },
  toProtoMsg(message: MsgTransferPositions): MsgTransferPositionsProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgTransferPositions",
      value: MsgTransferPositions.encode(message).finish(),
    };
  },
};
function createBaseMsgTransferPositionsResponse(): MsgTransferPositionsResponse {
  return {};
}
export const MsgTransferPositionsResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.MsgTransferPositionsResponse",
  encode(
    _: MsgTransferPositionsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgTransferPositionsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgTransferPositionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgTransferPositionsResponse>
  ): MsgTransferPositionsResponse {
    const message = createBaseMsgTransferPositionsResponse();
    return message;
  },
  fromAmino(
    _: MsgTransferPositionsResponseAmino
  ): MsgTransferPositionsResponse {
    const message = createBaseMsgTransferPositionsResponse();
    return message;
  },
  toAmino(_: MsgTransferPositionsResponse): MsgTransferPositionsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgTransferPositionsResponseAminoMsg
  ): MsgTransferPositionsResponse {
    return MsgTransferPositionsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgTransferPositionsResponse
  ): MsgTransferPositionsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/transfer-positions-response",
      value: MsgTransferPositionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgTransferPositionsResponseProtoMsg
  ): MsgTransferPositionsResponse {
    return MsgTransferPositionsResponse.decode(message.value);
  },
  toProto(message: MsgTransferPositionsResponse): Uint8Array {
    return MsgTransferPositionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgTransferPositionsResponse
  ): MsgTransferPositionsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgTransferPositionsResponse",
      value: MsgTransferPositionsResponse.encode(message).finish(),
    };
  },
};
