//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgCreateGauge, MsgAddToGauge } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ["/osmosis.incentives.MsgCreateGauge", MsgCreateGauge],
  ["/osmosis.incentives.MsgAddToGauge", MsgAddToGauge],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    createGauge(value: MsgCreateGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgCreateGauge",
        value: MsgCreateGauge.encode(value).finish(),
      };
    },
    addToGauge(value: MsgAddToGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgAddToGauge",
        value: MsgAddToGauge.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    createGauge(value: MsgCreateGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgCreateGauge",
        value,
      };
    },
    addToGauge(value: MsgAddToGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgAddToGauge",
        value,
      };
    },
  },
  fromPartial: {
    createGauge(value: MsgCreateGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgCreateGauge",
        value: MsgCreateGauge.fromPartial(value),
      };
    },
    addToGauge(value: MsgAddToGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgAddToGauge",
        value: MsgAddToGauge.fromPartial(value),
      };
    },
  },
};
