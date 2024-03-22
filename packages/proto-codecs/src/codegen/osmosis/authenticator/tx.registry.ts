//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import { MsgAddAuthenticator, MsgRemoveAuthenticator } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ["/osmosis.authenticator.MsgAddAuthenticator", MsgAddAuthenticator],
  ["/osmosis.authenticator.MsgRemoveAuthenticator", MsgRemoveAuthenticator],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    addAuthenticator(value: MsgAddAuthenticator) {
      return {
        typeUrl: "/osmosis.authenticator.MsgAddAuthenticator",
        value: MsgAddAuthenticator.encode(value).finish(),
      };
    },
    removeAuthenticator(value: MsgRemoveAuthenticator) {
      return {
        typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticator",
        value: MsgRemoveAuthenticator.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    addAuthenticator(value: MsgAddAuthenticator) {
      return {
        typeUrl: "/osmosis.authenticator.MsgAddAuthenticator",
        value,
      };
    },
    removeAuthenticator(value: MsgRemoveAuthenticator) {
      return {
        typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticator",
        value,
      };
    },
  },
  fromPartial: {
    addAuthenticator(value: MsgAddAuthenticator) {
      return {
        typeUrl: "/osmosis.authenticator.MsgAddAuthenticator",
        value: MsgAddAuthenticator.fromPartial(value),
      };
    },
    removeAuthenticator(value: MsgRemoveAuthenticator) {
      return {
        typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticator",
        value: MsgRemoveAuthenticator.fromPartial(value),
      };
    },
  },
};
