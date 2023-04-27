//@ts-nocheck
/* eslint-disable */
import {
  TokenPairArbRoutes,
  TokenPairArbRoutesAmino,
  TokenPairArbRoutesSDKType,
  PoolWeights,
  PoolWeightsAmino,
  PoolWeightsSDKType,
  BaseDenom,
  BaseDenomAmino,
  BaseDenomSDKType,
} from "./protorev";
import { Long } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** MsgSetHotRoutes defines the Msg/SetHotRoutes request type. */
export interface MsgSetHotRoutes {
  /** admin is the account that is authorized to set the hot routes. */
  admin: string;
  /** hot_routes is the list of hot routes to set. */
  hotRoutes: TokenPairArbRoutes[];
}
export interface MsgSetHotRoutesProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetHotRoutes";
  value: Uint8Array;
}
/** MsgSetHotRoutes defines the Msg/SetHotRoutes request type. */
export interface MsgSetHotRoutesAmino {
  /** admin is the account that is authorized to set the hot routes. */
  admin: string;
  /** hot_routes is the list of hot routes to set. */
  hot_routes: TokenPairArbRoutesAmino[];
}
export interface MsgSetHotRoutesAminoMsg {
  type: "osmosis/MsgSetHotRoutes";
  value: MsgSetHotRoutesAmino;
}
/** MsgSetHotRoutes defines the Msg/SetHotRoutes request type. */
export interface MsgSetHotRoutesSDKType {
  admin: string;
  hot_routes: TokenPairArbRoutesSDKType[];
}
/** MsgSetHotRoutesResponse defines the Msg/SetHotRoutes response type. */
export interface MsgSetHotRoutesResponse {}
export interface MsgSetHotRoutesResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetHotRoutesResponse";
  value: Uint8Array;
}
/** MsgSetHotRoutesResponse defines the Msg/SetHotRoutes response type. */
export interface MsgSetHotRoutesResponseAmino {}
export interface MsgSetHotRoutesResponseAminoMsg {
  type: "osmosis/protorev/set-hot-routes-response";
  value: MsgSetHotRoutesResponseAmino;
}
/** MsgSetHotRoutesResponse defines the Msg/SetHotRoutes response type. */
export interface MsgSetHotRoutesResponseSDKType {}
/** MsgSetDeveloperAccount defines the Msg/SetDeveloperAccount request type. */
export interface MsgSetDeveloperAccount {
  /** admin is the account that is authorized to set the developer account. */
  admin: string;
  /**
   * developer_account is the account that will receive a portion of the profits
   * from the protorev module.
   */
  developerAccount: string;
}
export interface MsgSetDeveloperAccountProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetDeveloperAccount";
  value: Uint8Array;
}
/** MsgSetDeveloperAccount defines the Msg/SetDeveloperAccount request type. */
export interface MsgSetDeveloperAccountAmino {
  /** admin is the account that is authorized to set the developer account. */
  admin: string;
  /**
   * developer_account is the account that will receive a portion of the profits
   * from the protorev module.
   */
  developer_account: string;
}
export interface MsgSetDeveloperAccountAminoMsg {
  type: "osmosis/MsgSetDeveloperAccount";
  value: MsgSetDeveloperAccountAmino;
}
/** MsgSetDeveloperAccount defines the Msg/SetDeveloperAccount request type. */
export interface MsgSetDeveloperAccountSDKType {
  admin: string;
  developer_account: string;
}
/**
 * MsgSetDeveloperAccountResponse defines the Msg/SetDeveloperAccount response
 * type.
 */
export interface MsgSetDeveloperAccountResponse {}
export interface MsgSetDeveloperAccountResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetDeveloperAccountResponse";
  value: Uint8Array;
}
/**
 * MsgSetDeveloperAccountResponse defines the Msg/SetDeveloperAccount response
 * type.
 */
export interface MsgSetDeveloperAccountResponseAmino {}
export interface MsgSetDeveloperAccountResponseAminoMsg {
  type: "osmosis/protorev/set-developer-account-response";
  value: MsgSetDeveloperAccountResponseAmino;
}
/**
 * MsgSetDeveloperAccountResponse defines the Msg/SetDeveloperAccount response
 * type.
 */
