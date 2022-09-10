import { AminoMsg } from "@cosmjs/amino";
import { MsgGrantAllowance, MsgRevokeAllowance } from "./tx";
export interface AminoMsgGrantAllowance extends AminoMsg {
    type: "cosmos-sdk/MsgGrantAllowance";
    value: {
        granter: string;
        grantee: string;
        allowance: {
            type_url: string;
            value: Uint8Array;
        };
    };
}
export interface AminoMsgRevokeAllowance extends AminoMsg {
    type: "cosmos-sdk/MsgRevokeAllowance";
    value: {
        granter: string;
        grantee: string;
    };
}
export declare const AminoConverter: {
    "/cosmos.feegrant.v1beta1.MsgGrantAllowance": {
        aminoType: string;
        toAmino: ({ granter, grantee, allowance }: MsgGrantAllowance) => AminoMsgGrantAllowance["value"];
        fromAmino: ({ granter, grantee, allowance }: AminoMsgGrantAllowance["value"]) => MsgGrantAllowance;
    };
    "/cosmos.feegrant.v1beta1.MsgRevokeAllowance": {
        aminoType: string;
        toAmino: ({ granter, grantee }: MsgRevokeAllowance) => AminoMsgRevokeAllowance["value"];
        fromAmino: ({ granter, grantee }: AminoMsgRevokeAllowance["value"]) => MsgRevokeAllowance;
    };
};
