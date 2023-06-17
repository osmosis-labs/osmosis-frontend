//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import {
  MsgAddToPosition,
  MsgCollectIncentives,
  MsgCollectSpreadRewards,
  MsgCreatePosition,
  MsgWithdrawPosition,
} from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  [
    "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
    MsgCreatePosition,
  ],
  [
    "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
    MsgWithdrawPosition,
  ],
  ["/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition", MsgAddToPosition],
  [
    "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
    MsgCollectSpreadRewards,
  ],
  [
    "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
    MsgCollectIncentives,
  ],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    createPosition(value: MsgCreatePosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
        value: MsgCreatePosition.encode(value).finish(),
      };
    },
    withdrawPosition(value: MsgWithdrawPosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
        value: MsgWithdrawPosition.encode(value).finish(),
      };
    },
    addToPosition(value: MsgAddToPosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
        value: MsgAddToPosition.encode(value).finish(),
      };
    },
    collectSpreadRewards(value: MsgCollectSpreadRewards) {
      return {
        typeUrl:
          "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
        value: MsgCollectSpreadRewards.encode(value).finish(),
      };
    },
    collectIncentives(value: MsgCollectIncentives) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
        value: MsgCollectIncentives.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    createPosition(value: MsgCreatePosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
        value,
      };
    },
    withdrawPosition(value: MsgWithdrawPosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
        value,
      };
    },
    addToPosition(value: MsgAddToPosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
        value,
      };
    },
    collectSpreadRewards(value: MsgCollectSpreadRewards) {
      return {
        typeUrl:
          "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
        value,
      };
    },
    collectIncentives(value: MsgCollectIncentives) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
        value,
      };
    },
  },
  fromPartial: {
    createPosition(value: MsgCreatePosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
        value: MsgCreatePosition.fromPartial(value),
      };
    },
    withdrawPosition(value: MsgWithdrawPosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
        value: MsgWithdrawPosition.fromPartial(value),
      };
    },
    addToPosition(value: MsgAddToPosition) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
        value: MsgAddToPosition.fromPartial(value),
      };
    },
    collectSpreadRewards(value: MsgCollectSpreadRewards) {
      return {
        typeUrl:
          "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
        value: MsgCollectSpreadRewards.fromPartial(value),
      };
    },
    collectIncentives(value: MsgCollectIncentives) {
      return {
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
        value: MsgCollectIncentives.fromPartial(value),
      };
    },
  },
};
