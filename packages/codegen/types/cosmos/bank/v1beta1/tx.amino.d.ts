import { AminoMsg } from "@cosmjs/amino";
import { MsgSend, MsgMultiSend } from "./tx";
export interface AminoMsgSend extends AminoMsg {
    type: "cosmos-sdk/MsgSend";
    value: {
        from_address: string;
        to_address: string;
        amount: {
            denom: string;
            amount: string;
        }[];
    };
}
export interface AminoMsgMultiSend extends AminoMsg {
    type: "cosmos-sdk/MsgMultiSend";
    value: {
        inputs: {
            address: string;
            coins: {
                denom: string;
                amount: string;
            }[];
        }[];
        outputs: {
            address: string;
            coins: {
                denom: string;
                amount: string;
            }[];
        }[];
    };
}
export declare const AminoConverter: {
    "/cosmos.bank.v1beta1.MsgSend": {
        aminoType: string;
        toAmino: ({ fromAddress, toAddress, amount }: MsgSend) => AminoMsgSend["value"];
        fromAmino: ({ from_address, to_address, amount }: AminoMsgSend["value"]) => MsgSend;
    };
    "/cosmos.bank.v1beta1.MsgMultiSend": {
        aminoType: string;
        toAmino: ({ inputs, outputs }: MsgMultiSend) => AminoMsgMultiSend["value"];
        fromAmino: ({ inputs, outputs }: AminoMsgMultiSend["value"]) => MsgMultiSend;
    };
};
