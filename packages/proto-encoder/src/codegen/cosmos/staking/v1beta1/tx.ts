//@ts-nocheck
/* eslint-disable */
import {
  Description,
  DescriptionAmino,
  DescriptionSDKType,
  CommissionRates,
  CommissionRatesAmino,
  CommissionRatesSDKType,
} from "./staking";
import {
  Any,
  AnyProtoMsg,
  AnyAmino,
  AnySDKType,
} from "../../../google/protobuf/any";
import { Coin, CoinAmino, CoinSDKType } from "../../base/v1beta1/coin";
import { Timestamp } from "../../../google/protobuf/timestamp";
import * as _m0 from "protobufjs/minimal";
import { toBase64, fromBase64 } from "@cosmjs/encoding";
import { encodeBech32Pubkey, decodeBech32Pubkey } from "@cosmjs/amino";
import { toTimestamp, fromTimestamp } from "../../../helpers";
/** MsgCreateValidator defines a SDK message for creating a new validator. */
export interface MsgCreateValidator {
  description?: Description;
  commission?: CommissionRates;
  minSelfDelegation: string;
  delegatorAddress: string;
  validatorAddress: string;
  pubkey?: Any | undefined;
  value?: Coin;
}
export interface MsgCreateValidatorProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidator";
  value: Uint8Array;
}
export type MsgCreateValidatorEncoded = Omit<MsgCreateValidator, "pubkey"> & {
  pubkey?: AnyProtoMsg | undefined;
};
/** MsgCreateValidator defines a SDK message for creating a new validator. */
export interface MsgCreateValidatorAmino {
  description?: DescriptionAmino;
  commission?: CommissionRatesAmino;
  min_self_delegation: string;
  delegator_address: string;
  validator_address: string;
  pubkey?: AnyAmino;
  value?: CoinAmino;
}
export interface MsgCreateValidatorAminoMsg {
  type: "cosmos-sdk/MsgCreateValidator";
  value: MsgCreateValidatorAmino;
}
/** MsgCreateValidator defines a SDK message for creating a new validator. */
export interface MsgCreateValidatorSDKType {
  description?: DescriptionSDKType;
  commission?: CommissionRatesSDKType;
  min_self_delegation: string;
  delegator_address: string;
  validator_address: string;
  pubkey?: AnySDKType | undefined;
  value?: CoinSDKType;
}
/** MsgCreateValidatorResponse defines the Msg/CreateValidator response type. */
export interface MsgCreateValidatorResponse {}
export interface MsgCreateValidatorResponseProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidatorResponse";
  value: Uint8Array;
}
/** MsgCreateValidatorResponse defines the Msg/CreateValidator response type. */
export interface MsgCreateValidatorResponseAmino {}
export interface MsgCreateValidatorResponseAminoMsg {
  type: "cosmos-sdk/MsgCreateValidatorResponse";
  value: MsgCreateValidatorResponseAmino;
}
/** MsgCreateValidatorResponse defines the Msg/CreateValidator response type. */
export interface MsgCreateValidatorResponseSDKType {}
/** MsgEditValidator defines a SDK message for editing an existing validator. */
export interface MsgEditValidator {
  description?: Description;
  validatorAddress: string;
  /**
   * We pass a reference to the new commission rate and min self delegation as
   * it's not mandatory to update. If not updated, the deserialized rate will be
   * zero with no way to distinguish if an update was intended.
   * REF: #2373
   */
  commissionRate: string;
  minSelfDelegation: string;
}
export interface MsgEditValidatorProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgEditValidator";
  value: Uint8Array;
}
/** MsgEditValidator defines a SDK message for editing an existing validator. */
export interface MsgEditValidatorAmino {
  description?: DescriptionAmino;
  validator_address: string;
  /**
   * We pass a reference to the new commission rate and min self delegation as
   * it's not mandatory to update. If not updated, the deserialized rate will be
   * zero with no way to distinguish if an update was intended.
   * REF: #2373
   */
  commission_rate: string;
  min_self_delegation: string;
}
export interface MsgEditValidatorAminoMsg {
  type: "cosmos-sdk/MsgEditValidator";
  value: MsgEditValidatorAmino;
}
/** MsgEditValidator defines a SDK message for editing an existing validator. */
export interface MsgEditValidatorSDKType {
  description?: DescriptionSDKType;
  validator_address: string;
  commission_rate: string;
  min_self_delegation: string;
}
/** MsgEditValidatorResponse defines the Msg/EditValidator response type. */
export interface MsgEditValidatorResponse {}
export interface MsgEditValidatorResponseProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgEditValidatorResponse";
  value: Uint8Array;
}
/** MsgEditValidatorResponse defines the Msg/EditValidator response type. */
export interface MsgEditValidatorResponseAmino {}
export interface MsgEditValidatorResponseAminoMsg {
  type: "cosmos-sdk/MsgEditValidatorResponse";
  value: MsgEditValidatorResponseAmino;
}
/** MsgEditValidatorResponse defines the Msg/EditValidator response type. */
export interface MsgEditValidatorResponseSDKType {}
/**
 * MsgDelegate defines a SDK message for performing a delegation of coins
 * from a delegator to a validator.
 */
