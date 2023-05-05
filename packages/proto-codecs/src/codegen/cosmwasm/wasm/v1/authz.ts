//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import {
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../../google/protobuf/any";
import { Long } from "../../../helpers";
/**
 * ContractExecutionAuthorization defines authorization for wasm execute.
 * Since: wasmd 0.30
 */
export interface ContractExecutionAuthorization {
  $typeUrl?: string;
  /** Grants for contract executions */
  grants: ContractGrant[];
}
export interface ContractExecutionAuthorizationProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization";
  value: Uint8Array;
}
/**
 * ContractExecutionAuthorization defines authorization for wasm execute.
 * Since: wasmd 0.30
 */
export interface ContractExecutionAuthorizationAmino {
  /** Grants for contract executions */
  grants: ContractGrantAmino[];
}
export interface ContractExecutionAuthorizationAminoMsg {
  type: "wasm/ContractExecutionAuthorization";
  value: ContractExecutionAuthorizationAmino;
}
/**
 * ContractExecutionAuthorization defines authorization for wasm execute.
 * Since: wasmd 0.30
 */
export interface ContractExecutionAuthorizationSDKType {
  $typeUrl?: string;
  grants: ContractGrantSDKType[];
}
/**
 * ContractMigrationAuthorization defines authorization for wasm contract
 * migration. Since: wasmd 0.30
 */
export interface ContractMigrationAuthorization {
  $typeUrl?: string;
  /** Grants for contract migrations */
  grants: ContractGrant[];
}
export interface ContractMigrationAuthorizationProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.ContractMigrationAuthorization";
  value: Uint8Array;
}
/**
 * ContractMigrationAuthorization defines authorization for wasm contract
 * migration. Since: wasmd 0.30
 */
export interface ContractMigrationAuthorizationAmino {
  /** Grants for contract migrations */
  grants: ContractGrantAmino[];
}
export interface ContractMigrationAuthorizationAminoMsg {
  type: "wasm/ContractMigrationAuthorization";
  value: ContractMigrationAuthorizationAmino;
}
/**
 * ContractMigrationAuthorization defines authorization for wasm contract
 * migration. Since: wasmd 0.30
 */
export interface ContractMigrationAuthorizationSDKType {
  $typeUrl?: string;
  grants: ContractGrantSDKType[];
}
/**
 * ContractGrant a granted permission for a single contract
 * Since: wasmd 0.30
 */
export interface ContractGrant {
  /** Contract is the bech32 address of the smart contract */
  contract: string;
  /**
   * Limit defines execution limits that are enforced and updated when the grant
   * is applied. When the limit lapsed the grant is removed.
   */
  limit?: (MaxCallsLimit & MaxFundsLimit & CombinedLimit & Any) | undefined;
  /**
   * Filter define more fine-grained control on the message payload passed
   * to the contract in the operation. When no filter applies on execution, the
   * operation is prohibited.
   */
  filter?:
    | (AllowAllMessagesFilter &
        AcceptedMessageKeysFilter &
        AcceptedMessagesFilter &
        Any)
    | undefined;
}
export interface ContractGrantProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.ContractGrant";
  value: Uint8Array;
}
export type ContractGrantEncoded = Omit<ContractGrant, "limit" | "filter"> & {
  /**
   * Limit defines execution limits that are enforced and updated when the grant
   * is applied. When the limit lapsed the grant is removed.
   */
  limit?:
    | MaxCallsLimitProtoMsg
    | MaxFundsLimitProtoMsg
    | CombinedLimitProtoMsg
    | AnyProtoMsg
    | undefined;
  /**
   * Filter define more fine-grained control on the message payload passed
   * to the contract in the operation. When no filter applies on execution, the
   * operation is prohibited.
   */
  filter?:
    | AllowAllMessagesFilterProtoMsg
    | AcceptedMessageKeysFilterProtoMsg
    | AcceptedMessagesFilterProtoMsg
    | AnyProtoMsg
    | undefined;
};
/**
 * ContractGrant a granted permission for a single contract
 * Since: wasmd 0.30
 */
