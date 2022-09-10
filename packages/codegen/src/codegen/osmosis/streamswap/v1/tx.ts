import { Coin } from "../../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { Duration } from "../../../google/protobuf/duration";
import * as _m0 from "protobufjs/minimal";
import { toTimestamp, fromTimestamp, isSet, fromJsonTimestamp, DeepPartial, Long } from "@osmonauts/helpers";
export interface MsgCreateSale {
  /**
   * Sale creator and the account which provides token (token_out) to the sale.
   * When processing this message, token_out
   */
  creator: string;

  /**
   * token_in is a denom used to buy `token_out`. May be referred as a
   * "quote currency".
   */
  tokenIn: string;

  /**
   * token_out is a coin supply (denom + amount) to sell. May be referred as
   * "base currency". The whole supply will be transferred from the creator
   * to the module and will be sold during the sale.
   */
  tokenOut: Coin;

  /**
   * Maximum fee the creator is going to pay for creating a sale. The creator
   * will be charged params.SaleCreationFee. Transaction will fail if
   * max_fee is smaller than params.SaleCreationFee. If empty, the creator
   * doesn't accept any fee.
   */
  maxFee: Coin[];

  /** start time when the token sale starts. */
  startTime: Date;

  /** duration time that the sale takes place over */
  duration: Duration;

  /**
   * Recipient is the account which receives earned `token_in` from when the
   * sale is finalized. If not defined (empty) the creator
   * account will be used.
   */
  recipient: string;

  /** Name for the sale, max 40 characters, min 4. Required. */
  name: string;

  /**
   * URL with sale and project details. Can be a link a link to IPFS,
   * hackmd, project page, blog post... Max 120 characters. Must be
   * valid agains Go url.ParseRequestURI. Required.
   */
  url: string;
}
export interface MsgCreateSaleResponse {
  saleId: Long;
}
export interface MsgSubscribe {
  /** sender is an account address adding a deposit */
  sender: string;

  /** ID of an existing sale. */
  saleId: Long;

  /** number of sale.token_in staked by a user. */
  amount: string;
}
export interface MsgWithdraw {
  /** sender is an account address subscribed to the sale_id */
  sender: string;

  /** ID of a sale. */
  saleId: Long;

  /**
   * amount of tokens_in to withdraw. Must be at most the amount of not spent
   * tokens, unless set to null - then all remaining balance will be withdrawn.
   */
  amount?: string;
}
export interface MsgExitSale {
  /** sender is an account address exiting a sale */
  sender: string;

  /** ID of an existing sale. */
  saleId: Long;
}
export interface MsgExitSaleResponse {
  /** Purchased amount of "out" tokens withdrawn to the user. */
  purchased: string;
}
export interface MsgFinalizeSale {
  /** sender is an account signing the message and triggering the finalization. */
  sender: string;

  /** ID of an existing sale. */
  saleId: Long;
}
export interface MsgFinalizeSaleResponse {
  /** Income amount of token_in sent to the sale recipient. */
  income: string;
}

function createBaseMsgCreateSale(): MsgCreateSale {
  return {
    creator: "",
    tokenIn: "",
    tokenOut: undefined,
    maxFee: [],
    startTime: undefined,
    duration: undefined,
    recipient: "",
    name: "",
    url: ""
  };
}