export interface MsgDelegate {
  delegatorAddress: string;
  validatorAddress: string;
  amount?: Coin;
}
export interface MsgDelegateProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgDelegate";
  value: Uint8Array;
}
/**
 * MsgDelegate defines a SDK message for performing a delegation of coins
 * from a delegator to a validator.
 */
export interface MsgDelegateAmino {
  delegator_address: string;
  validator_address: string;
  amount?: CoinAmino;
}
export interface MsgDelegateAminoMsg {
  type: "cosmos-sdk/MsgDelegate";
  value: MsgDelegateAmino;
}
/**
 * MsgDelegate defines a SDK message for performing a delegation of coins
 * from a delegator to a validator.
 */
export interface MsgDelegateSDKType {
  delegator_address: string;
  validator_address: string;
  amount?: CoinSDKType;
}
/** MsgDelegateResponse defines the Msg/Delegate response type. */
export interface MsgDelegateResponse {}
export interface MsgDelegateResponseProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgDelegateResponse";
  value: Uint8Array;
}
/** MsgDelegateResponse defines the Msg/Delegate response type. */
export interface MsgDelegateResponseAmino {}
export interface MsgDelegateResponseAminoMsg {
  type: "cosmos-sdk/MsgDelegateResponse";
  value: MsgDelegateResponseAmino;
}
/** MsgDelegateResponse defines the Msg/Delegate response type. */
export interface MsgDelegateResponseSDKType {}
/**
 * MsgBeginRedelegate defines a SDK message for performing a redelegation
 * of coins from a delegator and source validator to a destination validator.
 */
export interface MsgBeginRedelegate {
  delegatorAddress: string;
  validatorSrcAddress: string;
  validatorDstAddress: string;
  amount?: Coin;
}
export interface MsgBeginRedelegateProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate";
  value: Uint8Array;
}
/**
 * MsgBeginRedelegate defines a SDK message for performing a redelegation
 * of coins from a delegator and source validator to a destination validator.
 */
export interface MsgBeginRedelegateAmino {
  delegator_address: string;
  validator_src_address: string;
  validator_dst_address: string;
  amount?: CoinAmino;
}
export interface MsgBeginRedelegateAminoMsg {
  type: "cosmos-sdk/MsgBeginRedelegate";
  value: MsgBeginRedelegateAmino;
}
/**
 * MsgBeginRedelegate defines a SDK message for performing a redelegation
 * of coins from a delegator and source validator to a destination validator.
 */
export interface MsgBeginRedelegateSDKType {
  delegator_address: string;
  validator_src_address: string;
  validator_dst_address: string;
  amount?: CoinSDKType;
}
/** MsgBeginRedelegateResponse defines the Msg/BeginRedelegate response type. */
export interface MsgBeginRedelegateResponse {
  completionTime?: Date;
}
export interface MsgBeginRedelegateResponseProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegateResponse";
  value: Uint8Array;
}
/** MsgBeginRedelegateResponse defines the Msg/BeginRedelegate response type. */
export interface MsgBeginRedelegateResponseAmino {
  completion_time?: Date;
}
export interface MsgBeginRedelegateResponseAminoMsg {
  type: "cosmos-sdk/MsgBeginRedelegateResponse";
  value: MsgBeginRedelegateResponseAmino;
}
/** MsgBeginRedelegateResponse defines the Msg/BeginRedelegate response type. */
export interface MsgBeginRedelegateResponseSDKType {
  completion_time?: Date;
}
/**
 * MsgUndelegate defines a SDK message for performing an undelegation from a
 * delegate and a validator.
 */
