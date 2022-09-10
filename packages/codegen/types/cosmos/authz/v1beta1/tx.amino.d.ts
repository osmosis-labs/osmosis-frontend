import { AminoMsg } from "@cosmjs/amino";
import { MsgGrant, MsgExec, MsgRevoke } from "./tx";
export interface AminoMsgGrant extends AminoMsg {
    type: "cosmos-sdk/MsgGrant";
    value: {
        granter: string;
        grantee: string;
        grant: {
            authorization: {
                type_url: string;
                value: Uint8Array;
            };
            expiration: {
                seconds: string;
                nanos: number;
            };
        };
    };
}
export interface AminoMsgExec extends AminoMsg {
    type: "cosmos-sdk/MsgExec";
    value: {
        grantee: string;
        msgs: {
            type_url: string;
            value: Uint8Array;
        }[];
    };
}
export interface AminoMsgRevoke extends AminoMsg {
    type: "cosmos-sdk/MsgRevoke";
    value: {
        granter: string;
        grantee: string;
        msg_type_url: string;
    };
}
export declare const AminoConverter: {
    "/cosmos.authz.v1beta1.MsgGrant": {
        aminoType: string;
        toAmino: ({ granter, grantee, grant }: MsgGrant) => AminoMsgGrant["value"];
        fromAmino: ({ granter, grantee, grant }: AminoMsgGrant["value"]) => MsgGrant;
    };
    "/cosmos.authz.v1beta1.MsgExec": {
        aminoType: string;
        toAmino: ({ grantee, msgs }: MsgExec) => AminoMsgExec["value"];
        fromAmino: ({ grantee, msgs }: AminoMsgExec["value"]) => MsgExec;
    };
    "/cosmos.authz.v1beta1.MsgRevoke": {
        aminoType: string;
        toAmino: ({ granter, grantee, msgTypeUrl }: MsgRevoke) => AminoMsgRevoke["value"];
        fromAmino: ({ granter, grantee, msg_type_url }: AminoMsgRevoke["value"]) => MsgRevoke;
    };
};
