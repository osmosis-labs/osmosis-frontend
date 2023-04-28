//@ts-nocheck
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import {
  MsgJoinPool,
  MsgExitPool,
  MsgSwapExactAmountIn,
  MsgSwapExactAmountOut,
  MsgJoinSwapExternAmountIn,
  MsgJoinSwapShareAmountOut,
  MsgExitSwapExternAmountOut,
  MsgExitSwapShareAmountIn,
} from "./tx";
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  ["/osmosis.gamm.v1beta1.MsgJoinPool", MsgJoinPool],
  ["/osmosis.gamm.v1beta1.MsgExitPool", MsgExitPool],
  ["/osmosis.gamm.v1beta1.MsgSwapExactAmountIn", MsgSwapExactAmountIn],
  ["/osmosis.gamm.v1beta1.MsgSwapExactAmountOut", MsgSwapExactAmountOut],
  [
    "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
    MsgJoinSwapExternAmountIn,
  ],
  [
    "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut",
    MsgJoinSwapShareAmountOut,
  ],
  [
    "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut",
    MsgExitSwapExternAmountOut,
  ],
  ["/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn", MsgExitSwapShareAmountIn],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    joinPool(value: MsgJoinPool) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
        value: MsgJoinPool.encode(value).finish(),
      };
    },
    exitPool(value: MsgExitPool) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitPool",
        value: MsgExitPool.encode(value).finish(),
      };
    },
    swapExactAmountIn(value: MsgSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
        value: MsgSwapExactAmountIn.encode(value).finish(),
      };
    },
    swapExactAmountOut(value: MsgSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut",
        value: MsgSwapExactAmountOut.encode(value).finish(),
      };
    },
    joinSwapExternAmountIn(value: MsgJoinSwapExternAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
        value: MsgJoinSwapExternAmountIn.encode(value).finish(),
      };
    },
    joinSwapShareAmountOut(value: MsgJoinSwapShareAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut",
        value: MsgJoinSwapShareAmountOut.encode(value).finish(),
      };
    },
    exitSwapExternAmountOut(value: MsgExitSwapExternAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut",
        value: MsgExitSwapExternAmountOut.encode(value).finish(),
      };
    },
    exitSwapShareAmountIn(value: MsgExitSwapShareAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn",
        value: MsgExitSwapShareAmountIn.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    joinPool(value: MsgJoinPool) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
        value,
      };
    },
    exitPool(value: MsgExitPool) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitPool",
        value,
      };
    },
    swapExactAmountIn(value: MsgSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
        value,
      };
    },
    swapExactAmountOut(value: MsgSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut",
        value,
      };
    },
    joinSwapExternAmountIn(value: MsgJoinSwapExternAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
        value,
      };
    },
    joinSwapShareAmountOut(value: MsgJoinSwapShareAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut",
        value,
      };
    },
    exitSwapExternAmountOut(value: MsgExitSwapExternAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut",
        value,
      };
    },
    exitSwapShareAmountIn(value: MsgExitSwapShareAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn",
        value,
      };
    },
  },
  fromPartial: {
    joinPool(value: MsgJoinPool) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
        value: MsgJoinPool.fromPartial(value),
      };
    },
    exitPool(value: MsgExitPool) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitPool",
        value: MsgExitPool.fromPartial(value),
      };
    },
    swapExactAmountIn(value: MsgSwapExactAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
        value: MsgSwapExactAmountIn.fromPartial(value),
      };
    },
    swapExactAmountOut(value: MsgSwapExactAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut",
        value: MsgSwapExactAmountOut.fromPartial(value),
      };
    },
    joinSwapExternAmountIn(value: MsgJoinSwapExternAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
        value: MsgJoinSwapExternAmountIn.fromPartial(value),
      };
    },
    joinSwapShareAmountOut(value: MsgJoinSwapShareAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut",
        value: MsgJoinSwapShareAmountOut.fromPartial(value),
      };
    },
    exitSwapExternAmountOut(value: MsgExitSwapExternAmountOut) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut",
        value: MsgExitSwapExternAmountOut.fromPartial(value),
      };
    },
    exitSwapShareAmountIn(value: MsgExitSwapShareAmountIn) {
      return {
        typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn",
        value: MsgExitSwapShareAmountIn.fromPartial(value),
      };
    },
  },
};