export interface MsgUndelegate {
  delegatorAddress: string;
  validatorAddress: string;
  amount?: Coin;
}
export interface MsgUndelegateProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate";
  value: Uint8Array;
}
/**
 * MsgUndelegate defines a SDK message for performing an undelegation from a
 * delegate and a validator.
 */
export interface MsgUndelegateAmino {
  delegator_address: string;
  validator_address: string;
  amount?: CoinAmino;
}
export interface MsgUndelegateAminoMsg {
  type: "cosmos-sdk/MsgUndelegate";
  value: MsgUndelegateAmino;
}
/**
 * MsgUndelegate defines a SDK message for performing an undelegation from a
 * delegate and a validator.
 */
export interface MsgUndelegateSDKType {
  delegator_address: string;
  validator_address: string;
  amount?: CoinSDKType;
}
/** MsgUndelegateResponse defines the Msg/Undelegate response type. */
export interface MsgUndelegateResponse {
  completionTime?: Date;
}
export interface MsgUndelegateResponseProtoMsg {
  typeUrl: "/cosmos.staking.v1beta1.MsgUndelegateResponse";
  value: Uint8Array;
}
/** MsgUndelegateResponse defines the Msg/Undelegate response type. */
export interface MsgUndelegateResponseAmino {
  completion_time?: Date;
}
export interface MsgUndelegateResponseAminoMsg {
  type: "cosmos-sdk/MsgUndelegateResponse";
  value: MsgUndelegateResponseAmino;
}
/** MsgUndelegateResponse defines the Msg/Undelegate response type. */
export interface MsgUndelegateResponseSDKType {
  completion_time?: Date;
}
function createBaseMsgCreateValidator(): MsgCreateValidator {
  return {
    description: undefined,
    commission: undefined,
    minSelfDelegation: "",
    delegatorAddress: "",
    validatorAddress: "",
    pubkey: undefined,
    value: undefined,
  };
}
export const MsgCreateValidator = {
  typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidator",
  encode(
    message: MsgCreateValidator,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.description !== undefined) {
      Description.encode(
        message.description,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.commission !== undefined) {
      CommissionRates.encode(
        message.commission,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.minSelfDelegation !== "") {
      writer.uint32(26).string(message.minSelfDelegation);
    }
    if (message.delegatorAddress !== "") {
      writer.uint32(34).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(42).string(message.validatorAddress);
    }
    if (message.pubkey !== undefined) {
      Any.encode(message.pubkey as Any, writer.uint32(50).fork()).ldelim();
    }
    if (message.value !== undefined) {
      Coin.encode(message.value, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateValidator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.description = Description.decode(reader, reader.uint32());
          break;
        case 2:
          message.commission = CommissionRates.decode(reader, reader.uint32());
          break;
        case 3:
          message.minSelfDelegation = reader.string();
          break;
        case 4:
          message.delegatorAddress = reader.string();
          break;
        case 5:
          message.validatorAddress = reader.string();
          break;
        case 6:
          message.pubkey = Cosmos_cryptoPubKey_InterfaceDecoder(reader) as Any;
          break;
        case 7:
          message.value = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateValidator>): MsgCreateValidator {
    const message = createBaseMsgCreateValidator();
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    message.commission =
      object.commission !== undefined && object.commission !== null
        ? CommissionRates.fromPartial(object.commission)
        : undefined;
    message.minSelfDelegation = object.minSelfDelegation ?? "";
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    message.pubkey =
      object.pubkey !== undefined && object.pubkey !== null
        ? Any.fromPartial(object.pubkey)
        : undefined;
    message.value =
      object.value !== undefined && object.value !== null
        ? Coin.fromPartial(object.value)
        : undefined;
    return message;
  },
  fromAmino(object: MsgCreateValidatorAmino): MsgCreateValidator {
    return {
      description: object?.description
        ? Description.fromAmino(object.description)
        : undefined,
      commission: object?.commission
        ? CommissionRates.fromAmino(object.commission)
        : undefined,
      minSelfDelegation: object.min_self_delegation,
      delegatorAddress: object.delegator_address,
      validatorAddress: object.validator_address,
      pubkey: encodeBech32Pubkey(
        {
          type: "tendermint/PubKeySecp256k1",
          value: toBase64(object.pubkey.value),
        },
        "cosmos"
      ),
      value: object?.value ? Coin.fromAmino(object.value) : undefined,
    };
  },
  toAmino(message: MsgCreateValidator): MsgCreateValidatorAmino {
    const obj: any = {};
    obj.description = message.description
      ? Description.toAmino(message.description)
      : undefined;
    obj.commission = message.commission
      ? CommissionRates.toAmino(message.commission)
      : undefined;
    obj.min_self_delegation = message.minSelfDelegation;
    obj.delegator_address = message.delegatorAddress;
    obj.validator_address = message.validatorAddress;
    obj.pubkey = message.pubkey
      ? {
          typeUrl: "/cosmos.crypto.secp256k1.PubKey",
          value: fromBase64(decodeBech32Pubkey(message.pubkey).value),
        }
      : undefined;
    obj.value = message.value ? Coin.toAmino(message.value) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateValidatorAminoMsg): MsgCreateValidator {
    return MsgCreateValidator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateValidator): MsgCreateValidatorAminoMsg {
    return {
      type: "cosmos-sdk/MsgCreateValidator",
      value: MsgCreateValidator.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateValidatorProtoMsg): MsgCreateValidator {
    return MsgCreateValidator.decode(message.value);
  },
  toProto(message: MsgCreateValidator): Uint8Array {
    return MsgCreateValidator.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateValidator): MsgCreateValidatorProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidator",
      value: MsgCreateValidator.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateValidatorResponse(): MsgCreateValidatorResponse {
  return {};
}
export const MsgCreateValidatorResponse = {
  typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidatorResponse",
  encode(
    _: MsgCreateValidatorResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateValidatorResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateValidatorResponse();
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
    _: Partial<MsgCreateValidatorResponse>
  ): MsgCreateValidatorResponse {
    const message = createBaseMsgCreateValidatorResponse();
    return message;
  },
  fromAmino(_: MsgCreateValidatorResponseAmino): MsgCreateValidatorResponse {
    return {};
  },
  toAmino(_: MsgCreateValidatorResponse): MsgCreateValidatorResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateValidatorResponseAminoMsg
  ): MsgCreateValidatorResponse {
    return MsgCreateValidatorResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreateValidatorResponse
  ): MsgCreateValidatorResponseAminoMsg {
    return {
      type: "cosmos-sdk/MsgCreateValidatorResponse",
      value: MsgCreateValidatorResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateValidatorResponseProtoMsg
  ): MsgCreateValidatorResponse {
    return MsgCreateValidatorResponse.decode(message.value);
  },
  toProto(message: MsgCreateValidatorResponse): Uint8Array {
    return MsgCreateValidatorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateValidatorResponse
  ): MsgCreateValidatorResponseProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidatorResponse",
      value: MsgCreateValidatorResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgEditValidator(): MsgEditValidator {
  return {
    description: undefined,
    validatorAddress: "",
    commissionRate: "",
    minSelfDelegation: "",
  };
}
export const MsgEditValidator = {
  typeUrl: "/cosmos.staking.v1beta1.MsgEditValidator",
  encode(
    message: MsgEditValidator,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.description !== undefined) {
      Description.encode(
        message.description,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.validatorAddress !== "") {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.commissionRate !== "") {
      writer.uint32(26).string(message.commissionRate);
    }
    if (message.minSelfDelegation !== "") {
      writer.uint32(34).string(message.minSelfDelegation);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgEditValidator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEditValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.description = Description.decode(reader, reader.uint32());
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.commissionRate = reader.string();
          break;
        case 4:
          message.minSelfDelegation = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgEditValidator>): MsgEditValidator {
    const message = createBaseMsgEditValidator();
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    message.validatorAddress = object.validatorAddress ?? "";
    message.commissionRate = object.commissionRate ?? "";
    message.minSelfDelegation = object.minSelfDelegation ?? "";
    return message;
  },
  fromAmino(object: MsgEditValidatorAmino): MsgEditValidator {
    return {
      description: object?.description
        ? Description.fromAmino(object.description)
        : undefined,
      validatorAddress: object.validator_address,
      commissionRate: object.commission_rate,
      minSelfDelegation: object.min_self_delegation,
    };
  },
  toAmino(message: MsgEditValidator): MsgEditValidatorAmino {
    const obj: any = {};
    obj.description = message.description
      ? Description.toAmino(message.description)
      : undefined;
    obj.validator_address = message.validatorAddress;
    obj.commission_rate = message.commissionRate;
    obj.min_self_delegation = message.minSelfDelegation;
    return obj;
  },
  fromAminoMsg(object: MsgEditValidatorAminoMsg): MsgEditValidator {
    return MsgEditValidator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgEditValidator): MsgEditValidatorAminoMsg {
    return {
      type: "cosmos-sdk/MsgEditValidator",
      value: MsgEditValidator.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgEditValidatorProtoMsg): MsgEditValidator {
    return MsgEditValidator.decode(message.value);
  },
  toProto(message: MsgEditValidator): Uint8Array {
    return MsgEditValidator.encode(message).finish();
  },
  toProtoMsg(message: MsgEditValidator): MsgEditValidatorProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgEditValidator",
      value: MsgEditValidator.encode(message).finish(),
    };
  },
};
function createBaseMsgEditValidatorResponse(): MsgEditValidatorResponse {
  return {};
}
export const MsgEditValidatorResponse = {
  typeUrl: "/cosmos.staking.v1beta1.MsgEditValidatorResponse",
  encode(
    _: MsgEditValidatorResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgEditValidatorResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEditValidatorResponse();
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
  fromPartial(_: Partial<MsgEditValidatorResponse>): MsgEditValidatorResponse {
    const message = createBaseMsgEditValidatorResponse();
    return message;
  },
  fromAmino(_: MsgEditValidatorResponseAmino): MsgEditValidatorResponse {
    return {};
  },
  toAmino(_: MsgEditValidatorResponse): MsgEditValidatorResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgEditValidatorResponseAminoMsg
  ): MsgEditValidatorResponse {
    return MsgEditValidatorResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgEditValidatorResponse
  ): MsgEditValidatorResponseAminoMsg {
    return {
      type: "cosmos-sdk/MsgEditValidatorResponse",
      value: MsgEditValidatorResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgEditValidatorResponseProtoMsg
  ): MsgEditValidatorResponse {
    return MsgEditValidatorResponse.decode(message.value);
  },
  toProto(message: MsgEditValidatorResponse): Uint8Array {
    return MsgEditValidatorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgEditValidatorResponse
  ): MsgEditValidatorResponseProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgEditValidatorResponse",
      value: MsgEditValidatorResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDelegate(): MsgDelegate {
  return {
    delegatorAddress: "",
    validatorAddress: "",
    amount: undefined,
  };
}
export const MsgDelegate = {
  typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
  encode(
    message: MsgDelegate,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDelegate>): MsgDelegate {
    const message = createBaseMsgDelegate();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : undefined;
    return message;
  },
  fromAmino(object: MsgDelegateAmino): MsgDelegate {
    return {
      delegatorAddress: object.delegator_address,
      validatorAddress: object.validator_address,
      amount: object?.amount ? Coin.fromAmino(object.amount) : undefined,
    };
  },
  toAmino(message: MsgDelegate): MsgDelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_address = message.validatorAddress;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgDelegateAminoMsg): MsgDelegate {
    return MsgDelegate.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDelegate): MsgDelegateAminoMsg {
    return {
      type: "cosmos-sdk/MsgDelegate",
      value: MsgDelegate.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDelegateProtoMsg): MsgDelegate {
    return MsgDelegate.decode(message.value);
  },
  toProto(message: MsgDelegate): Uint8Array {
    return MsgDelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgDelegate): MsgDelegateProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
      value: MsgDelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgDelegateResponse(): MsgDelegateResponse {
  return {};
}
export const MsgDelegateResponse = {
  typeUrl: "/cosmos.staking.v1beta1.MsgDelegateResponse",
  encode(
    _: MsgDelegateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDelegateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDelegateResponse();
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
  fromPartial(_: Partial<MsgDelegateResponse>): MsgDelegateResponse {
    const message = createBaseMsgDelegateResponse();
    return message;
  },
  fromAmino(_: MsgDelegateResponseAmino): MsgDelegateResponse {
    return {};
  },
  toAmino(_: MsgDelegateResponse): MsgDelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgDelegateResponseAminoMsg): MsgDelegateResponse {
    return MsgDelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDelegateResponse): MsgDelegateResponseAminoMsg {
    return {
      type: "cosmos-sdk/MsgDelegateResponse",
      value: MsgDelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDelegateResponseProtoMsg): MsgDelegateResponse {
    return MsgDelegateResponse.decode(message.value);
  },
  toProto(message: MsgDelegateResponse): Uint8Array {
    return MsgDelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgDelegateResponse): MsgDelegateResponseProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegateResponse",
      value: MsgDelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBeginRedelegate(): MsgBeginRedelegate {
  return {
    delegatorAddress: "",
    validatorSrcAddress: "",
    validatorDstAddress: "",
    amount: undefined,
  };
}
export const MsgBeginRedelegate = {
  typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  encode(
    message: MsgBeginRedelegate,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorSrcAddress !== "") {
      writer.uint32(18).string(message.validatorSrcAddress);
    }
    if (message.validatorDstAddress !== "") {
      writer.uint32(26).string(message.validatorDstAddress);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBeginRedelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginRedelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorSrcAddress = reader.string();
          break;
        case 3:
          message.validatorDstAddress = reader.string();
          break;
        case 4:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBeginRedelegate>): MsgBeginRedelegate {
    const message = createBaseMsgBeginRedelegate();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorSrcAddress = object.validatorSrcAddress ?? "";
    message.validatorDstAddress = object.validatorDstAddress ?? "";
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : undefined;
    return message;
  },
  fromAmino(object: MsgBeginRedelegateAmino): MsgBeginRedelegate {
    return {
      delegatorAddress: object.delegator_address,
      validatorSrcAddress: object.validator_src_address,
      validatorDstAddress: object.validator_dst_address,
      amount: object?.amount ? Coin.fromAmino(object.amount) : undefined,
    };
  },
  toAmino(message: MsgBeginRedelegate): MsgBeginRedelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_src_address = message.validatorSrcAddress;
    obj.validator_dst_address = message.validatorDstAddress;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgBeginRedelegateAminoMsg): MsgBeginRedelegate {
    return MsgBeginRedelegate.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBeginRedelegate): MsgBeginRedelegateAminoMsg {
    return {
      type: "cosmos-sdk/MsgBeginRedelegate",
      value: MsgBeginRedelegate.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBeginRedelegateProtoMsg): MsgBeginRedelegate {
    return MsgBeginRedelegate.decode(message.value);
  },
  toProto(message: MsgBeginRedelegate): Uint8Array {
    return MsgBeginRedelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgBeginRedelegate): MsgBeginRedelegateProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
      value: MsgBeginRedelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgBeginRedelegateResponse(): MsgBeginRedelegateResponse {
  return {
    completionTime: undefined,
  };
}
export const MsgBeginRedelegateResponse = {
  typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegateResponse",
  encode(
    message: MsgBeginRedelegateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.completionTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.completionTime),
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgBeginRedelegateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginRedelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.completionTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
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
    object: Partial<MsgBeginRedelegateResponse>
  ): MsgBeginRedelegateResponse {
    const message = createBaseMsgBeginRedelegateResponse();
    message.completionTime = object.completionTime ?? undefined;
    return message;
  },
  fromAmino(
    object: MsgBeginRedelegateResponseAmino
  ): MsgBeginRedelegateResponse {
    return {
      completionTime: object?.completion_time
        ? Timestamp.fromAmino(object.completion_time)
        : undefined,
    };
  },
  toAmino(
    message: MsgBeginRedelegateResponse
  ): MsgBeginRedelegateResponseAmino {
    const obj: any = {};
    obj.completion_time = message.completionTime
      ? Timestamp.toAmino(message.completionTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgBeginRedelegateResponseAminoMsg
  ): MsgBeginRedelegateResponse {
    return MsgBeginRedelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgBeginRedelegateResponse
  ): MsgBeginRedelegateResponseAminoMsg {
    return {
      type: "cosmos-sdk/MsgBeginRedelegateResponse",
      value: MsgBeginRedelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgBeginRedelegateResponseProtoMsg
  ): MsgBeginRedelegateResponse {
    return MsgBeginRedelegateResponse.decode(message.value);
  },
  toProto(message: MsgBeginRedelegateResponse): Uint8Array {
    return MsgBeginRedelegateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgBeginRedelegateResponse
  ): MsgBeginRedelegateResponseProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegateResponse",
      value: MsgBeginRedelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUndelegate(): MsgUndelegate {
  return {
    delegatorAddress: "",
    validatorAddress: "",
    amount: undefined,
  };
}
export const MsgUndelegate = {
  typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
  encode(
    message: MsgUndelegate,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUndelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUndelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUndelegate>): MsgUndelegate {
    const message = createBaseMsgUndelegate();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : undefined;
    return message;
  },
  fromAmino(object: MsgUndelegateAmino): MsgUndelegate {
    return {
      delegatorAddress: object.delegator_address,
      validatorAddress: object.validator_address,
      amount: object?.amount ? Coin.fromAmino(object.amount) : undefined,
    };
  },
  toAmino(message: MsgUndelegate): MsgUndelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_address = message.validatorAddress;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgUndelegateAminoMsg): MsgUndelegate {
    return MsgUndelegate.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUndelegate): MsgUndelegateAminoMsg {
    return {
      type: "cosmos-sdk/MsgUndelegate",
      value: MsgUndelegate.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUndelegateProtoMsg): MsgUndelegate {
    return MsgUndelegate.decode(message.value);
  },
  toProto(message: MsgUndelegate): Uint8Array {
    return MsgUndelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgUndelegate): MsgUndelegateProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
      value: MsgUndelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgUndelegateResponse(): MsgUndelegateResponse {
  return {
    completionTime: undefined,
  };
}
export const MsgUndelegateResponse = {
  typeUrl: "/cosmos.staking.v1beta1.MsgUndelegateResponse",
  encode(
    message: MsgUndelegateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.completionTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.completionTime),
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUndelegateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUndelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.completionTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUndelegateResponse>): MsgUndelegateResponse {
    const message = createBaseMsgUndelegateResponse();
    message.completionTime = object.completionTime ?? undefined;
    return message;
  },
  fromAmino(object: MsgUndelegateResponseAmino): MsgUndelegateResponse {
    return {
      completionTime: object?.completion_time
        ? Timestamp.fromAmino(object.completion_time)
        : undefined,
    };
  },
  toAmino(message: MsgUndelegateResponse): MsgUndelegateResponseAmino {
    const obj: any = {};
    obj.completion_time = message.completionTime
      ? Timestamp.toAmino(message.completionTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgUndelegateResponseAminoMsg): MsgUndelegateResponse {
    return MsgUndelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUndelegateResponse): MsgUndelegateResponseAminoMsg {
    return {
      type: "cosmos-sdk/MsgUndelegateResponse",
      value: MsgUndelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUndelegateResponseProtoMsg): MsgUndelegateResponse {
    return MsgUndelegateResponse.decode(message.value);
  },
  toProto(message: MsgUndelegateResponse): Uint8Array {
    return MsgUndelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUndelegateResponse): MsgUndelegateResponseProtoMsg {
    return {
      typeUrl: "/cosmos.staking.v1beta1.MsgUndelegateResponse",
      value: MsgUndelegateResponse.encode(message).finish(),
    };
  },
};
export const Cosmos_cryptoPubKey_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    default:
      return data;
  }
};
export const Cosmos_cryptoPubKey_FromAmino = (content: AnyAmino) => {
  return encodeBech32Pubkey(
    {
      type: "tendermint/PubKeySecp256k1",
      value: toBase64(content.value),
    },
    "cosmos"
  );
};
export const Cosmos_cryptoPubKey_ToAmino = (content: Any) => {
  return {
    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
    value: fromBase64(decodeBech32Pubkey(content).value),
  };
};
