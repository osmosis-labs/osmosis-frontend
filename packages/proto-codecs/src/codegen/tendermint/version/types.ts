//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../helpers";
/**
 * App includes the protocol and software version for the application.
 * This information is included in ResponseInfo. The App.Protocol can be
 * updated in ResponseEndBlock.
 */
export interface App {
  protocol: Long;
  software: string;
}
export interface AppProtoMsg {
  typeUrl: "/tendermint.version.App";
  value: Uint8Array;
}
/**
 * App includes the protocol and software version for the application.
 * This information is included in ResponseInfo. The App.Protocol can be
 * updated in ResponseEndBlock.
 */
export interface AppAmino {
  protocol: string;
  software: string;
}
export interface AppAminoMsg {
  type: "/tendermint.version.App";
  value: AppAmino;
}
/**
 * App includes the protocol and software version for the application.
 * This information is included in ResponseInfo. The App.Protocol can be
 * updated in ResponseEndBlock.
 */
export interface AppSDKType {
  protocol: Long;
  software: string;
}
/**
 * Consensus captures the consensus rules for processing a block in the blockchain,
 * including all blockchain data structures and the rules of the application's
 * state transition machine.
 */
export interface Consensus {
  block: Long;
  app: Long;
}
export interface ConsensusProtoMsg {
  typeUrl: "/tendermint.version.Consensus";
  value: Uint8Array;
}
/**
 * Consensus captures the consensus rules for processing a block in the blockchain,
 * including all blockchain data structures and the rules of the application's
 * state transition machine.
 */
export interface ConsensusAmino {
  block: string;
  app: string;
}
export interface ConsensusAminoMsg {
  type: "/tendermint.version.Consensus";
  value: ConsensusAmino;
}
/**
 * Consensus captures the consensus rules for processing a block in the blockchain,
 * including all blockchain data structures and the rules of the application's
 * state transition machine.
 */
export interface ConsensusSDKType {
  block: Long;
  app: Long;
}
function createBaseApp(): App {
  return {
    protocol: Long.UZERO,
    software: "",
  };
}
export const App = {
  typeUrl: "/tendermint.version.App",
  encode(message: App, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.protocol.isZero()) {
      writer.uint32(8).uint64(message.protocol);
    }
    if (message.software !== "") {
      writer.uint32(18).string(message.software);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): App {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseApp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.protocol = reader.uint64() as Long;
          break;
        case 2:
          message.software = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<App>): App {
    const message = createBaseApp();
    message.protocol =
      object.protocol !== undefined && object.protocol !== null
        ? Long.fromValue(object.protocol)
        : Long.UZERO;
    message.software = object.software ?? "";
    return message;
  },
  fromAmino(object: AppAmino): App {
    return {
      protocol: Long.fromString(object.protocol),
      software: object.software,
    };
  },
  toAmino(message: App): AppAmino {
    const obj: any = {};
    obj.protocol = message.protocol ? message.protocol.toString() : undefined;
    obj.software = message.software;
    return obj;
  },
  fromAminoMsg(object: AppAminoMsg): App {
    return App.fromAmino(object.value);
  },
  fromProtoMsg(message: AppProtoMsg): App {
    return App.decode(message.value);
  },
  toProto(message: App): Uint8Array {
    return App.encode(message).finish();
  },
  toProtoMsg(message: App): AppProtoMsg {
    return {
      typeUrl: "/tendermint.version.App",
      value: App.encode(message).finish(),
    };
  },
};
function createBaseConsensus(): Consensus {
  return {
    block: Long.UZERO,
    app: Long.UZERO,
  };
}
export const Consensus = {
  typeUrl: "/tendermint.version.Consensus",
  encode(
    message: Consensus,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.block.isZero()) {
      writer.uint32(8).uint64(message.block);
    }
    if (!message.app.isZero()) {
      writer.uint32(16).uint64(message.app);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Consensus {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConsensus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.block = reader.uint64() as Long;
          break;
        case 2:
          message.app = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Consensus>): Consensus {
    const message = createBaseConsensus();
    message.block =
      object.block !== undefined && object.block !== null
        ? Long.fromValue(object.block)
        : Long.UZERO;
    message.app =
      object.app !== undefined && object.app !== null
        ? Long.fromValue(object.app)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: ConsensusAmino): Consensus {
    return {
      block: Long.fromString(object.block),
      app: Long.fromString(object.app),
    };
  },
  toAmino(message: Consensus): ConsensusAmino {
    const obj: any = {};
    obj.block = message.block ? message.block.toString() : undefined;
    obj.app = message.app ? message.app.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: ConsensusAminoMsg): Consensus {
    return Consensus.fromAmino(object.value);
  },
  fromProtoMsg(message: ConsensusProtoMsg): Consensus {
    return Consensus.decode(message.value);
  },
  toProto(message: Consensus): Uint8Array {
    return Consensus.encode(message).finish();
  },
  toProtoMsg(message: Consensus): ConsensusProtoMsg {
    return {
      typeUrl: "/tendermint.version.Consensus",
      value: Consensus.encode(message).finish(),
    };
  },
};
