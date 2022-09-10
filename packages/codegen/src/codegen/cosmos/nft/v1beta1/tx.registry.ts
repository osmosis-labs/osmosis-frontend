import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgSend } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [["/cosmos.nft.v1beta1.MsgSend", MsgSend]];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    send(value: MsgSend) {
      return {
        typeUrl: "/cosmos.nft.v1beta1.MsgSend",
        value: MsgSend.encode(value).finish()
      };
    }

  },
  withTypeUrl: {
    send(value: MsgSend) {
      return {
        typeUrl: "/cosmos.nft.v1beta1.MsgSend",
        value
      };
    }

  },
  toJSON: {
    send(value: MsgSend) {
      return {
        typeUrl: "/cosmos.nft.v1beta1.MsgSend",
        value: MsgSend.toJSON(value)
      };
    }

  },
  fromJSON: {
    send(value: any) {
      return {
        typeUrl: "/cosmos.nft.v1beta1.MsgSend",
        value: MsgSend.fromJSON(value)
      };
    }

  },
  fromPartial: {
    send(value: MsgSend) {
      return {
        typeUrl: "/cosmos.nft.v1beta1.MsgSend",
        value: MsgSend.fromPartial(value)
      };
    }

  }
};