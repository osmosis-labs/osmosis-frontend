//@ts-nocheck
/* eslint-disable */
import { MsgSwapExactAmountIn, MsgSwapExactAmountOut } from "./tx";
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
};
