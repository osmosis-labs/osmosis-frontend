//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
import { base64FromBytes, bytesFromBase64 } from "../../helpers";
/**
 * AccountAuthenticator represents a foundational model for all authenticators.
 * It provides extensibility by allowing concrete types to interpret and
 * validate transactions based on the encapsulated data.
 */
export interface AccountAuthenticator {
  /** ID uniquely identifies the authenticator instance. */
  id: bigint;
  /**
   * Type specifies the category of the AccountAuthenticator.
   * This type information is essential for differentiating authenticators
   * and ensuring precise data retrieval from the storage layer.
   */
  type: string;
  /**
   * Data is a versatile field used in conjunction with the specific type of
   * account authenticator to facilitate complex authentication processes.
   * The interpretation of this field is overloaded, enabling multiple
   * authenticators to utilize it for their respective purposes.
   */
  data: Uint8Array;
}
export interface AccountAuthenticatorProtoMsg {
  typeUrl: "/osmosis.authenticator.AccountAuthenticator";
  value: Uint8Array;
}
/**
 * AccountAuthenticator represents a foundational model for all authenticators.
 * It provides extensibility by allowing concrete types to interpret and
 * validate transactions based on the encapsulated data.
 */
export interface AccountAuthenticatorAmino {
  /** ID uniquely identifies the authenticator instance. */
  id?: string;
  /**
   * Type specifies the category of the AccountAuthenticator.
   * This type information is essential for differentiating authenticators
   * and ensuring precise data retrieval from the storage layer.
   */
  type?: string;
  /**
   * Data is a versatile field used in conjunction with the specific type of
   * account authenticator to facilitate complex authentication processes.
   * The interpretation of this field is overloaded, enabling multiple
   * authenticators to utilize it for their respective purposes.
   */
  data?: string;
}
export interface AccountAuthenticatorAminoMsg {
  type: "osmosis/authenticator/account-authenticator";
  value: AccountAuthenticatorAmino;
}
/**
 * AccountAuthenticator represents a foundational model for all authenticators.
 * It provides extensibility by allowing concrete types to interpret and
 * validate transactions based on the encapsulated data.
 */
export interface AccountAuthenticatorSDKType {
  id: bigint;
  type: string;
  data: Uint8Array;
}
function createBaseAccountAuthenticator(): AccountAuthenticator {
  return {
    id: BigInt(0),
    type: "",
    data: new Uint8Array(),
  };
}
export const AccountAuthenticator = {
  typeUrl: "/osmosis.authenticator.AccountAuthenticator",
  encode(
    message: AccountAuthenticator,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.id !== BigInt(0)) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.type !== "") {
      writer.uint32(18).string(message.type);
    }
    if (message.data.length !== 0) {
      writer.uint32(26).bytes(message.data);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): AccountAuthenticator {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccountAuthenticator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint64();
          break;
        case 2:
          message.type = reader.string();
          break;
        case 3:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<AccountAuthenticator>): AccountAuthenticator {
    const message = createBaseAccountAuthenticator();
    message.id =
      object.id !== undefined && object.id !== null
        ? BigInt(object.id.toString())
        : BigInt(0);
    message.type = object.type ?? "";
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromAmino(object: AccountAuthenticatorAmino): AccountAuthenticator {
    const message = createBaseAccountAuthenticator();
    if (object.id !== undefined && object.id !== null) {
      message.id = BigInt(object.id);
    }
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },
  toAmino(message: AccountAuthenticator): AccountAuthenticatorAmino {
    const obj: any = {};
    obj.id = message.id !== BigInt(0) ? message.id.toString() : undefined;
    obj.type = message.type === "" ? undefined : message.type;
    obj.data = message.data ? base64FromBytes(message.data) : undefined;
    return obj;
  },
  fromAminoMsg(object: AccountAuthenticatorAminoMsg): AccountAuthenticator {
    return AccountAuthenticator.fromAmino(object.value);
  },
  toAminoMsg(message: AccountAuthenticator): AccountAuthenticatorAminoMsg {
    return {
      type: "osmosis/authenticator/account-authenticator",
      value: AccountAuthenticator.toAmino(message),
    };
  },
  fromProtoMsg(message: AccountAuthenticatorProtoMsg): AccountAuthenticator {
    return AccountAuthenticator.decode(message.value);
  },
  toProto(message: AccountAuthenticator): Uint8Array {
    return AccountAuthenticator.encode(message).finish();
  },
  toProtoMsg(message: AccountAuthenticator): AccountAuthenticatorProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.AccountAuthenticator",
      value: AccountAuthenticator.encode(message).finish(),
    };
  },
};