export interface MsgSetDeveloperAccountResponseSDKType {}
/** MsgSetPoolWeights defines the Msg/SetPoolWeights request type. */
export interface MsgSetPoolWeights {
  /** admin is the account that is authorized to set the pool weights. */
  admin: string;
  /** pool_weights is the list of pool weights to set. */
  poolWeights?: PoolWeights;
}
export interface MsgSetPoolWeightsProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetPoolWeights";
  value: Uint8Array;
}
/** MsgSetPoolWeights defines the Msg/SetPoolWeights request type. */
export interface MsgSetPoolWeightsAmino {
  /** admin is the account that is authorized to set the pool weights. */
  admin: string;
  /** pool_weights is the list of pool weights to set. */
  pool_weights?: PoolWeightsAmino;
}
export interface MsgSetPoolWeightsAminoMsg {
  type: "osmosis/protorev/set-pool-weights";
  value: MsgSetPoolWeightsAmino;
}
/** MsgSetPoolWeights defines the Msg/SetPoolWeights request type. */
export interface MsgSetPoolWeightsSDKType {
  admin: string;
  pool_weights?: PoolWeightsSDKType;
}
/** MsgSetPoolWeightsResponse defines the Msg/SetPoolWeights response type. */
export interface MsgSetPoolWeightsResponse {}
export interface MsgSetPoolWeightsResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetPoolWeightsResponse";
  value: Uint8Array;
}
/** MsgSetPoolWeightsResponse defines the Msg/SetPoolWeights response type. */
export interface MsgSetPoolWeightsResponseAmino {}
export interface MsgSetPoolWeightsResponseAminoMsg {
  type: "osmosis/protorev/set-pool-weights-response";
  value: MsgSetPoolWeightsResponseAmino;
}
/** MsgSetPoolWeightsResponse defines the Msg/SetPoolWeights response type. */
export interface MsgSetPoolWeightsResponseSDKType {}
/** MsgSetMaxPoolPointsPerTx defines the Msg/SetMaxPoolPointsPerTx request type. */
export interface MsgSetMaxPoolPointsPerTx {
  /** admin is the account that is authorized to set the max pool points per tx. */
  admin: string;
  /**
   * max_pool_points_per_tx is the maximum number of pool points that can be
   * consumed per transaction.
   */
  maxPoolPointsPerTx: Long;
}
export interface MsgSetMaxPoolPointsPerTxProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerTx";
  value: Uint8Array;
}
/** MsgSetMaxPoolPointsPerTx defines the Msg/SetMaxPoolPointsPerTx request type. */
export interface MsgSetMaxPoolPointsPerTxAmino {
  /** admin is the account that is authorized to set the max pool points per tx. */
  admin: string;
  /**
   * max_pool_points_per_tx is the maximum number of pool points that can be
   * consumed per transaction.
   */
  max_pool_points_per_tx: string;
}
export interface MsgSetMaxPoolPointsPerTxAminoMsg {
  type: "osmosis/protorev/set-max-pool-points-per-tx";
  value: MsgSetMaxPoolPointsPerTxAmino;
}
/** MsgSetMaxPoolPointsPerTx defines the Msg/SetMaxPoolPointsPerTx request type. */
export interface MsgSetMaxPoolPointsPerTxSDKType {
  admin: string;
  max_pool_points_per_tx: Long;
}
/**
 * MsgSetMaxPoolPointsPerTxResponse defines the Msg/SetMaxPoolPointsPerTx
 * response type.
 */
export interface MsgSetMaxPoolPointsPerTxResponse {}
export interface MsgSetMaxPoolPointsPerTxResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerTxResponse";
  value: Uint8Array;
}
/**
 * MsgSetMaxPoolPointsPerTxResponse defines the Msg/SetMaxPoolPointsPerTx
 * response type.
 */
export interface MsgSetMaxPoolPointsPerTxResponseAmino {}
export interface MsgSetMaxPoolPointsPerTxResponseAminoMsg {
  type: "osmosis/protorev/set-max-pool-points-per-tx-response";
  value: MsgSetMaxPoolPointsPerTxResponseAmino;
}
/**
 * MsgSetMaxPoolPointsPerTxResponse defines the Msg/SetMaxPoolPointsPerTx
 * response type.
 */
export interface MsgSetMaxPoolPointsPerTxResponseSDKType {}
/**
 * MsgSetMaxPoolPointsPerBlock defines the Msg/SetMaxPoolPointsPerBlock request
 * type.
 */
export interface MsgSetMaxPoolPointsPerBlock {
  /**
   * admin is the account that is authorized to set the max pool points per
   * block.
   */
  admin: string;
  /**
   * max_pool_points_per_block is the maximum number of pool points that can be
   * consumed per block.
   */
  maxPoolPointsPerBlock: Long;
}
export interface MsgSetMaxPoolPointsPerBlockProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerBlock";
  value: Uint8Array;
}
/**
 * MsgSetMaxPoolPointsPerBlock defines the Msg/SetMaxPoolPointsPerBlock request
 * type.
 */