export interface ContractGrantAmino {
  /** Contract is the bech32 address of the smart contract */
  contract: string;
  /**
   * Limit defines execution limits that are enforced and updated when the grant
   * is applied. When the limit lapsed the grant is removed.
   */
  limit?: AnyAmino;
  /**
   * Filter define more fine-grained control on the message payload passed
   * to the contract in the operation. When no filter applies on execution, the
   * operation is prohibited.
   */
  filter?: AnyAmino;
}
export interface ContractGrantAminoMsg {
  type: "wasm/ContractGrant";
  value: ContractGrantAmino;
}
/**
 * ContractGrant a granted permission for a single contract
 * Since: wasmd 0.30
 */
export interface ContractGrantSDKType {
  contract: string;
  limit?:
    | MaxCallsLimitSDKType
    | MaxFundsLimitSDKType
    | CombinedLimitSDKType
    | AnySDKType
    | undefined;
  filter?:
    | AllowAllMessagesFilterSDKType
    | AcceptedMessageKeysFilterSDKType
    | AcceptedMessagesFilterSDKType
    | AnySDKType
    | undefined;
}
/**
 * MaxCallsLimit limited number of calls to the contract. No funds transferable.
 * Since: wasmd 0.30
 */
export interface MaxCallsLimit {
  $typeUrl?: string;
  /** Remaining number that is decremented on each execution */
  remaining: Long;
}
export interface MaxCallsLimitProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.MaxCallsLimit";
  value: Uint8Array;
}
/**
 * MaxCallsLimit limited number of calls to the contract. No funds transferable.
 * Since: wasmd 0.30
 */
export interface MaxCallsLimitAmino {
  /** Remaining number that is decremented on each execution */
  remaining: string;
}
export interface MaxCallsLimitAminoMsg {
  type: "wasm/MaxCallsLimit";
  value: MaxCallsLimitAmino;
}
/**
 * MaxCallsLimit limited number of calls to the contract. No funds transferable.
 * Since: wasmd 0.30
 */
export interface MaxCallsLimitSDKType {
  $typeUrl?: string;
  remaining: Long;
}
/**
 * MaxFundsLimit defines the maximal amounts that can be sent to the contract.
 * Since: wasmd 0.30
 */
export interface MaxFundsLimit {
  $typeUrl?: string;
  /** Amounts is the maximal amount of tokens transferable to the contract. */
  amounts: Coin[];
}
export interface MaxFundsLimitProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.MaxFundsLimit";
  value: Uint8Array;
}
/**
 * MaxFundsLimit defines the maximal amounts that can be sent to the contract.
 * Since: wasmd 0.30
 */
export interface MaxFundsLimitAmino {
  /** Amounts is the maximal amount of tokens transferable to the contract. */
  amounts: CoinAmino[];
}
export interface MaxFundsLimitAminoMsg {
  type: "wasm/MaxFundsLimit";
  value: MaxFundsLimitAmino;
}
/**
 * MaxFundsLimit defines the maximal amounts that can be sent to the contract.
 * Since: wasmd 0.30
 */
export interface MaxFundsLimitSDKType {
  $typeUrl?: string;
  amounts: CoinSDKType[];
}
/**
 * CombinedLimit defines the maximal amounts that can be sent to a contract and
 * the maximal number of calls executable. Both need to remain >0 to be valid.
 * Since: wasmd 0.30
 */
export interface CombinedLimit {
  $typeUrl?: string;
  /** Remaining number that is decremented on each execution */
  callsRemaining: Long;
  /** Amounts is the maximal amount of tokens transferable to the contract. */
  amounts: Coin[];
}
export interface CombinedLimitProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.CombinedLimit";
  value: Uint8Array;
}
/**
 * CombinedLimit defines the maximal amounts that can be sent to a contract and
 * the maximal number of calls executable. Both need to remain >0 to be valid.
 * Since: wasmd 0.30
 */
export interface CombinedLimitAmino {
  /** Remaining number that is decremented on each execution */
  calls_remaining: string;
  /** Amounts is the maximal amount of tokens transferable to the contract. */
  amounts: CoinAmino[];
}
export interface CombinedLimitAminoMsg {
  type: "wasm/CombinedLimit";
  value: CombinedLimitAmino;
}
/**
 * CombinedLimit defines the maximal amounts that can be sent to a contract and
 * the maximal number of calls executable. Both need to remain >0 to be valid.
 * Since: wasmd 0.30
 */
export interface CombinedLimitSDKType {
  $typeUrl?: string;
  calls_remaining: Long;
  amounts: CoinSDKType[];
}
/**
 * AllowAllMessagesFilter is a wildcard to allow any type of contract payload
 * message.
 * Since: wasmd 0.30
 */