export const MsgCreateSale = {
  encode(message: MsgCreateSale, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.creator !== "") {
      writer.uint32(10).string(message.creator);
    }

    if (message.tokenIn !== "") {
      writer.uint32(18).string(message.tokenIn);
    }

    if (message.tokenOut !== undefined) {
      Coin.encode(message.tokenOut, writer.uint32(26).fork()).ldelim();
    }

    for (const v of message.maxFee) {
      Coin.encode(v!, writer.uint32(34).fork()).ldelim();
    }

    if (message.startTime !== undefined) {
      Timestamp.encode(toTimestamp(message.startTime), writer.uint32(42).fork()).ldelim();
    }

    if (message.duration !== undefined) {
      Duration.encode(message.duration, writer.uint32(50).fork()).ldelim();
    }

    if (message.recipient !== "") {
      writer.uint32(58).string(message.recipient);
    }

    if (message.name !== "") {
      writer.uint32(66).string(message.name);
    }

    if (message.url !== "") {
      writer.uint32(74).string(message.url);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateSale {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateSale();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;

        case 2:
          message.tokenIn = reader.string();
          break;

        case 3:
          message.tokenOut = Coin.decode(reader, reader.uint32());
          break;

        case 4:
          message.maxFee.push(Coin.decode(reader, reader.uint32()));
          break;

        case 5:
          message.startTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        case 6:
          message.duration = Duration.decode(reader, reader.uint32());
          break;

        case 7:
          message.recipient = reader.string();
          break;

        case 8:
          message.name = reader.string();
          break;

        case 9:
          message.url = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgCreateSale {
    return {
      creator: isSet(object.creator) ? String(object.creator) : "",
      tokenIn: isSet(object.tokenIn) ? String(object.tokenIn) : "",
      tokenOut: isSet(object.tokenOut) ? Coin.fromJSON(object.tokenOut) : undefined,
      maxFee: Array.isArray(object?.maxFee) ? object.maxFee.map((e: any) => Coin.fromJSON(e)) : [],
      startTime: isSet(object.startTime) ? fromJsonTimestamp(object.startTime) : undefined,
      duration: isSet(object.duration) ? Duration.fromJSON(object.duration) : undefined,
      recipient: isSet(object.recipient) ? String(object.recipient) : "",
      name: isSet(object.name) ? String(object.name) : "",
      url: isSet(object.url) ? String(object.url) : ""
    };
  },

  toJSON(message: MsgCreateSale): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.tokenIn !== undefined && (obj.tokenIn = message.tokenIn);
    message.tokenOut !== undefined && (obj.tokenOut = message.tokenOut ? Coin.toJSON(message.tokenOut) : undefined);

    if (message.maxFee) {
      obj.maxFee = message.maxFee.map(e => e ? Coin.toJSON(e) : undefined);
    } else {
      obj.maxFee = [];
    }

    message.startTime !== undefined && (obj.startTime = message.startTime.toISOString());
    message.duration !== undefined && (obj.duration = message.duration);
    message.recipient !== undefined && (obj.recipient = message.recipient);
    message.name !== undefined && (obj.name = message.name);
    message.url !== undefined && (obj.url = message.url);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgCreateSale>): MsgCreateSale {
    const message = createBaseMsgCreateSale();
    message.creator = object.creator ?? "";
    message.tokenIn = object.tokenIn ?? "";
    message.tokenOut = object.tokenOut !== undefined && object.tokenOut !== null ? Coin.fromPartial(object.tokenOut) : undefined;
    message.maxFee = object.maxFee?.map(e => Coin.fromPartial(e)) || [];
    message.startTime = object.startTime ?? undefined;
    message.duration = object.duration ?? undefined;
    message.recipient = object.recipient ?? "";
    message.name = object.name ?? "";
    message.url = object.url ?? "";
    return message;
  }

};

function createBaseMsgCreateSaleResponse(): MsgCreateSaleResponse {
  return {
    saleId: Long.UZERO
  };
}

export const MsgCreateSaleResponse = {
  encode(message: MsgCreateSaleResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.saleId.isZero()) {
      writer.uint32(8).uint64(message.saleId);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateSaleResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateSaleResponse();

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

  fromJSON(object: any): MsgCreateSaleResponse {
    return {
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO
    };
  },

  toJSON(message: MsgCreateSaleResponse): unknown {
    const obj: any = {};
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<MsgCreateSaleResponse>): MsgCreateSaleResponse {
    const message = createBaseMsgCreateSaleResponse();
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    return message;
  }

};

function createBaseMsgSubscribe(): MsgSubscribe {
  return {
    sender: "",
    saleId: Long.UZERO,
    amount: ""
  };
}

export const MsgSubscribe = {
  encode(message: MsgSubscribe, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSubscribe {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubscribe();

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

  fromJSON(object: any): MsgSubscribe {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO,
      amount: isSet(object.amount) ? String(object.amount) : ""
    };
  },

  toJSON(message: MsgSubscribe): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    message.amount !== undefined && (obj.amount = message.amount);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgSubscribe>): MsgSubscribe {
    const message = createBaseMsgSubscribe();
    message.sender = object.sender ?? "";
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    message.amount = object.amount ?? "";
    return message;
  }

};

function createBaseMsgWithdraw(): MsgWithdraw {
  return {
    sender: "",
    saleId: Long.UZERO,
    amount: undefined
  };
}

export const MsgWithdraw = {
  encode(message: MsgWithdraw, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }

    if (!message.saleId.isZero()) {
      writer.uint32(16).uint64(message.saleId);
    }

    if (message.amount !== undefined) {
      writer.uint32(26).string(message.amount);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWithdraw {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdraw();

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

  fromJSON(object: any): MsgWithdraw {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO,
      amount: isSet(object.amount) ? String(object.amount) : undefined
    };
  },

  toJSON(message: MsgWithdraw): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    message.amount !== undefined && (obj.amount = message.amount);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgWithdraw>): MsgWithdraw {
    const message = createBaseMsgWithdraw();
    message.sender = object.sender ?? "";
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    message.amount = object.amount ?? undefined;
    return message;
  }

};

function createBaseMsgExitSale(): MsgExitSale {
  return {
    sender: "",
    saleId: Long.UZERO
  };
}

export const MsgExitSale = {
  encode(message: MsgExitSale, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }

    if (!message.saleId.isZero()) {
      writer.uint32(16).uint64(message.saleId);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExitSale {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExitSale();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;

        case 2:
          message.saleId = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgExitSale {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO
    };
  },

  toJSON(message: MsgExitSale): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<MsgExitSale>): MsgExitSale {
    const message = createBaseMsgExitSale();
    message.sender = object.sender ?? "";
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    return message;
  }

};

function createBaseMsgExitSaleResponse(): MsgExitSaleResponse {
  return {
    purchased: ""
  };
}

export const MsgExitSaleResponse = {
  encode(message: MsgExitSaleResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.purchased !== "") {
      writer.uint32(10).string(message.purchased);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExitSaleResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExitSaleResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.purchased = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgExitSaleResponse {
    return {
      purchased: isSet(object.purchased) ? String(object.purchased) : ""
    };
  },

  toJSON(message: MsgExitSaleResponse): unknown {
    const obj: any = {};
    message.purchased !== undefined && (obj.purchased = message.purchased);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgExitSaleResponse>): MsgExitSaleResponse {
    const message = createBaseMsgExitSaleResponse();
    message.purchased = object.purchased ?? "";
    return message;
  }

};

function createBaseMsgFinalizeSale(): MsgFinalizeSale {
  return {
    sender: "",
    saleId: Long.UZERO
  };
}

export const MsgFinalizeSale = {
  encode(message: MsgFinalizeSale, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }

    if (!message.saleId.isZero()) {
      writer.uint32(16).uint64(message.saleId);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgFinalizeSale {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgFinalizeSale();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;

        case 2:
          message.saleId = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgFinalizeSale {
    return {
      sender: isSet(object.sender) ? String(object.sender) : "",
      saleId: isSet(object.saleId) ? Long.fromString(object.saleId) : Long.UZERO
    };
  },

  toJSON(message: MsgFinalizeSale): unknown {
    const obj: any = {};
    message.sender !== undefined && (obj.sender = message.sender);
    message.saleId !== undefined && (obj.saleId = (message.saleId || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<MsgFinalizeSale>): MsgFinalizeSale {
    const message = createBaseMsgFinalizeSale();
    message.sender = object.sender ?? "";
    message.saleId = object.saleId !== undefined && object.saleId !== null ? Long.fromValue(object.saleId) : Long.UZERO;
    return message;
  }

};

function createBaseMsgFinalizeSaleResponse(): MsgFinalizeSaleResponse {
  return {
    income: ""
  };
}

export const MsgFinalizeSaleResponse = {
  encode(message: MsgFinalizeSaleResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.income !== "") {
      writer.uint32(10).string(message.income);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgFinalizeSaleResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgFinalizeSaleResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.income = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgFinalizeSaleResponse {
    return {
      income: isSet(object.income) ? String(object.income) : ""
    };
  },

  toJSON(message: MsgFinalizeSaleResponse): unknown {
    const obj: any = {};
    message.income !== undefined && (obj.income = message.income);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgFinalizeSaleResponse>): MsgFinalizeSaleResponse {
    const message = createBaseMsgFinalizeSaleResponse();
    message.income = object.income ?? "";
    return message;
  }

};