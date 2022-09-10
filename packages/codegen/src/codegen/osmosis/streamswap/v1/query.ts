import { PageRequest, PageResponse } from "../../../cosmos/base/query/v1beta1/pagination";
import { Sale, UserPosition } from "./state";
import * as _m0 from "protobufjs/minimal";
import { isSet, DeepPartial, Long } from "@osmonauts/helpers";
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

function createBaseQuerySales(): QuerySales {
  return {
    pagination: undefined
  };
}

export const QuerySales = {
  encode(message: QuerySales, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QuerySales {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySales();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): QuerySales {
    return {
      pagination: isSet(object.pagination) ? PageRequest.fromJSON(object.pagination) : undefined
    };
  },

  toJSON(message: QuerySales): unknown {
    const obj: any = {};
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageRequest.toJSON(message.pagination) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QuerySales>): QuerySales {
    const message = createBaseQuerySales();
    message.pagination = object.pagination !== undefined && object.pagination !== null ? PageRequest.fromPartial(object.pagination) : undefined;
    return message;
  }

};

function createBaseQuerySalesResponse(): QuerySalesResponse {
  return {
    sales: [],
    pagination: undefined
  };
}

export const QuerySalesResponse = {
  encode(message: QuerySalesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.sales) {
      Sale.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QuerySalesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySalesResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sales.push(Sale.decode(reader, reader.uint32()));
          break;

        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): QuerySalesResponse {
    return {
      sales: Array.isArray(object?.sales) ? object.sales.map((e: any) => Sale.fromJSON(e)) : [],
      pagination: isSet(object.pagination) ? PageResponse.fromJSON(object.pagination) : undefined
    };
  },

  toJSON(message: QuerySalesResponse): unknown {
    const obj: any = {};

    if (message.sales) {
      obj.sales = message.sales.map(e => e ? Sale.toJSON(e) : undefined);
    } else {
      obj.sales = [];
    }

    message.pagination !== undefined && (obj.pagination = message.pagination ? PageResponse.toJSON(message.pagination) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QuerySalesResponse>): QuerySalesResponse {
    const message = createBaseQuerySalesResponse();
    message.sales = object.sales?.map(e => Sale.fromPartial(e)) || [];
    message.pagination = object.pagination !== undefined && object.pagination !== null ? PageResponse.fromPartial(object.pagination) : undefined;
    return message;
  }

};

function createBaseQuerySale(): QuerySale {
  return {
    saleId: Long.UZERO
  };
}

export const QuerySale = {
  encode(message: QuerySale, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.saleId.isZero()) {
      writer.uint32(8).uint64(message.saleId);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QuerySale {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySale();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.saleId = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): QuerySale {
    return {
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO
    };
  },

  toJSON(message: QuerySale): unknown {
    const obj: any = {};
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<QuerySale>): QuerySale {
    const message = createBaseQuerySale();
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    return message;
  }

};

function createBaseQuerySaleResponse(): QuerySaleResponse {
  return {
    sale: undefined
  };
}

export const QuerySaleResponse = {
  encode(message: QuerySaleResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sale !== undefined) {
      Sale.encode(message.sale, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QuerySaleResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySaleResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sale = Sale.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): QuerySaleResponse {
    return {
      sale: isSet(object.sale) ? Sale.fromJSON(object.sale) : undefined
    };
  },

  toJSON(message: QuerySaleResponse): unknown {
    const obj: any = {};
    message.sale !== undefined && (obj.sale = message.sale ? Sale.toJSON(message.sale) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QuerySaleResponse>): QuerySaleResponse {
    const message = createBaseQuerySaleResponse();
    message.sale = object.sale !== undefined && object.sale !== null ? Sale.fromPartial(object.sale) : undefined;
    return message;
  }

};

function createBaseQueryUserPosition(): QueryUserPosition {
  return {
    saleId: Long.UZERO,
    user: ""
  };
}

export const QueryUserPosition = {
  encode(message: QueryUserPosition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.saleId.isZero()) {
      writer.uint32(8).uint64(message.saleId);
    }

    if (message.user !== "") {
      writer.uint32(18).string(message.user);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryUserPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserPosition();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.saleId = (reader.uint64() as Long);
          break;

        case 2:
          message.user = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): QueryUserPosition {
    return {
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO,
      user: isSet(object.user) ? String(object.user) : ""
    };
  },

  toJSON(message: QueryUserPosition): unknown {
    const obj: any = {};
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    message.user !== undefined && (obj.user = message.user);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryUserPosition>): QueryUserPosition {
    const message = createBaseQueryUserPosition();
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    message.user = object.user ?? "";
    return message;
  }

};

function createBaseQueryUserPositionResponse(): QueryUserPositionResponse {
  return {
    userPosition: undefined
  };
}

export const QueryUserPositionResponse = {
  encode(message: QueryUserPositionResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.userPosition !== undefined) {
      UserPosition.encode(message.userPosition, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): QueryUserPositionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserPositionResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.userPosition = UserPosition.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): QueryUserPositionResponse {
    return {
      userPosition: isSet(object.userPosition) ? UserPosition.fromJSON(object.userPosition) : undefined
    };
  },

  toJSON(message: QueryUserPositionResponse): unknown {
    const obj: any = {};
    message.userPosition !== undefined && (obj.userPosition = message.userPosition ? UserPosition.toJSON(message.userPosition) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryUserPositionResponse>): QueryUserPositionResponse {
    const message = createBaseQueryUserPositionResponse();
    message.userPosition = object.userPosition !== undefined && object.userPosition !== null ? UserPosition.fromPartial(object.userPosition) : undefined;
    return message;
  }

};