export interface MsgSetMaxPoolPointsPerBlockAmino {
  /**
   * admin is the account that is authorized to set the max pool points per
   * block.
   */
  admin: string;
  /**
   * max_pool_points_per_block is the maximum number of pool points that can be
   * consumed per block.
   */
  max_pool_points_per_block: string;
}
export interface MsgSetMaxPoolPointsPerBlockAminoMsg {
  type: "osmosis/protorev/set-max-pool-points-per-block";
  value: MsgSetMaxPoolPointsPerBlockAmino;
}
/**
 * MsgSetMaxPoolPointsPerBlock defines the Msg/SetMaxPoolPointsPerBlock request
 * type.
 */
export interface MsgSetMaxPoolPointsPerBlockSDKType {
  admin: string;
  max_pool_points_per_block: Long;
}
/**
 * MsgSetMaxPoolPointsPerBlockResponse defines the
 * Msg/SetMaxPoolPointsPerBlock response type.
 */
export interface MsgSetMaxPoolPointsPerBlockResponse {}
export interface MsgSetMaxPoolPointsPerBlockResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerBlockResponse";
  value: Uint8Array;
}
/**
 * MsgSetMaxPoolPointsPerBlockResponse defines the
 * Msg/SetMaxPoolPointsPerBlock response type.
 */
export interface MsgSetMaxPoolPointsPerBlockResponseAmino {}
export interface MsgSetMaxPoolPointsPerBlockResponseAminoMsg {
  type: "osmosis/protorev/set-max-pool-points-per-block-response";
  value: MsgSetMaxPoolPointsPerBlockResponseAmino;
}
/**
 * MsgSetMaxPoolPointsPerBlockResponse defines the
 * Msg/SetMaxPoolPointsPerBlock response type.
 */