export interface AllowAllMessagesFilter {
  $typeUrl?: string;
}
export interface AllowAllMessagesFilterProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.AllowAllMessagesFilter";
  value: Uint8Array;
}
/**
 * AllowAllMessagesFilter is a wildcard to allow any type of contract payload
 * message.
 * Since: wasmd 0.30
 */
export interface AllowAllMessagesFilterAmino {}
export interface AllowAllMessagesFilterAminoMsg {
  type: "wasm/AllowAllMessagesFilter";
  value: AllowAllMessagesFilterAmino;
}
/**
 * AllowAllMessagesFilter is a wildcard to allow any type of contract payload
 * message.
 * Since: wasmd 0.30
 */
export interface AllowAllMessagesFilterSDKType {
  $typeUrl?: string;
}
/**
 * AcceptedMessageKeysFilter accept only the specific contract message keys in
 * the json object to be executed.
 * Since: wasmd 0.30
 */
export interface AcceptedMessageKeysFilter {
  $typeUrl?: string;
  /** Messages is the list of unique keys */
  keys: string[];
}
export interface AcceptedMessageKeysFilterProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter";
  value: Uint8Array;
}
/**
 * AcceptedMessageKeysFilter accept only the specific contract message keys in
 * the json object to be executed.
 * Since: wasmd 0.30
 */
export interface AcceptedMessageKeysFilterAmino {
  /** Messages is the list of unique keys */
  keys: string[];
}
export interface AcceptedMessageKeysFilterAminoMsg {
  type: "wasm/AcceptedMessageKeysFilter";
  value: AcceptedMessageKeysFilterAmino;
}
/**
 * AcceptedMessageKeysFilter accept only the specific contract message keys in
 * the json object to be executed.
 * Since: wasmd 0.30
 */
export interface AcceptedMessageKeysFilterSDKType {
  $typeUrl?: string;
  keys: string[];
}
/**
 * AcceptedMessagesFilter accept only the specific raw contract messages to be
 * executed.
 * Since: wasmd 0.30
 */
export interface AcceptedMessagesFilter {
  $typeUrl?: string;
  /** Messages is the list of raw contract messages */
  messages: Uint8Array[];
}
export interface AcceptedMessagesFilterProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.AcceptedMessagesFilter";
  value: Uint8Array;
}
/**
 * AcceptedMessagesFilter accept only the specific raw contract messages to be
 * executed.
 * Since: wasmd 0.30
 */
export interface AcceptedMessagesFilterAmino {
  /** Messages is the list of raw contract messages */
  messages: Uint8Array[];
}
export interface AcceptedMessagesFilterAminoMsg {
  type: "wasm/AcceptedMessagesFilter";
  value: AcceptedMessagesFilterAmino;
}
/**
 * AcceptedMessagesFilter accept only the specific raw contract messages to be
 * executed.
 * Since: wasmd 0.30
 */
