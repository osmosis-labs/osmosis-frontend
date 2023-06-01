//@ts-nocheck
import {
  MsgSplitRouteSwapExactAmountIn,
  MsgSplitRouteSwapExactAmountOut,
  MsgSwapExactAmountIn,
  MsgSwapExactAmountOut,
} from "./tx";
export const AminoConverter = {
  "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn": {
    aminoType: "osmosis/poolmanager/swap-exact-amount-in",
    toAmino: MsgSwapExactAmountIn.toAmino,
    fromAmino: MsgSwapExactAmountIn.fromAmino,
  },
  "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut": {
    aminoType: "osmosis/poolmanager/swap-exact-amount-out",
    toAmino: MsgSwapExactAmountOut.toAmino,
    fromAmino: MsgSwapExactAmountOut.fromAmino,
  },
  "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn": {
    aminoType: "osmosis/poolmanager/split-route-swap-exact-amount-in",
    toAmino: MsgSplitRouteSwapExactAmountIn.toAmino,
    fromAmino: MsgSplitRouteSwapExactAmountIn.fromAmino,
  },
  "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut": {
    aminoType: "osmosis/poolmanager/split-route-swap-exact-amount-out",
    toAmino: MsgSplitRouteSwapExactAmountOut.toAmino,
    fromAmino: MsgSplitRouteSwapExactAmountOut.fromAmino,
  },
};