export interface MsgSetMaxPoolPointsPerBlockResponseSDKType {}
/** MsgSetBaseDenoms defines the Msg/SetBaseDenoms request type. */
export interface MsgSetBaseDenoms {
  /** admin is the account that is authorized to set the base denoms. */
  admin: string;
  /** base_denoms is the list of base denoms to set. */
  baseDenoms: BaseDenom[];
}
export interface MsgSetBaseDenomsProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetBaseDenoms";
  value: Uint8Array;
}
/** MsgSetBaseDenoms defines the Msg/SetBaseDenoms request type. */
export interface MsgSetBaseDenomsAmino {
  /** admin is the account that is authorized to set the base denoms. */
  admin: string;
  /** base_denoms is the list of base denoms to set. */
  base_denoms: BaseDenomAmino[];
}
export interface MsgSetBaseDenomsAminoMsg {
  type: "osmosis/protorev/set-base-denoms";
  value: MsgSetBaseDenomsAmino;
}
/** MsgSetBaseDenoms defines the Msg/SetBaseDenoms request type. */
export interface MsgSetBaseDenomsSDKType {
  admin: string;
  base_denoms: BaseDenomSDKType[];
}
/** MsgSetBaseDenomsResponse defines the Msg/SetBaseDenoms response type. */
export interface MsgSetBaseDenomsResponse {}
export interface MsgSetBaseDenomsResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetBaseDenomsResponse";
  value: Uint8Array;
}
/** MsgSetBaseDenomsResponse defines the Msg/SetBaseDenoms response type. */
export interface MsgSetBaseDenomsResponseAmino {}
export interface MsgSetBaseDenomsResponseAminoMsg {
  type: "osmosis/protorev/set-base-denoms-response";
  value: MsgSetBaseDenomsResponseAmino;
}
/** MsgSetBaseDenomsResponse defines the Msg/SetBaseDenoms response type. */
export interface MsgSetBaseDenomsResponseSDKType {}
function createBaseMsgSetHotRoutes(): MsgSetHotRoutes {
  return {
    admin: "",
    hotRoutes: [],
  };
}
export const MsgSetHotRoutes = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetHotRoutes",
  encode(
    message: MsgSetHotRoutes,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.admin !== "") {
      writer.uint32(10).string(message.admin);
    }
    for (const v of message.hotRoutes) {
      TokenPairArbRoutes.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetHotRoutes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetHotRoutes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.hotRoutes.push(
            TokenPairArbRoutes.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetHotRoutes>): MsgSetHotRoutes {
    const message = createBaseMsgSetHotRoutes();
    message.admin = object.admin ?? "";
    message.hotRoutes =
      object.hotRoutes?.map((e) => TokenPairArbRoutes.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgSetHotRoutesAmino): MsgSetHotRoutes {
    return {
      admin: object.admin,
      hotRoutes: Array.isArray(object?.hot_routes)
        ? object.hot_routes.map((e: any) => TokenPairArbRoutes.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgSetHotRoutes): MsgSetHotRoutesAmino {
    const obj: any = {};
    obj.admin = message.admin;
    if (message.hotRoutes) {
      obj.hot_routes = message.hotRoutes.map((e) =>
        e ? TokenPairArbRoutes.toAmino(e) : undefined
      );
    } else {
      obj.hot_routes = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgSetHotRoutesAminoMsg): MsgSetHotRoutes {
    return MsgSetHotRoutes.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSetHotRoutes): MsgSetHotRoutesAminoMsg {
    return {
      type: "osmosis/MsgSetHotRoutes",
      value: MsgSetHotRoutes.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSetHotRoutesProtoMsg): MsgSetHotRoutes {
    return MsgSetHotRoutes.decode(message.value);
  },
  toProto(message: MsgSetHotRoutes): Uint8Array {
    return MsgSetHotRoutes.encode(message).finish();
  },
  toProtoMsg(message: MsgSetHotRoutes): MsgSetHotRoutesProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetHotRoutes",
      value: MsgSetHotRoutes.encode(message).finish(),
    };
  },
};
function createBaseMsgSetHotRoutesResponse(): MsgSetHotRoutesResponse {
  return {};
}
export const MsgSetHotRoutesResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetHotRoutesResponse",
  encode(
    _: MsgSetHotRoutesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetHotRoutesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetHotRoutesResponse();
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
  fromPartial(_: Partial<MsgSetHotRoutesResponse>): MsgSetHotRoutesResponse {
    const message = createBaseMsgSetHotRoutesResponse();
    return message;
  },
  fromAmino(_: MsgSetHotRoutesResponseAmino): MsgSetHotRoutesResponse {
    return {};
  },
  toAmino(_: MsgSetHotRoutesResponse): MsgSetHotRoutesResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetHotRoutesResponseAminoMsg
  ): MsgSetHotRoutesResponse {
    return MsgSetHotRoutesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetHotRoutesResponse
  ): MsgSetHotRoutesResponseAminoMsg {
    return {
      type: "osmosis/protorev/set-hot-routes-response",
      value: MsgSetHotRoutesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetHotRoutesResponseProtoMsg
  ): MsgSetHotRoutesResponse {
    return MsgSetHotRoutesResponse.decode(message.value);
  },
  toProto(message: MsgSetHotRoutesResponse): Uint8Array {
    return MsgSetHotRoutesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetHotRoutesResponse
  ): MsgSetHotRoutesResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetHotRoutesResponse",
      value: MsgSetHotRoutesResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetDeveloperAccount(): MsgSetDeveloperAccount {
  return {
    admin: "",
    developerAccount: "",
  };
}
export const MsgSetDeveloperAccount = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetDeveloperAccount",
  encode(
    message: MsgSetDeveloperAccount,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.admin !== "") {
      writer.uint32(10).string(message.admin);
    }
    if (message.developerAccount !== "") {
      writer.uint32(18).string(message.developerAccount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetDeveloperAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetDeveloperAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.developerAccount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetDeveloperAccount>): MsgSetDeveloperAccount {
    const message = createBaseMsgSetDeveloperAccount();
    message.admin = object.admin ?? "";
    message.developerAccount = object.developerAccount ?? "";
    return message;
  },
  fromAmino(object: MsgSetDeveloperAccountAmino): MsgSetDeveloperAccount {
    return {
      admin: object.admin,
      developerAccount: object.developer_account,
    };
  },
  toAmino(message: MsgSetDeveloperAccount): MsgSetDeveloperAccountAmino {
    const obj: any = {};
    obj.admin = message.admin;
    obj.developer_account = message.developerAccount;
    return obj;
  },
  fromAminoMsg(object: MsgSetDeveloperAccountAminoMsg): MsgSetDeveloperAccount {
    return MsgSetDeveloperAccount.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSetDeveloperAccount): MsgSetDeveloperAccountAminoMsg {
    return {
      type: "osmosis/MsgSetDeveloperAccount",
      value: MsgSetDeveloperAccount.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetDeveloperAccountProtoMsg
  ): MsgSetDeveloperAccount {
    return MsgSetDeveloperAccount.decode(message.value);
  },
  toProto(message: MsgSetDeveloperAccount): Uint8Array {
    return MsgSetDeveloperAccount.encode(message).finish();
  },
  toProtoMsg(message: MsgSetDeveloperAccount): MsgSetDeveloperAccountProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetDeveloperAccount",
      value: MsgSetDeveloperAccount.encode(message).finish(),
    };
  },
};
function createBaseMsgSetDeveloperAccountResponse(): MsgSetDeveloperAccountResponse {
  return {};
}
export const MsgSetDeveloperAccountResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetDeveloperAccountResponse",
  encode(
    _: MsgSetDeveloperAccountResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetDeveloperAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetDeveloperAccountResponse();
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
    _: Partial<MsgSetDeveloperAccountResponse>
  ): MsgSetDeveloperAccountResponse {
    const message = createBaseMsgSetDeveloperAccountResponse();
    return message;
  },
  fromAmino(
    _: MsgSetDeveloperAccountResponseAmino
  ): MsgSetDeveloperAccountResponse {
    return {};
  },
  toAmino(
    _: MsgSetDeveloperAccountResponse
  ): MsgSetDeveloperAccountResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetDeveloperAccountResponseAminoMsg
  ): MsgSetDeveloperAccountResponse {
    return MsgSetDeveloperAccountResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetDeveloperAccountResponse
  ): MsgSetDeveloperAccountResponseAminoMsg {
    return {
      type: "osmosis/protorev/set-developer-account-response",
      value: MsgSetDeveloperAccountResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetDeveloperAccountResponseProtoMsg
  ): MsgSetDeveloperAccountResponse {
    return MsgSetDeveloperAccountResponse.decode(message.value);
  },
  toProto(message: MsgSetDeveloperAccountResponse): Uint8Array {
    return MsgSetDeveloperAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetDeveloperAccountResponse
  ): MsgSetDeveloperAccountResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetDeveloperAccountResponse",
      value: MsgSetDeveloperAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetPoolWeights(): MsgSetPoolWeights {
  return {
    admin: "",
    poolWeights: undefined,
  };
}
export const MsgSetPoolWeights = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetPoolWeights",
  encode(
    message: MsgSetPoolWeights,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.admin !== "") {
      writer.uint32(10).string(message.admin);
    }
    if (message.poolWeights !== undefined) {
      PoolWeights.encode(
        message.poolWeights,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetPoolWeights {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetPoolWeights();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.poolWeights = PoolWeights.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetPoolWeights>): MsgSetPoolWeights {
    const message = createBaseMsgSetPoolWeights();
    message.admin = object.admin ?? "";
    message.poolWeights =
      object.poolWeights !== undefined && object.poolWeights !== null
        ? PoolWeights.fromPartial(object.poolWeights)
        : undefined;
    return message;
  },
  fromAmino(object: MsgSetPoolWeightsAmino): MsgSetPoolWeights {
    return {
      admin: object.admin,
      poolWeights: object?.pool_weights
        ? PoolWeights.fromAmino(object.pool_weights)
        : undefined,
    };
  },
  toAmino(message: MsgSetPoolWeights): MsgSetPoolWeightsAmino {
    const obj: any = {};
    obj.admin = message.admin;
    obj.pool_weights = message.poolWeights
      ? PoolWeights.toAmino(message.poolWeights)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSetPoolWeightsAminoMsg): MsgSetPoolWeights {
    return MsgSetPoolWeights.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSetPoolWeights): MsgSetPoolWeightsAminoMsg {
    return {
      type: "osmosis/protorev/set-pool-weights",
      value: MsgSetPoolWeights.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSetPoolWeightsProtoMsg): MsgSetPoolWeights {
    return MsgSetPoolWeights.decode(message.value);
  },
  toProto(message: MsgSetPoolWeights): Uint8Array {
    return MsgSetPoolWeights.encode(message).finish();
  },
  toProtoMsg(message: MsgSetPoolWeights): MsgSetPoolWeightsProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetPoolWeights",
      value: MsgSetPoolWeights.encode(message).finish(),
    };
  },
};
function createBaseMsgSetPoolWeightsResponse(): MsgSetPoolWeightsResponse {
  return {};
}
export const MsgSetPoolWeightsResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetPoolWeightsResponse",
  encode(
    _: MsgSetPoolWeightsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetPoolWeightsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetPoolWeightsResponse();
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
    _: Partial<MsgSetPoolWeightsResponse>
  ): MsgSetPoolWeightsResponse {
    const message = createBaseMsgSetPoolWeightsResponse();
    return message;
  },
  fromAmino(_: MsgSetPoolWeightsResponseAmino): MsgSetPoolWeightsResponse {
    return {};
  },
  toAmino(_: MsgSetPoolWeightsResponse): MsgSetPoolWeightsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetPoolWeightsResponseAminoMsg
  ): MsgSetPoolWeightsResponse {
    return MsgSetPoolWeightsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetPoolWeightsResponse
  ): MsgSetPoolWeightsResponseAminoMsg {
    return {
      type: "osmosis/protorev/set-pool-weights-response",
      value: MsgSetPoolWeightsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetPoolWeightsResponseProtoMsg
  ): MsgSetPoolWeightsResponse {
    return MsgSetPoolWeightsResponse.decode(message.value);
  },
  toProto(message: MsgSetPoolWeightsResponse): Uint8Array {
    return MsgSetPoolWeightsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetPoolWeightsResponse
  ): MsgSetPoolWeightsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetPoolWeightsResponse",
      value: MsgSetPoolWeightsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetMaxPoolPointsPerTx(): MsgSetMaxPoolPointsPerTx {
  return {
    admin: "",
    maxPoolPointsPerTx: Long.UZERO,
  };
}
export const MsgSetMaxPoolPointsPerTx = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerTx",
  encode(
    message: MsgSetMaxPoolPointsPerTx,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.admin !== "") {
      writer.uint32(10).string(message.admin);
    }
    if (!message.maxPoolPointsPerTx.isZero()) {
      writer.uint32(16).uint64(message.maxPoolPointsPerTx);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetMaxPoolPointsPerTx {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetMaxPoolPointsPerTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.maxPoolPointsPerTx = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSetMaxPoolPointsPerTx>
  ): MsgSetMaxPoolPointsPerTx {
    const message = createBaseMsgSetMaxPoolPointsPerTx();
    message.admin = object.admin ?? "";
    message.maxPoolPointsPerTx =
      object.maxPoolPointsPerTx !== undefined &&
      object.maxPoolPointsPerTx !== null
        ? Long.fromValue(object.maxPoolPointsPerTx)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgSetMaxPoolPointsPerTxAmino): MsgSetMaxPoolPointsPerTx {
    return {
      admin: object.admin,
      maxPoolPointsPerTx: Long.fromString(object.max_pool_points_per_tx),
    };
  },
  toAmino(message: MsgSetMaxPoolPointsPerTx): MsgSetMaxPoolPointsPerTxAmino {
    const obj: any = {};
    obj.admin = message.admin;
    obj.max_pool_points_per_tx = message.maxPoolPointsPerTx
      ? message.maxPoolPointsPerTx.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgSetMaxPoolPointsPerTxAminoMsg
  ): MsgSetMaxPoolPointsPerTx {
    return MsgSetMaxPoolPointsPerTx.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetMaxPoolPointsPerTx
  ): MsgSetMaxPoolPointsPerTxAminoMsg {
    return {
      type: "osmosis/protorev/set-max-pool-points-per-tx",
      value: MsgSetMaxPoolPointsPerTx.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetMaxPoolPointsPerTxProtoMsg
  ): MsgSetMaxPoolPointsPerTx {
    return MsgSetMaxPoolPointsPerTx.decode(message.value);
  },
  toProto(message: MsgSetMaxPoolPointsPerTx): Uint8Array {
    return MsgSetMaxPoolPointsPerTx.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetMaxPoolPointsPerTx
  ): MsgSetMaxPoolPointsPerTxProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerTx",
      value: MsgSetMaxPoolPointsPerTx.encode(message).finish(),
    };
  },
};
function createBaseMsgSetMaxPoolPointsPerTxResponse(): MsgSetMaxPoolPointsPerTxResponse {
  return {};
}
export const MsgSetMaxPoolPointsPerTxResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerTxResponse",
  encode(
    _: MsgSetMaxPoolPointsPerTxResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetMaxPoolPointsPerTxResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetMaxPoolPointsPerTxResponse();
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
    _: Partial<MsgSetMaxPoolPointsPerTxResponse>
  ): MsgSetMaxPoolPointsPerTxResponse {
    const message = createBaseMsgSetMaxPoolPointsPerTxResponse();
    return message;
  },
  fromAmino(
    _: MsgSetMaxPoolPointsPerTxResponseAmino
  ): MsgSetMaxPoolPointsPerTxResponse {
    return {};
  },
  toAmino(
    _: MsgSetMaxPoolPointsPerTxResponse
  ): MsgSetMaxPoolPointsPerTxResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetMaxPoolPointsPerTxResponseAminoMsg
  ): MsgSetMaxPoolPointsPerTxResponse {
    return MsgSetMaxPoolPointsPerTxResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetMaxPoolPointsPerTxResponse
  ): MsgSetMaxPoolPointsPerTxResponseAminoMsg {
    return {
      type: "osmosis/protorev/set-max-pool-points-per-tx-response",
      value: MsgSetMaxPoolPointsPerTxResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetMaxPoolPointsPerTxResponseProtoMsg
  ): MsgSetMaxPoolPointsPerTxResponse {
    return MsgSetMaxPoolPointsPerTxResponse.decode(message.value);
  },
  toProto(message: MsgSetMaxPoolPointsPerTxResponse): Uint8Array {
    return MsgSetMaxPoolPointsPerTxResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetMaxPoolPointsPerTxResponse
  ): MsgSetMaxPoolPointsPerTxResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerTxResponse",
      value: MsgSetMaxPoolPointsPerTxResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetMaxPoolPointsPerBlock(): MsgSetMaxPoolPointsPerBlock {
  return {
    admin: "",
    maxPoolPointsPerBlock: Long.UZERO,
  };
}
export const MsgSetMaxPoolPointsPerBlock = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerBlock",
  encode(
    message: MsgSetMaxPoolPointsPerBlock,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.admin !== "") {
      writer.uint32(10).string(message.admin);
    }
    if (!message.maxPoolPointsPerBlock.isZero()) {
      writer.uint32(16).uint64(message.maxPoolPointsPerBlock);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetMaxPoolPointsPerBlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetMaxPoolPointsPerBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.maxPoolPointsPerBlock = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSetMaxPoolPointsPerBlock>
  ): MsgSetMaxPoolPointsPerBlock {
    const message = createBaseMsgSetMaxPoolPointsPerBlock();
    message.admin = object.admin ?? "";
    message.maxPoolPointsPerBlock =
      object.maxPoolPointsPerBlock !== undefined &&
      object.maxPoolPointsPerBlock !== null
        ? Long.fromValue(object.maxPoolPointsPerBlock)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgSetMaxPoolPointsPerBlockAmino
  ): MsgSetMaxPoolPointsPerBlock {
    return {
      admin: object.admin,
      maxPoolPointsPerBlock: Long.fromString(object.max_pool_points_per_block),
    };
  },
  toAmino(
    message: MsgSetMaxPoolPointsPerBlock
  ): MsgSetMaxPoolPointsPerBlockAmino {
    const obj: any = {};
    obj.admin = message.admin;
    obj.max_pool_points_per_block = message.maxPoolPointsPerBlock
      ? message.maxPoolPointsPerBlock.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgSetMaxPoolPointsPerBlockAminoMsg
  ): MsgSetMaxPoolPointsPerBlock {
    return MsgSetMaxPoolPointsPerBlock.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetMaxPoolPointsPerBlock
  ): MsgSetMaxPoolPointsPerBlockAminoMsg {
    return {
      type: "osmosis/protorev/set-max-pool-points-per-block",
      value: MsgSetMaxPoolPointsPerBlock.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetMaxPoolPointsPerBlockProtoMsg
  ): MsgSetMaxPoolPointsPerBlock {
    return MsgSetMaxPoolPointsPerBlock.decode(message.value);
  },
  toProto(message: MsgSetMaxPoolPointsPerBlock): Uint8Array {
    return MsgSetMaxPoolPointsPerBlock.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetMaxPoolPointsPerBlock
  ): MsgSetMaxPoolPointsPerBlockProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerBlock",
      value: MsgSetMaxPoolPointsPerBlock.encode(message).finish(),
    };
  },
};
function createBaseMsgSetMaxPoolPointsPerBlockResponse(): MsgSetMaxPoolPointsPerBlockResponse {
  return {};
}
export const MsgSetMaxPoolPointsPerBlockResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerBlockResponse",
  encode(
    _: MsgSetMaxPoolPointsPerBlockResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetMaxPoolPointsPerBlockResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetMaxPoolPointsPerBlockResponse();
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
    _: Partial<MsgSetMaxPoolPointsPerBlockResponse>
  ): MsgSetMaxPoolPointsPerBlockResponse {
    const message = createBaseMsgSetMaxPoolPointsPerBlockResponse();
    return message;
  },
  fromAmino(
    _: MsgSetMaxPoolPointsPerBlockResponseAmino
  ): MsgSetMaxPoolPointsPerBlockResponse {
    return {};
  },
  toAmino(
    _: MsgSetMaxPoolPointsPerBlockResponse
  ): MsgSetMaxPoolPointsPerBlockResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetMaxPoolPointsPerBlockResponseAminoMsg
  ): MsgSetMaxPoolPointsPerBlockResponse {
    return MsgSetMaxPoolPointsPerBlockResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetMaxPoolPointsPerBlockResponse
  ): MsgSetMaxPoolPointsPerBlockResponseAminoMsg {
    return {
      type: "osmosis/protorev/set-max-pool-points-per-block-response",
      value: MsgSetMaxPoolPointsPerBlockResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetMaxPoolPointsPerBlockResponseProtoMsg
  ): MsgSetMaxPoolPointsPerBlockResponse {
    return MsgSetMaxPoolPointsPerBlockResponse.decode(message.value);
  },
  toProto(message: MsgSetMaxPoolPointsPerBlockResponse): Uint8Array {
    return MsgSetMaxPoolPointsPerBlockResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetMaxPoolPointsPerBlockResponse
  ): MsgSetMaxPoolPointsPerBlockResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetMaxPoolPointsPerBlockResponse",
      value: MsgSetMaxPoolPointsPerBlockResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetBaseDenoms(): MsgSetBaseDenoms {
  return {
    admin: "",
    baseDenoms: [],
  };
}
export const MsgSetBaseDenoms = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetBaseDenoms",
  encode(
    message: MsgSetBaseDenoms,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.admin !== "") {
      writer.uint32(10).string(message.admin);
    }
    for (const v of message.baseDenoms) {
      BaseDenom.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetBaseDenoms {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetBaseDenoms();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.baseDenoms.push(BaseDenom.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetBaseDenoms>): MsgSetBaseDenoms {
    const message = createBaseMsgSetBaseDenoms();
    message.admin = object.admin ?? "";
    message.baseDenoms =
      object.baseDenoms?.map((e) => BaseDenom.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgSetBaseDenomsAmino): MsgSetBaseDenoms {
    return {
      admin: object.admin,
      baseDenoms: Array.isArray(object?.base_denoms)
        ? object.base_denoms.map((e: any) => BaseDenom.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgSetBaseDenoms): MsgSetBaseDenomsAmino {
    const obj: any = {};
    obj.admin = message.admin;
    if (message.baseDenoms) {
      obj.base_denoms = message.baseDenoms.map((e) =>
        e ? BaseDenom.toAmino(e) : undefined
      );
    } else {
      obj.base_denoms = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgSetBaseDenomsAminoMsg): MsgSetBaseDenoms {
    return MsgSetBaseDenoms.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSetBaseDenoms): MsgSetBaseDenomsAminoMsg {
    return {
      type: "osmosis/protorev/set-base-denoms",
      value: MsgSetBaseDenoms.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSetBaseDenomsProtoMsg): MsgSetBaseDenoms {
    return MsgSetBaseDenoms.decode(message.value);
  },
  toProto(message: MsgSetBaseDenoms): Uint8Array {
    return MsgSetBaseDenoms.encode(message).finish();
  },
  toProtoMsg(message: MsgSetBaseDenoms): MsgSetBaseDenomsProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetBaseDenoms",
      value: MsgSetBaseDenoms.encode(message).finish(),
    };
  },
};
function createBaseMsgSetBaseDenomsResponse(): MsgSetBaseDenomsResponse {
  return {};
}
export const MsgSetBaseDenomsResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.MsgSetBaseDenomsResponse",
  encode(
    _: MsgSetBaseDenomsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetBaseDenomsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetBaseDenomsResponse();
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
  fromPartial(_: Partial<MsgSetBaseDenomsResponse>): MsgSetBaseDenomsResponse {
    const message = createBaseMsgSetBaseDenomsResponse();
    return message;
  },
  fromAmino(_: MsgSetBaseDenomsResponseAmino): MsgSetBaseDenomsResponse {
    return {};
  },
  toAmino(_: MsgSetBaseDenomsResponse): MsgSetBaseDenomsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetBaseDenomsResponseAminoMsg
  ): MsgSetBaseDenomsResponse {
    return MsgSetBaseDenomsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetBaseDenomsResponse
  ): MsgSetBaseDenomsResponseAminoMsg {
    return {
      type: "osmosis/protorev/set-base-denoms-response",
      value: MsgSetBaseDenomsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetBaseDenomsResponseProtoMsg
  ): MsgSetBaseDenomsResponse {
    return MsgSetBaseDenomsResponse.decode(message.value);
  },
  toProto(message: MsgSetBaseDenomsResponse): Uint8Array {
    return MsgSetBaseDenomsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetBaseDenomsResponse
  ): MsgSetBaseDenomsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.MsgSetBaseDenomsResponse",
      value: MsgSetBaseDenomsResponse.encode(message).finish(),
    };
  },
};