export interface AcceptedMessagesFilterSDKType {
  $typeUrl?: string;
  messages: Uint8Array[];
}
function createBaseContractExecutionAuthorization(): ContractExecutionAuthorization {
  return {
    $typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
    grants: [],
  };
}
export const ContractExecutionAuthorization = {
  typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
  encode(
    message: ContractExecutionAuthorization,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.grants) {
      ContractGrant.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ContractExecutionAuthorization {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractExecutionAuthorization();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.grants.push(ContractGrant.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<ContractExecutionAuthorization>
  ): ContractExecutionAuthorization {
    const message = createBaseContractExecutionAuthorization();
    message.grants =
      object.grants?.map((e) => ContractGrant.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: ContractExecutionAuthorizationAmino
  ): ContractExecutionAuthorization {
    return {
      grants: Array.isArray(object?.grants)
        ? object.grants.map((e: any) => ContractGrant.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: ContractExecutionAuthorization
  ): ContractExecutionAuthorizationAmino {
    const obj: any = {};
    if (message.grants) {
      obj.grants = message.grants.map((e) =>
        e ? ContractGrant.toAmino(e) : undefined
      );
    } else {
      obj.grants = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: ContractExecutionAuthorizationAminoMsg
  ): ContractExecutionAuthorization {
    return ContractExecutionAuthorization.fromAmino(object.value);
  },
  toAminoMsg(
    message: ContractExecutionAuthorization
  ): ContractExecutionAuthorizationAminoMsg {
    return {
      type: "wasm/ContractExecutionAuthorization",
      value: ContractExecutionAuthorization.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ContractExecutionAuthorizationProtoMsg
  ): ContractExecutionAuthorization {
    return ContractExecutionAuthorization.decode(message.value);
  },
  toProto(message: ContractExecutionAuthorization): Uint8Array {
    return ContractExecutionAuthorization.encode(message).finish();
  },
  toProtoMsg(
    message: ContractExecutionAuthorization
  ): ContractExecutionAuthorizationProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
      value: ContractExecutionAuthorization.encode(message).finish(),
    };
  },
};
function createBaseContractMigrationAuthorization(): ContractMigrationAuthorization {
  return {
    $typeUrl: "/cosmwasm.wasm.v1.ContractMigrationAuthorization",
    grants: [],
  };
}
export const ContractMigrationAuthorization = {
  typeUrl: "/cosmwasm.wasm.v1.ContractMigrationAuthorization",
  encode(
    message: ContractMigrationAuthorization,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.grants) {
      ContractGrant.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ContractMigrationAuthorization {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractMigrationAuthorization();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.grants.push(ContractGrant.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<ContractMigrationAuthorization>
  ): ContractMigrationAuthorization {
    const message = createBaseContractMigrationAuthorization();
    message.grants =
      object.grants?.map((e) => ContractGrant.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: ContractMigrationAuthorizationAmino
  ): ContractMigrationAuthorization {
    return {
      grants: Array.isArray(object?.grants)
        ? object.grants.map((e: any) => ContractGrant.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: ContractMigrationAuthorization
  ): ContractMigrationAuthorizationAmino {
    const obj: any = {};
    if (message.grants) {
      obj.grants = message.grants.map((e) =>
        e ? ContractGrant.toAmino(e) : undefined
      );
    } else {
      obj.grants = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: ContractMigrationAuthorizationAminoMsg
  ): ContractMigrationAuthorization {
    return ContractMigrationAuthorization.fromAmino(object.value);
  },
  toAminoMsg(
    message: ContractMigrationAuthorization
  ): ContractMigrationAuthorizationAminoMsg {
    return {
      type: "wasm/ContractMigrationAuthorization",
      value: ContractMigrationAuthorization.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ContractMigrationAuthorizationProtoMsg
  ): ContractMigrationAuthorization {
    return ContractMigrationAuthorization.decode(message.value);
  },
  toProto(message: ContractMigrationAuthorization): Uint8Array {
    return ContractMigrationAuthorization.encode(message).finish();
  },
  toProtoMsg(
    message: ContractMigrationAuthorization
  ): ContractMigrationAuthorizationProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.ContractMigrationAuthorization",
      value: ContractMigrationAuthorization.encode(message).finish(),
    };
  },
};
function createBaseContractGrant(): ContractGrant {
  return {
    contract: "",
    limit: undefined,
    filter: undefined,
  };
}
export const ContractGrant = {
  typeUrl: "/cosmwasm.wasm.v1.ContractGrant",
  encode(
    message: ContractGrant,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.contract !== "") {
      writer.uint32(10).string(message.contract);
    }
    if (message.limit !== undefined) {
      Any.encode(message.limit as Any, writer.uint32(18).fork()).ldelim();
    }
    if (message.filter !== undefined) {
      Any.encode(message.filter as Any, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ContractGrant {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractGrant();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contract = reader.string();
          break;
        case 2:
          message.limit = Cosmwasm_wasmv1ContractAuthzLimitX_InterfaceDecoder(
            reader
          ) as Any;
          break;
        case 3:
          message.filter = Cosmwasm_wasmv1ContractAuthzFilterX_InterfaceDecoder(
            reader
          ) as Any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ContractGrant>): ContractGrant {
    const message = createBaseContractGrant();
    message.contract = object.contract ?? "";
    message.limit =
      object.limit !== undefined && object.limit !== null
        ? Any.fromPartial(object.limit)
        : undefined;
    message.filter =
      object.filter !== undefined && object.filter !== null
        ? Any.fromPartial(object.filter)
        : undefined;
    return message;
  },
  fromAmino(object: ContractGrantAmino): ContractGrant {
    return {
      contract: object.contract,
      limit: object?.limit
        ? Cosmwasm_wasmv1ContractAuthzLimitX_FromAmino(object.limit)
        : undefined,
      filter: object?.filter
        ? Cosmwasm_wasmv1ContractAuthzFilterX_FromAmino(object.filter)
        : undefined,
    };
  },
  toAmino(message: ContractGrant): ContractGrantAmino {
    const obj: any = {};
    obj.contract = message.contract;
    obj.limit = message.limit
      ? Cosmwasm_wasmv1ContractAuthzLimitX_ToAmino(message.limit as Any)
      : undefined;
    obj.filter = message.filter
      ? Cosmwasm_wasmv1ContractAuthzFilterX_ToAmino(message.filter as Any)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ContractGrantAminoMsg): ContractGrant {
    return ContractGrant.fromAmino(object.value);
  },
  toAminoMsg(message: ContractGrant): ContractGrantAminoMsg {
    return {
      type: "wasm/ContractGrant",
      value: ContractGrant.toAmino(message),
    };
  },
  fromProtoMsg(message: ContractGrantProtoMsg): ContractGrant {
    return ContractGrant.decode(message.value);
  },
  toProto(message: ContractGrant): Uint8Array {
    return ContractGrant.encode(message).finish();
  },
  toProtoMsg(message: ContractGrant): ContractGrantProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.ContractGrant",
      value: ContractGrant.encode(message).finish(),
    };
  },
};
function createBaseMaxCallsLimit(): MaxCallsLimit {
  return {
    $typeUrl: "/cosmwasm.wasm.v1.MaxCallsLimit",
    remaining: Long.UZERO,
  };
}
export const MaxCallsLimit = {
  typeUrl: "/cosmwasm.wasm.v1.MaxCallsLimit",
  encode(
    message: MaxCallsLimit,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.remaining.isZero()) {
      writer.uint32(8).uint64(message.remaining);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MaxCallsLimit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMaxCallsLimit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.remaining = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MaxCallsLimit>): MaxCallsLimit {
    const message = createBaseMaxCallsLimit();
    message.remaining =
      object.remaining !== undefined && object.remaining !== null
        ? Long.fromValue(object.remaining)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MaxCallsLimitAmino): MaxCallsLimit {
    return {
      remaining: Long.fromString(object.remaining),
    };
  },
  toAmino(message: MaxCallsLimit): MaxCallsLimitAmino {
    const obj: any = {};
    obj.remaining = message.remaining
      ? message.remaining.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MaxCallsLimitAminoMsg): MaxCallsLimit {
    return MaxCallsLimit.fromAmino(object.value);
  },
  toAminoMsg(message: MaxCallsLimit): MaxCallsLimitAminoMsg {
    return {
      type: "wasm/MaxCallsLimit",
      value: MaxCallsLimit.toAmino(message),
    };
  },
  fromProtoMsg(message: MaxCallsLimitProtoMsg): MaxCallsLimit {
    return MaxCallsLimit.decode(message.value);
  },
  toProto(message: MaxCallsLimit): Uint8Array {
    return MaxCallsLimit.encode(message).finish();
  },
  toProtoMsg(message: MaxCallsLimit): MaxCallsLimitProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.MaxCallsLimit",
      value: MaxCallsLimit.encode(message).finish(),
    };
  },
};
function createBaseMaxFundsLimit(): MaxFundsLimit {
  return {
    $typeUrl: "/cosmwasm.wasm.v1.MaxFundsLimit",
    amounts: [],
  };
}
export const MaxFundsLimit = {
  typeUrl: "/cosmwasm.wasm.v1.MaxFundsLimit",
  encode(
    message: MaxFundsLimit,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.amounts) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MaxFundsLimit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMaxFundsLimit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.amounts.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MaxFundsLimit>): MaxFundsLimit {
    const message = createBaseMaxFundsLimit();
    message.amounts = object.amounts?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MaxFundsLimitAmino): MaxFundsLimit {
    return {
      amounts: Array.isArray(object?.amounts)
        ? object.amounts.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MaxFundsLimit): MaxFundsLimitAmino {
    const obj: any = {};
    if (message.amounts) {
      obj.amounts = message.amounts.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.amounts = [];
    }
    return obj;
  },
  fromAminoMsg(object: MaxFundsLimitAminoMsg): MaxFundsLimit {
    return MaxFundsLimit.fromAmino(object.value);
  },
  toAminoMsg(message: MaxFundsLimit): MaxFundsLimitAminoMsg {
    return {
      type: "wasm/MaxFundsLimit",
      value: MaxFundsLimit.toAmino(message),
    };
  },
  fromProtoMsg(message: MaxFundsLimitProtoMsg): MaxFundsLimit {
    return MaxFundsLimit.decode(message.value);
  },
  toProto(message: MaxFundsLimit): Uint8Array {
    return MaxFundsLimit.encode(message).finish();
  },
  toProtoMsg(message: MaxFundsLimit): MaxFundsLimitProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.MaxFundsLimit",
      value: MaxFundsLimit.encode(message).finish(),
    };
  },
};
function createBaseCombinedLimit(): CombinedLimit {
  return {
    $typeUrl: "/cosmwasm.wasm.v1.CombinedLimit",
    callsRemaining: Long.UZERO,
    amounts: [],
  };
}
export const CombinedLimit = {
  typeUrl: "/cosmwasm.wasm.v1.CombinedLimit",
  encode(
    message: CombinedLimit,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.callsRemaining.isZero()) {
      writer.uint32(8).uint64(message.callsRemaining);
    }
    for (const v of message.amounts) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): CombinedLimit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCombinedLimit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.callsRemaining = reader.uint64() as Long;
          break;
        case 2:
          message.amounts.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CombinedLimit>): CombinedLimit {
    const message = createBaseCombinedLimit();
    message.callsRemaining =
      object.callsRemaining !== undefined && object.callsRemaining !== null
        ? Long.fromValue(object.callsRemaining)
        : Long.UZERO;
    message.amounts = object.amounts?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: CombinedLimitAmino): CombinedLimit {
    return {
      callsRemaining: Long.fromString(object.calls_remaining),
      amounts: Array.isArray(object?.amounts)
        ? object.amounts.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: CombinedLimit): CombinedLimitAmino {
    const obj: any = {};
    obj.calls_remaining = message.callsRemaining
      ? message.callsRemaining.toString()
      : undefined;
    if (message.amounts) {
      obj.amounts = message.amounts.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.amounts = [];
    }
    return obj;
  },
  fromAminoMsg(object: CombinedLimitAminoMsg): CombinedLimit {
    return CombinedLimit.fromAmino(object.value);
  },
  toAminoMsg(message: CombinedLimit): CombinedLimitAminoMsg {
    return {
      type: "wasm/CombinedLimit",
      value: CombinedLimit.toAmino(message),
    };
  },
  fromProtoMsg(message: CombinedLimitProtoMsg): CombinedLimit {
    return CombinedLimit.decode(message.value);
  },
  toProto(message: CombinedLimit): Uint8Array {
    return CombinedLimit.encode(message).finish();
  },
  toProtoMsg(message: CombinedLimit): CombinedLimitProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.CombinedLimit",
      value: CombinedLimit.encode(message).finish(),
    };
  },
};
function createBaseAllowAllMessagesFilter(): AllowAllMessagesFilter {
  return {
    $typeUrl: "/cosmwasm.wasm.v1.AllowAllMessagesFilter",
  };
}
export const AllowAllMessagesFilter = {
  typeUrl: "/cosmwasm.wasm.v1.AllowAllMessagesFilter",
  encode(
    _: AllowAllMessagesFilter,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AllowAllMessagesFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAllowAllMessagesFilter();
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
  fromPartial(_: Partial<AllowAllMessagesFilter>): AllowAllMessagesFilter {
    const message = createBaseAllowAllMessagesFilter();
    return message;
  },
  fromAmino(_: AllowAllMessagesFilterAmino): AllowAllMessagesFilter {
    return {};
  },
  toAmino(_: AllowAllMessagesFilter): AllowAllMessagesFilterAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: AllowAllMessagesFilterAminoMsg): AllowAllMessagesFilter {
    return AllowAllMessagesFilter.fromAmino(object.value);
  },
  toAminoMsg(message: AllowAllMessagesFilter): AllowAllMessagesFilterAminoMsg {
    return {
      type: "wasm/AllowAllMessagesFilter",
      value: AllowAllMessagesFilter.toAmino(message),
    };
  },
  fromProtoMsg(
    message: AllowAllMessagesFilterProtoMsg
  ): AllowAllMessagesFilter {
    return AllowAllMessagesFilter.decode(message.value);
  },
  toProto(message: AllowAllMessagesFilter): Uint8Array {
    return AllowAllMessagesFilter.encode(message).finish();
  },
  toProtoMsg(message: AllowAllMessagesFilter): AllowAllMessagesFilterProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.AllowAllMessagesFilter",
      value: AllowAllMessagesFilter.encode(message).finish(),
    };
  },
};
function createBaseAcceptedMessageKeysFilter(): AcceptedMessageKeysFilter {
  return {
    $typeUrl: "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
    keys: [],
  };
}
export const AcceptedMessageKeysFilter = {
  typeUrl: "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
  encode(
    message: AcceptedMessageKeysFilter,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.keys) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AcceptedMessageKeysFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAcceptedMessageKeysFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.keys.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<AcceptedMessageKeysFilter>
  ): AcceptedMessageKeysFilter {
    const message = createBaseAcceptedMessageKeysFilter();
    message.keys = object.keys?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: AcceptedMessageKeysFilterAmino): AcceptedMessageKeysFilter {
    return {
      keys: Array.isArray(object?.keys) ? object.keys.map((e: any) => e) : [],
    };
  },
  toAmino(message: AcceptedMessageKeysFilter): AcceptedMessageKeysFilterAmino {
    const obj: any = {};
    if (message.keys) {
      obj.keys = message.keys.map((e) => e);
    } else {
      obj.keys = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: AcceptedMessageKeysFilterAminoMsg
  ): AcceptedMessageKeysFilter {
    return AcceptedMessageKeysFilter.fromAmino(object.value);
  },
  toAminoMsg(
    message: AcceptedMessageKeysFilter
  ): AcceptedMessageKeysFilterAminoMsg {
    return {
      type: "wasm/AcceptedMessageKeysFilter",
      value: AcceptedMessageKeysFilter.toAmino(message),
    };
  },
  fromProtoMsg(
    message: AcceptedMessageKeysFilterProtoMsg
  ): AcceptedMessageKeysFilter {
    return AcceptedMessageKeysFilter.decode(message.value);
  },
  toProto(message: AcceptedMessageKeysFilter): Uint8Array {
    return AcceptedMessageKeysFilter.encode(message).finish();
  },
  toProtoMsg(
    message: AcceptedMessageKeysFilter
  ): AcceptedMessageKeysFilterProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
      value: AcceptedMessageKeysFilter.encode(message).finish(),
    };
  },
};
function createBaseAcceptedMessagesFilter(): AcceptedMessagesFilter {
  return {
    $typeUrl: "/cosmwasm.wasm.v1.AcceptedMessagesFilter",
    messages: [],
  };
}
export const AcceptedMessagesFilter = {
  typeUrl: "/cosmwasm.wasm.v1.AcceptedMessagesFilter",
  encode(
    message: AcceptedMessagesFilter,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.messages) {
      writer.uint32(10).bytes(v!);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): AcceptedMessagesFilter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAcceptedMessagesFilter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<AcceptedMessagesFilter>): AcceptedMessagesFilter {
    const message = createBaseAcceptedMessagesFilter();
    message.messages = object.messages?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: AcceptedMessagesFilterAmino): AcceptedMessagesFilter {
    return {
      messages: Array.isArray(object?.messages)
        ? object.messages.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: AcceptedMessagesFilter): AcceptedMessagesFilterAmino {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map((e) => e);
    } else {
      obj.messages = [];
    }
    return obj;
  },
  fromAminoMsg(object: AcceptedMessagesFilterAminoMsg): AcceptedMessagesFilter {
    return AcceptedMessagesFilter.fromAmino(object.value);
  },
  toAminoMsg(message: AcceptedMessagesFilter): AcceptedMessagesFilterAminoMsg {
    return {
      type: "wasm/AcceptedMessagesFilter",
      value: AcceptedMessagesFilter.toAmino(message),
    };
  },
  fromProtoMsg(
    message: AcceptedMessagesFilterProtoMsg
  ): AcceptedMessagesFilter {
    return AcceptedMessagesFilter.decode(message.value);
  },
  toProto(message: AcceptedMessagesFilter): Uint8Array {
    return AcceptedMessagesFilter.encode(message).finish();
  },
  toProtoMsg(message: AcceptedMessagesFilter): AcceptedMessagesFilterProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.AcceptedMessagesFilter",
      value: AcceptedMessagesFilter.encode(message).finish(),
    };
  },
};
export const Cosmwasm_wasmv1ContractAuthzLimitX_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): MaxCallsLimit | MaxFundsLimit | CombinedLimit | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case "/cosmwasm.wasm.v1.MaxCallsLimit":
      return MaxCallsLimit.decode(data.value);
    case "/cosmwasm.wasm.v1.MaxFundsLimit":
      return MaxFundsLimit.decode(data.value);
    case "/cosmwasm.wasm.v1.CombinedLimit":
      return CombinedLimit.decode(data.value);
    default:
      return data;
  }
};
export const Cosmwasm_wasmv1ContractAuthzLimitX_FromAmino = (
  content: AnyAmino
) => {
  switch (content.type) {
    case "wasm/MaxCallsLimit":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.MaxCallsLimit",
        value: MaxCallsLimit.encode(
          MaxCallsLimit.fromPartial(MaxCallsLimit.fromAmino(content.value))
        ).finish(),
      });
    case "wasm/MaxFundsLimit":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.MaxFundsLimit",
        value: MaxFundsLimit.encode(
          MaxFundsLimit.fromPartial(MaxFundsLimit.fromAmino(content.value))
        ).finish(),
      });
    case "wasm/CombinedLimit":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.CombinedLimit",
        value: CombinedLimit.encode(
          CombinedLimit.fromPartial(CombinedLimit.fromAmino(content.value))
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const Cosmwasm_wasmv1ContractAuthzLimitX_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case "/cosmwasm.wasm.v1.MaxCallsLimit":
      return {
        type: "wasm/MaxCallsLimit",
        value: MaxCallsLimit.toAmino(MaxCallsLimit.decode(content.value)),
      };
    case "/cosmwasm.wasm.v1.MaxFundsLimit":
      return {
        type: "wasm/MaxFundsLimit",
        value: MaxFundsLimit.toAmino(MaxFundsLimit.decode(content.value)),
      };
    case "/cosmwasm.wasm.v1.CombinedLimit":
      return {
        type: "wasm/CombinedLimit",
        value: CombinedLimit.toAmino(CombinedLimit.decode(content.value)),
      };
    default:
      return Any.toAmino(content);
  }
};
export const Cosmwasm_wasmv1ContractAuthzFilterX_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
):
  | AllowAllMessagesFilter
  | AcceptedMessageKeysFilter
  | AcceptedMessagesFilter
  | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case "/cosmwasm.wasm.v1.AllowAllMessagesFilter":
      return AllowAllMessagesFilter.decode(data.value);
    case "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter":
      return AcceptedMessageKeysFilter.decode(data.value);
    case "/cosmwasm.wasm.v1.AcceptedMessagesFilter":
      return AcceptedMessagesFilter.decode(data.value);
    default:
      return data;
  }
};
export const Cosmwasm_wasmv1ContractAuthzFilterX_FromAmino = (
  content: AnyAmino
) => {
  switch (content.type) {
    case "wasm/AllowAllMessagesFilter":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.AllowAllMessagesFilter",
        value: AllowAllMessagesFilter.encode(
          AllowAllMessagesFilter.fromPartial(
            AllowAllMessagesFilter.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/AcceptedMessageKeysFilter":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter",
        value: AcceptedMessageKeysFilter.encode(
          AcceptedMessageKeysFilter.fromPartial(
            AcceptedMessageKeysFilter.fromAmino(content.value)
          )
        ).finish(),
      });
    case "wasm/AcceptedMessagesFilter":
      return Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.AcceptedMessagesFilter",
        value: AcceptedMessagesFilter.encode(
          AcceptedMessagesFilter.fromPartial(
            AcceptedMessagesFilter.fromAmino(content.value)
          )
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const Cosmwasm_wasmv1ContractAuthzFilterX_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case "/cosmwasm.wasm.v1.AllowAllMessagesFilter":
      return {
        type: "wasm/AllowAllMessagesFilter",
        value: AllowAllMessagesFilter.toAmino(
          AllowAllMessagesFilter.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.AcceptedMessageKeysFilter":
      return {
        type: "wasm/AcceptedMessageKeysFilter",
        value: AcceptedMessageKeysFilter.toAmino(
          AcceptedMessageKeysFilter.decode(content.value)
        ),
      };
    case "/cosmwasm.wasm.v1.AcceptedMessagesFilter":
      return {
        type: "wasm/AcceptedMessagesFilter",
        value: AcceptedMessagesFilter.toAmino(
          AcceptedMessagesFilter.decode(content.value)
        ),
      };
    default:
      return Any.toAmino(content);
  }
};
