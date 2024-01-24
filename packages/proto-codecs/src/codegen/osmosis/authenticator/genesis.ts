//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
import {
  AccountAuthenticator,
  AccountAuthenticatorAmino,
  AccountAuthenticatorSDKType,
} from "./models";
import { Params, ParamsAmino, ParamsSDKType } from "./params";
/**
 * AuthenticatorData represents a genesis exported account with Authenticators.
 * The address is used as the key, and the account authenticators are stored in
 * the authenticators field.
 */
export interface AuthenticatorData {
  /** address is an account address, one address can have many authenticators */
  address: string;
  /**
   * authenticators are the account's authenticators, these can be multiple
   * types including SignatureVerificationAuthenticator, AllOfAuthenticators and
   * CosmWasmAuthenticators.
   */
  authenticators: AccountAuthenticator[];
}
export interface AuthenticatorDataProtoMsg {
  typeUrl: "/osmosis.authenticator.AuthenticatorData";
  value: Uint8Array;
}
/**
 * AuthenticatorData represents a genesis exported account with Authenticators.
 * The address is used as the key, and the account authenticators are stored in
 * the authenticators field.
 */
export interface AuthenticatorDataAmino {
  /** address is an account address, one address can have many authenticators */
  address: string;
  /**
   * authenticators are the account's authenticators, these can be multiple
   * types including SignatureVerificationAuthenticator, AllOfAuthenticators and
   * CosmWasmAuthenticators.
   */
  authenticators: AccountAuthenticatorAmino[];
}
export interface AuthenticatorDataAminoMsg {
  type: "osmosis/authenticator/authenticator-data";
  value: AuthenticatorDataAmino;
}
/**
 * AuthenticatorData represents a genesis exported account with Authenticators.
 * The address is used as the key, and the account authenticators are stored in
 * the authenticators field.
 */
export interface AuthenticatorDataSDKType {
  address: string;
  authenticators: AccountAuthenticatorSDKType[];
}
/** GenesisState defines the authenticator module's genesis state. */
export interface GenesisState {
  /** params define the parameters for the authenticator module. */
  params: Params;
  /** next_authenticator_id is the next available authenticator ID. */
  nextAuthenticatorId: bigint;
  /**
   * authenticator_data contains the data for multiple accounts, each with their
   * authenticators.
   */
  authenticatorData: AuthenticatorData[];
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.authenticator.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the authenticator module's genesis state. */
export interface GenesisStateAmino {
  /** params define the parameters for the authenticator module. */
  params?: ParamsAmino;
  /** next_authenticator_id is the next available authenticator ID. */
  next_authenticator_id: string;
  /**
   * authenticator_data contains the data for multiple accounts, each with their
   * authenticators.
   */
  authenticator_data: AuthenticatorDataAmino[];
}
export interface GenesisStateAminoMsg {
  type: "osmosis/authenticator/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the authenticator module's genesis state. */
export interface GenesisStateSDKType {
  params: ParamsSDKType;
  next_authenticator_id: bigint;
  authenticator_data: AuthenticatorDataSDKType[];
}
function createBaseAuthenticatorData(): AuthenticatorData {
  return {
    address: "",
    authenticators: [],
  };
}
export const AuthenticatorData = {
  typeUrl: "/osmosis.authenticator.AuthenticatorData",
  encode(
    message: AuthenticatorData,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    for (const v of message.authenticators) {
      AccountAuthenticator.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): AuthenticatorData {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuthenticatorData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.authenticators.push(
            AccountAuthenticator.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<AuthenticatorData>): AuthenticatorData {
    const message = createBaseAuthenticatorData();
    message.address = object.address ?? "";
    message.authenticators =
      object.authenticators?.map((e) => AccountAuthenticator.fromPartial(e)) ||
      [];
    return message;
  },
  fromAmino(object: AuthenticatorDataAmino): AuthenticatorData {
    return {
      address: object.address,
      authenticators: Array.isArray(object?.authenticators)
        ? object.authenticators.map((e: any) =>
            AccountAuthenticator.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(message: AuthenticatorData): AuthenticatorDataAmino {
    const obj: any = {};
    obj.address = message.address;
    if (message.authenticators) {
      obj.authenticators = message.authenticators.map((e) =>
        e ? AccountAuthenticator.toAmino(e) : undefined
      );
    } else {
      obj.authenticators = [];
    }
    return obj;
  },
  fromAminoMsg(object: AuthenticatorDataAminoMsg): AuthenticatorData {
    return AuthenticatorData.fromAmino(object.value);
  },
  toAminoMsg(message: AuthenticatorData): AuthenticatorDataAminoMsg {
    return {
      type: "osmosis/authenticator/authenticator-data",
      value: AuthenticatorData.toAmino(message),
    };
  },
  fromProtoMsg(message: AuthenticatorDataProtoMsg): AuthenticatorData {
    return AuthenticatorData.decode(message.value);
  },
  toProto(message: AuthenticatorData): Uint8Array {
    return AuthenticatorData.encode(message).finish();
  },
  toProtoMsg(message: AuthenticatorData): AuthenticatorDataProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.AuthenticatorData",
      value: AuthenticatorData.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    params: Params.fromPartial({}),
    nextAuthenticatorId: BigInt(0),
    authenticatorData: [],
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.authenticator.GenesisState",
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    if (message.nextAuthenticatorId !== BigInt(0)) {
      writer.uint32(16).uint64(message.nextAuthenticatorId);
    }
    for (const v of message.authenticatorData) {
      AuthenticatorData.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): GenesisState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.nextAuthenticatorId = reader.uint64();
          break;
        case 3:
          message.authenticatorData.push(
            AuthenticatorData.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.nextAuthenticatorId =
      object.nextAuthenticatorId !== undefined &&
      object.nextAuthenticatorId !== null
        ? BigInt(object.nextAuthenticatorId.toString())
        : BigInt(0);
    message.authenticatorData =
      object.authenticatorData?.map((e) => AuthenticatorData.fromPartial(e)) ||
      [];
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
      nextAuthenticatorId: BigInt(object.next_authenticator_id),
      authenticatorData: Array.isArray(object?.authenticator_data)
        ? object.authenticator_data.map((e: any) =>
            AuthenticatorData.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    obj.next_authenticator_id = message.nextAuthenticatorId
      ? message.nextAuthenticatorId.toString()
      : undefined;
    if (message.authenticatorData) {
      obj.authenticator_data = message.authenticatorData.map((e) =>
        e ? AuthenticatorData.toAmino(e) : undefined
      );
    } else {
      obj.authenticator_data = [];
    }
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/authenticator/genesis-state",
      value: GenesisState.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
