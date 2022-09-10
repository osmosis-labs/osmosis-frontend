import { Coin } from "../../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { Duration } from "../../../google/protobuf/duration";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgCreateSale, MsgSubscribe, MsgWithdraw, MsgExitSale, MsgFinalizeSale } from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [["/osmosis.streamswap.v1.MsgCreateSale", MsgCreateSale], ["/osmosis.streamswap.v1.MsgSubscribe", MsgSubscribe], ["/osmosis.streamswap.v1.MsgWithdraw", MsgWithdraw], ["/osmosis.streamswap.v1.MsgExitSale", MsgExitSale], ["/osmosis.streamswap.v1.MsgFinalizeSale", MsgFinalizeSale]];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    createSale(value: MsgCreateSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgCreateSale",
        value: MsgCreateSale.encode(value).finish()
      };
    },

    subscribe(value: MsgSubscribe) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgSubscribe",
        value: MsgSubscribe.encode(value).finish()
      };
    },

    withdraw(value: MsgWithdraw) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgWithdraw",
        value: MsgWithdraw.encode(value).finish()
      };
    },

    exitSale(value: MsgExitSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgExitSale",
        value: MsgExitSale.encode(value).finish()
      };
    },

    finalizeSale(value: MsgFinalizeSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgFinalizeSale",
        value: MsgFinalizeSale.encode(value).finish()
      };
    }

  },
  withTypeUrl: {
    createSale(value: MsgCreateSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgCreateSale",
        value
      };
    },

    subscribe(value: MsgSubscribe) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgSubscribe",
        value
      };
    },

    withdraw(value: MsgWithdraw) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgWithdraw",
        value
      };
    },

    exitSale(value: MsgExitSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgExitSale",
        value
      };
    },

    finalizeSale(value: MsgFinalizeSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgFinalizeSale",
        value
      };
    }

  },
  toJSON: {
    createSale(value: MsgCreateSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgCreateSale",
        value: MsgCreateSale.toJSON(value)
      };
    },

    subscribe(value: MsgSubscribe) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgSubscribe",
        value: MsgSubscribe.toJSON(value)
      };
    },

    withdraw(value: MsgWithdraw) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgWithdraw",
        value: MsgWithdraw.toJSON(value)
      };
    },

    exitSale(value: MsgExitSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgExitSale",
        value: MsgExitSale.toJSON(value)
      };
    },

    finalizeSale(value: MsgFinalizeSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgFinalizeSale",
        value: MsgFinalizeSale.toJSON(value)
      };
    }

  },
  fromJSON: {
    createSale(value: any) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgCreateSale",
        value: MsgCreateSale.fromJSON(value)
      };
    },

    subscribe(value: any) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgSubscribe",
        value: MsgSubscribe.fromJSON(value)
      };
    },

    withdraw(value: any) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgWithdraw",
        value: MsgWithdraw.fromJSON(value)
      };
    },

    exitSale(value: any) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgExitSale",
        value: MsgExitSale.fromJSON(value)
      };
    },

    finalizeSale(value: any) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgFinalizeSale",
        value: MsgFinalizeSale.fromJSON(value)
      };
    }

  },
  fromPartial: {
    createSale(value: MsgCreateSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgCreateSale",
        value: MsgCreateSale.fromPartial(value)
      };
    },

    subscribe(value: MsgSubscribe) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgSubscribe",
        value: MsgSubscribe.fromPartial(value)
      };
    },

    withdraw(value: MsgWithdraw) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgWithdraw",
        value: MsgWithdraw.fromPartial(value)
      };
    },

    exitSale(value: MsgExitSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgExitSale",
        value: MsgExitSale.fromPartial(value)
      };
    },

    finalizeSale(value: MsgFinalizeSale) {
      return {
        typeUrl: "/osmosis.streamswap.v1.MsgFinalizeSale",
        value: MsgFinalizeSale.fromPartial(value)
      };
    }

  }
};