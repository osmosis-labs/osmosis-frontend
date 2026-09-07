//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import { MsgCreateCosmWasmPool } from "./model/tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  [
    "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool",
    MsgCreateCosmWasmPool,
  ],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    createCosmWasmPool(value: MsgCreateCosmWasmPool) {
      return {
        typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool",
        value: MsgCreateCosmWasmPool.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    createCosmWasmPool(value: MsgCreateCosmWasmPool) {
      return {
        typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool",
        value,
      };
    },
  },
  fromPartial: {
    createCosmWasmPool(value: MsgCreateCosmWasmPool) {
      return {
        typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool",
        value: MsgCreateCosmWasmPool.fromPartial(value),
      };
    },
  },
};
