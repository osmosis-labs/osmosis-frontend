import { AminoMsg } from "@cosmjs/amino";
import { MsgVerifyInvariant } from "./tx";
export interface AminoMsgVerifyInvariant extends AminoMsg {
    type: "cosmos-sdk/MsgVerifyInvariant";
    value: {
        sender: string;
        invariant_module_name: string;
        invariant_route: string;
    };
}
export declare const AminoConverter: {
    "/cosmos.crisis.v1beta1.MsgVerifyInvariant": {
        aminoType: string;
        toAmino: ({ sender, invariantModuleName, invariantRoute }: MsgVerifyInvariant) => AminoMsgVerifyInvariant["value"];
        fromAmino: ({ sender, invariant_module_name, invariant_route }: AminoMsgVerifyInvariant["value"]) => MsgVerifyInvariant;
    };
};
