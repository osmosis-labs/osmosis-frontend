//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

import {
  MsgSplitRouteSwapExactAmountIn,
  MsgSplitRouteSwapExactAmountOut,
  MsgSwapExactAmountIn,
  MsgSwapExactAmountOut,
} from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ["/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn", MsgSwapExactAmountIn],
  ["/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut", MsgSwapExactAmountOut],
  [
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
    MsgSplitRouteSwapExactAmountIn,
  ],
  [
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
    MsgSplitRouteSwapExactAmountOut,
  ],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    swapExactAmountIn(value: MsgSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
        value: MsgSwapExactAmountIn.encode(value).finish(),
      };
    },
    swapExactAmountOut(value: MsgSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
        value: MsgSwapExactAmountOut.encode(value).finish(),
      };
    },
    splitRouteSwapExactAmountIn(value: MsgSplitRouteSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
        value: MsgSplitRouteSwapExactAmountIn.encode(value).finish(),
      };
    },
    splitRouteSwapExactAmountOut(value: MsgSplitRouteSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
        value: MsgSplitRouteSwapExactAmountOut.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    swapExactAmountIn(value: MsgSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
        value,
      };
    },
    swapExactAmountOut(value: MsgSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
        value,
      };
    },
    splitRouteSwapExactAmountIn(value: MsgSplitRouteSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
        value,
      };
    },
    splitRouteSwapExactAmountOut(value: MsgSplitRouteSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
        value,
      };
    },
  },
  fromPartial: {
    swapExactAmountIn(value: MsgSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
        value: MsgSwapExactAmountIn.fromPartial(value),
      };
    },
    swapExactAmountOut(value: MsgSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
        value: MsgSwapExactAmountOut.fromPartial(value),
      };
    },
    splitRouteSwapExactAmountIn(value: MsgSplitRouteSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
        value: MsgSplitRouteSwapExactAmountIn.fromPartial(value),
      };
    },
    splitRouteSwapExactAmountOut(value: MsgSplitRouteSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
        value: MsgSplitRouteSwapExactAmountOut.fromPartial(value),
      };
    },
  },
};
