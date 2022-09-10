import { AminoMsg } from "@cosmjs/amino";
import { MsgCreateSale, MsgSubscribe, MsgWithdraw, MsgExitSale, MsgFinalizeSale } from "./tx";
export interface AminoMsgCreateSale extends AminoMsg {
    type: "osmosis/streamswap/v1/create-sale";
    value: {
        creator: string;
        token_in: string;
        token_out: {
            denom: string;
            amount: string;
        };
        max_fee: {
            denom: string;
            amount: string;
        }[];
        start_time: {
            seconds: string;
            nanos: number;
        };
        duration: {
            seconds: string;
            nanos: number;
        };
        recipient: string;
        name: string;
        url: string;
    };
}
export interface AminoMsgSubscribe extends AminoMsg {
    type: "osmosis/streamswap/v1/subscribe";
    value: {
        sender: string;
        sale_id: string;
        amount: string;
    };
}
export interface AminoMsgWithdraw extends AminoMsg {
    type: "osmosis/streamswap/v1/withdraw";
    value: {
        sender: string;
        sale_id: string;
        amount: string;
    };
}
export interface AminoMsgExitSale extends AminoMsg {
    type: "osmosis/streamswap/v1/exit-sale";
    value: {
        sender: string;
        sale_id: string;
    };
}
export interface AminoMsgFinalizeSale extends AminoMsg {
    type: "osmosis/streamswap/v1/finalize-sale";
    value: {
        sender: string;
        sale_id: string;
    };
}
export declare const AminoConverter: {
    "/osmosis.streamswap.v1.MsgCreateSale": {
        aminoType: string;
        toAmino: ({ creator, tokenIn, tokenOut, maxFee, startTime, duration, recipient, name, url }: MsgCreateSale) => AminoMsgCreateSale["value"];
        fromAmino: ({ creator, token_in, token_out, max_fee, start_time, duration, recipient, name, url }: AminoMsgCreateSale["value"]) => MsgCreateSale;
    };
    "/osmosis.streamswap.v1.MsgSubscribe": {
        aminoType: string;
        toAmino: ({ sender, saleId, amount }: MsgSubscribe) => AminoMsgSubscribe["value"];
        fromAmino: ({ sender, sale_id, amount }: AminoMsgSubscribe["value"]) => MsgSubscribe;
    };
    "/osmosis.streamswap.v1.MsgWithdraw": {
        aminoType: string;
        toAmino: ({ sender, saleId, amount }: MsgWithdraw) => AminoMsgWithdraw["value"];
        fromAmino: ({ sender, sale_id, amount }: AminoMsgWithdraw["value"]) => MsgWithdraw;
    };
    "/osmosis.streamswap.v1.MsgExitSale": {
        aminoType: string;
        toAmino: ({ sender, saleId }: MsgExitSale) => AminoMsgExitSale["value"];
        fromAmino: ({ sender, sale_id }: AminoMsgExitSale["value"]) => MsgExitSale;
    };
    "/osmosis.streamswap.v1.MsgFinalizeSale": {
        aminoType: string;
        toAmino: ({ sender, saleId }: MsgFinalizeSale) => AminoMsgFinalizeSale["value"];
        fromAmino: ({ sender, sale_id }: AminoMsgFinalizeSale["value"]) => MsgFinalizeSale;
    };
};
