import { QueryCondition } from "../lockup/lock";
import { Coin } from "../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../google/protobuf/timestamp";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgCreateGauge, MsgAddToGauge } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [["/osmosis.incentives.MsgCreateGauge", MsgCreateGauge], ["/osmosis.incentives.MsgAddToGauge", MsgAddToGauge]];
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
        value: MsgCreateGauge.encode(value).finish()
      };
    },

    addToGauge(value: MsgAddToGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgAddToGauge",
        value: MsgAddToGauge.encode(value).finish()
      };
    }

  },
  withTypeUrl: {
    createGauge(value: MsgCreateGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgCreateGauge",
        value
      };
    },

    addToGauge(value: MsgAddToGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgAddToGauge",
        value
      };
    }

  },
  toJSON: {
    createGauge(value: MsgCreateGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgCreateGauge",
        value: MsgCreateGauge.toJSON(value)
      };
    },

    addToGauge(value: MsgAddToGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgAddToGauge",
        value: MsgAddToGauge.toJSON(value)
      };
    }

  },
  fromJSON: {
    createGauge(value: any) {
      return {
        typeUrl: "/osmosis.incentives.MsgCreateGauge",
        value: MsgCreateGauge.fromJSON(value)
      };
    },

    addToGauge(value: any) {
      return {
        typeUrl: "/osmosis.incentives.MsgAddToGauge",
        value: MsgAddToGauge.fromJSON(value)
      };
    }

  },
  fromPartial: {
    createGauge(value: MsgCreateGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgCreateGauge",
        value: MsgCreateGauge.fromPartial(value)
      };
    },

    addToGauge(value: MsgAddToGauge) {
      return {
        typeUrl: "/osmosis.incentives.MsgAddToGauge",
        value: MsgAddToGauge.fromPartial(value)
      };
    }

  }
};