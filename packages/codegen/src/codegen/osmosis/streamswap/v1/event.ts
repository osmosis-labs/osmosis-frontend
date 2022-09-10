import { Coin } from "../../../cosmos/base/v1beta1/coin";
import * as _m0 from "protobufjs/minimal";
import { Long, isSet, DeepPartial } from "@osmonauts/helpers";
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

function createBaseEventCreateSale(): EventCreateSale {
  return {
    id: Long.UZERO,
    creator: "",
    tokenIn: "",
    tokenOut: undefined
  };
}

export const EventCreateSale = {
  encode(message: EventCreateSale, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.id.isZero()) {
      writer.uint32(8).uint64(message.id);
    }

    if (message.creator !== "") {
      writer.uint32(18).string(message.creator);
    }

    if (message.tokenIn !== "") {
      writer.uint32(26).string(message.tokenIn);
    }

    if (message.tokenOut !== undefined) {
      Coin.encode(message.tokenOut, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventCreateSale {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventCreateSale();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = (reader.uint64() as Long);
          break;

        case 2:
          message.creator = reader.string();
          break;

        case 3:
          message.tokenIn = reader.string();
          break;

        case 4:
          message.tokenOut = Coin.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): EventCreateSale {
    return {
      id: isSet(object.id) ? Long.fromString(object.id) : Long.UZERO,
      creator: isSet(object.creator) ? String(object.creator) : "",
      tokenIn: isSet(object.tokenIn) ? String(object.tokenIn) : "",
      tokenOut: isSet(object.tokenOut) ? Coin.fromJSON(object.tokenOut) : undefined
    };
  },

  toJSON(message: EventCreateSale): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || Long.UZERO).toString());
    message.creator !== undefined && (obj.creator = message.creator);
    message.tokenIn !== undefined && (obj.tokenIn = message.tokenIn);
    message.tokenOut !== undefined && (obj.tokenOut = message.tokenOut ? Coin.toJSON(message.tokenOut) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<EventCreateSale>): EventCreateSale {
    const message = createBaseEventCreateSale();
    message.id = object.id !== undefined && object.id !== null ? Long.fromValue(object.id) : Long.UZERO;
    message.creator = object.creator ?? "";
    message.tokenIn = object.tokenIn ?? "";
    message.tokenOut = object.tokenOut !== undefined && object.tokenOut !== null ? Coin.fromPartial(object.tokenOut) : undefined;
    return message;
  }

};

function createBaseEventSubscribe(): EventSubscribe {
  return {
    sender: "",
    saleId: Long.UZERO,
    amount: ""
  };
}

export const EventSubscribe = {
  encode(message: EventSubscribe, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }

    if (!message.saleId.isZero()) {
      writer.uint32(16).uint64(message.saleId);
    }

    if (message.amount !== "") {
      writer.uint32(26).string(message.amount);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventSubscribe {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventSubscribe();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;

        case 2:
          message.saleId = (reader.uint64() as Long);
          break;

        case 3:
          message.amount = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): EventSubscribe {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO,
      amount: isSet(object.amount) ? String(object.amount) : ""
    };
  },

  toJSON(message: EventSubscribe): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    message.amount !== undefined && (obj.amount = message.amount);
    return obj;
  },

  fromPartial(object: DeepPartial<EventSubscribe>): EventSubscribe {
    const message = createBaseEventSubscribe();
    message.sender = object.sender ?? "";
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    message.amount = object.amount ?? "";
    return message;
  }

};

function createBaseEventWithdraw(): EventWithdraw {
  return {
    sender: "",
    saleId: Long.UZERO,
    amount: ""
  };
}

export const EventWithdraw = {
  encode(message: EventWithdraw, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }

    if (!message.saleId.isZero()) {
      writer.uint32(16).uint64(message.saleId);
    }

    if (message.amount !== "") {
      writer.uint32(26).string(message.amount);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventWithdraw {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventWithdraw();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;

        case 2:
          message.saleId = (reader.uint64() as Long);
          break;

        case 3:
          message.amount = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): EventWithdraw {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO,
      amount: isSet(object.amount) ? String(object.amount) : ""
    };
  },

  toJSON(message: EventWithdraw): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    message.amount !== undefined && (obj.amount = message.amount);
    return obj;
  },

  fromPartial(object: DeepPartial<EventWithdraw>): EventWithdraw {
    const message = createBaseEventWithdraw();
    message.sender = object.sender ?? "";
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    message.amount = object.amount ?? "";
    return message;
  }

};

function createBaseEventExit(): EventExit {
  return {
    sender: "",
    saleId: Long.UZERO,
    purchased: ""
  };
}

export const EventExit = {
  encode(message: EventExit, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }

    if (!message.saleId.isZero()) {
      writer.uint32(16).uint64(message.saleId);
    }

    if (message.purchased !== "") {
      writer.uint32(26).string(message.purchased);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventExit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventExit();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;

        case 2:
          message.saleId = (reader.uint64() as Long);
          break;

        case 3:
          message.purchased = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): EventExit {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO,
      purchased: isSet(object.purchased) ? String(object.purchased) : ""
    };
  },

  toJSON(message: EventExit): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    message.purchased !== undefined && (obj.purchased = message.purchased);
    return obj;
  },

  fromPartial(object: DeepPartial<EventExit>): EventExit {
    const message = createBaseEventExit();
    message.sender = object.sender ?? "";
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    message.purchased = object.purchased ?? "";
    return message;
  }

};

function createBaseEventFinalizeSale(): EventFinalizeSale {
  return {
    saleId: Long.UZERO,
    income: ""
  };
}

export const EventFinalizeSale = {
  encode(message: EventFinalizeSale, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.saleId.isZero()) {
      writer.uint32(8).uint64(message.saleId);
    }

    if (message.income !== "") {
      writer.uint32(26).string(message.income);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventFinalizeSale {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventFinalizeSale();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.saleId = (reader.uint64() as Long);
          break;

        case 3:
          message.income = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): EventFinalizeSale {
    return {
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO,
      income: isSet(object.income) ? String(object.income) : ""
    };
  },

  toJSON(message: EventFinalizeSale): unknown {
    const obj: any = {};
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    message.income !== undefined && (obj.income = message.income);
    return obj;
  },

  fromPartial(object: DeepPartial<EventFinalizeSale>): EventFinalizeSale {
    const message = createBaseEventFinalizeSale();
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    message.income = object.income ?? "";
    return message;
  }

};