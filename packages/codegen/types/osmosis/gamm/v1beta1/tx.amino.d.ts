import { AminoMsg } from "@cosmjs/amino";
import { MsgJoinPool, MsgExitPool, MsgSwapExactAmountIn, MsgSwapExactAmountOut, MsgJoinSwapExternAmountIn, MsgJoinSwapShareAmountOut, MsgExitSwapExternAmountOut, MsgExitSwapShareAmountIn } from "./tx";
export interface AminoMsgJoinPool extends AminoMsg {
    type: "osmosis/gamm/join-pool";
    value: {
        sender: string;
        pool_id: string;
        share_out_amount: string;
        token_in_maxs: {
            denom: string;
            amount: string;
        }[];
    };
}
export interface AminoMsgExitPool extends AminoMsg {
    type: "osmosis/gamm/exit-pool";
    value: {
        sender: string;
        pool_id: string;
        share_in_amount: string;
        token_out_mins: {
            denom: string;
            amount: string;
        }[];
    };
}
export interface AminoMsgSwapExactAmountIn extends AminoMsg {
    type: "osmosis/gamm/swap-exact-amount-in";
    value: {
        sender: string;
        routes: {
            pool_id: string;
            token_out_denom: string;
        }[];
        token_in: {
            denom: string;
            amount: string;
        };
        token_out_min_amount: string;
    };
}
export interface AminoMsgSwapExactAmountOut extends AminoMsg {
    type: "osmosis/gamm/swap-exact-amount-out";
    value: {
        sender: string;
        routes: {
            pool_id: string;
            token_in_denom: string;
        }[];
        token_in_max_amount: string;
        token_out: {
            denom: string;
            amount: string;
        };
    };
}
export interface AminoMsgJoinSwapExternAmountIn extends AminoMsg {
    type: "osmosis/gamm/join-swap-extern-amount-in";
    value: {
        sender: string;
        pool_id: string;
        token_in: {
            denom: string;
            amount: string;
        };
        share_out_min_amount: string;
    };
}
export interface AminoMsgJoinSwapShareAmountOut extends AminoMsg {
    type: "osmosis/gamm/join-swap-share-amount-out";
    value: {
        sender: string;
        pool_id: string;
        token_in_denom: string;
        share_out_amount: string;
        token_in_max_amount: string;
    };
}
export interface AminoMsgExitSwapExternAmountOut extends AminoMsg {
    type: "osmosis/gamm/exit-swap-extern-amount-out";
    value: {
        sender: string;
        pool_id: string;
        token_out: {
            denom: string;
            amount: string;
        };
        share_in_max_amount: string;
    };
}
export interface AminoMsgExitSwapShareAmountIn extends AminoMsg {
    type: "osmosis/gamm/exit-swap-share-amount-in";
    value: {
        sender: string;
        pool_id: string;
        token_out_denom: string;
        share_in_amount: string;
        token_out_min_amount: string;
    };
}
export declare const AminoConverter: {
    "/osmosis.gamm.v1beta1.MsgJoinPool": {
        aminoType: string;
        toAmino: ({ sender, poolId, shareOutAmount, tokenInMaxs }: MsgJoinPool) => AminoMsgJoinPool["value"];
        fromAmino: ({ sender, pool_id, share_out_amount, token_in_maxs }: AminoMsgJoinPool["value"]) => MsgJoinPool;
    };
    "/osmosis.gamm.v1beta1.MsgExitPool": {
        aminoType: string;
        toAmino: ({ sender, poolId, shareInAmount, tokenOutMins }: MsgExitPool) => AminoMsgExitPool["value"];
        fromAmino: ({ sender, pool_id, share_in_amount, token_out_mins }: AminoMsgExitPool["value"]) => MsgExitPool;
    };
    "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn": {
        aminoType: string;
        toAmino: ({ sender, routes, tokenIn, tokenOutMinAmount }: MsgSwapExactAmountIn) => AminoMsgSwapExactAmountIn["value"];
        fromAmino: ({ sender, routes, token_in, token_out_min_amount }: AminoMsgSwapExactAmountIn["value"]) => MsgSwapExactAmountIn;
    };
    "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut": {
        aminoType: string;
        toAmino: ({ sender, routes, tokenInMaxAmount, tokenOut }: MsgSwapExactAmountOut) => AminoMsgSwapExactAmountOut["value"];
        fromAmino: ({ sender, routes, token_in_max_amount, token_out }: AminoMsgSwapExactAmountOut["value"]) => MsgSwapExactAmountOut;
    };
    "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn": {
        aminoType: string;
        toAmino: ({ sender, poolId, tokenIn, shareOutMinAmount }: MsgJoinSwapExternAmountIn) => AminoMsgJoinSwapExternAmountIn["value"];
        fromAmino: ({ sender, pool_id, token_in, share_out_min_amount }: AminoMsgJoinSwapExternAmountIn["value"]) => MsgJoinSwapExternAmountIn;
    };
    "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut": {
        aminoType: string;
        toAmino: ({ sender, poolId, tokenInDenom, shareOutAmount, tokenInMaxAmount }: MsgJoinSwapShareAmountOut) => AminoMsgJoinSwapShareAmountOut["value"];
        fromAmino: ({ sender, pool_id, token_in_denom, share_out_amount, token_in_max_amount }: AminoMsgJoinSwapShareAmountOut["value"]) => MsgJoinSwapShareAmountOut;
    };
    "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut": {
        aminoType: string;
        toAmino: ({ sender, poolId, tokenOut, shareInMaxAmount }: MsgExitSwapExternAmountOut) => AminoMsgExitSwapExternAmountOut["value"];
        fromAmino: ({ sender, pool_id, token_out, share_in_max_amount }: AminoMsgExitSwapExternAmountOut["value"]) => MsgExitSwapExternAmountOut;
    };
    "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn": {
        aminoType: string;
        toAmino: ({ sender, poolId, tokenOutDenom, shareInAmount, tokenOutMinAmount }: MsgExitSwapShareAmountIn) => AminoMsgExitSwapShareAmountIn["value"];
        fromAmino: ({ sender, pool_id, token_out_denom, share_in_amount, token_out_min_amount }: AminoMsgExitSwapShareAmountIn["value"]) => MsgExitSwapShareAmountIn;
    };
};
