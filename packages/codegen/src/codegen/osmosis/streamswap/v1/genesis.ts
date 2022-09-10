import { Sale, UserPosition } from "./state";
import { Params } from "./params";
import * as _m0 from "protobufjs/minimal";
import { Long, isSet, DeepPartial } from "@osmonauts/helpers";

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

function createBaseGenesisState(): GenesisState {
  return {
    sales: [],
    userPositions: [],
    nextSaleId: Long.UZERO,
    params: undefined
  };
}

export const GenesisState = {
  encode(message: GenesisState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.sales) {
      Sale.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.userPositions) {
      UserPositionKV.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    if (!message.nextSaleId.isZero()) {
      writer.uint32(24).uint64(message.nextSaleId);
    }

    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sales.push(Sale.decode(reader, reader.uint32()));
          break;

        case 2:
          message.userPositions.push(UserPositionKV.decode(reader, reader.uint32()));
          break;

        case 3:
          message.nextSaleId = (reader.uint64() as Long);
          break;

        case 4:
          message.params = Params.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): GenesisState {
    return {
      sales: Array.isArray(object?.sales) ? object.sales.map((e: any) => Sale.fromJSON(e)) : [],
      userPositions: Array.isArray(object?.userPositions) ? object.userPositions.map((e: any) => UserPositionKV.fromJSON(e)) : [],
      nextSaleId: isSet(object.nextSaleId) ? Long.fromString(object.nextSaleId) : Long.UZERO,
      params: isSet(object.params) ? Params.fromJSON(object.params) : undefined
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};

    if (message.sales) {
      obj.sales = message.sales.map(e => e ? Sale.toJSON(e) : undefined);
    } else {
      obj.sales = [];
    }

    if (message.userPositions) {
      obj.userPositions = message.userPositions.map(e => e ? UserPositionKV.toJSON(e) : undefined);
    } else {
      obj.userPositions = [];
    }

    message.nextSaleId !== undefined && (obj.nextSaleId = (message.nextSaleId || Long.UZERO).toString());
    message.params !== undefined && (obj.params = message.params ? Params.toJSON(message.params) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.sales = object.sales?.map(e => Sale.fromPartial(e)) || [];
    message.userPositions = object.userPositions?.map(e => UserPositionKV.fromPartial(e)) || [];
    message.nextSaleId = object.nextSaleId !== undefined && object.nextSaleId !== null ? Long.fromValue(object.nextSaleId) : Long.UZERO;
    message.params = object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined;
    return message;
  }

};

function createBaseUserPositionKV(): UserPositionKV {
  return {
    accAddress: "",
    saleId: Long.UZERO,
    userPosition: undefined
  };
}

export const UserPositionKV = {
  encode(message: UserPositionKV, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accAddress !== "") {
      writer.uint32(10).string(message.accAddress);
    }

    if (!message.saleId.isZero()) {
      writer.uint32(16).uint64(message.saleId);
    }

    if (message.userPosition !== undefined) {
      UserPosition.encode(message.userPosition, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserPositionKV {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserPositionKV();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.accAddress = reader.string();
          break;

        case 2:
          message.saleId = (reader.uint64() as Long);
          break;

        case 3:
          message.userPosition = UserPosition.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): UserPositionKV {
    return {
      accAddress: isSet(object.accAddress) ? String(object.accAddress) : "",
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO,
      userPosition: isSet(object.userPosition) ? UserPosition.fromJSON(object.userPosition) : undefined
    };
  },

  toJSON(message: UserPositionKV): unknown {
    const obj: any = {};
    message.accAddress !== undefined && (obj.accAddress = message.accAddress);
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    message.userPosition !== undefined && (obj.userPosition = message.userPosition ? UserPosition.toJSON(message.userPosition) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<UserPositionKV>): UserPositionKV {
    const message = createBaseUserPositionKV();
    message.accAddress = object.accAddress ?? "";
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    message.userPosition = object.userPosition !== undefined && object.userPosition !== null ? UserPosition.fromPartial(object.userPosition) : undefined;
    return message;
  }

};