import { AminoMsg } from "@cosmjs/amino";
import { MsgSubmitEvidence } from "./tx";
export interface AminoMsgSubmitEvidence extends AminoMsg {
    type: "cosmos-sdk/MsgSubmitEvidence";
    value: {
        submitter: string;
        evidence: {
            type_url: string;
            value: Uint8Array;
        };
    };
}
export declare const AminoConverter: {
    "/cosmos.evidence.v1beta1.MsgSubmitEvidence": {
        aminoType: string;
        toAmino: ({ submitter, evidence }: MsgSubmitEvidence) => AminoMsgSubmitEvidence["value"];
        fromAmino: ({ submitter, evidence }: AminoMsgSubmitEvidence["value"]) => MsgSubmitEvidence;
    };
};
