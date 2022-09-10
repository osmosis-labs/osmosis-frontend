import { Plan } from "./upgrade";
import { AminoMsg } from "@cosmjs/amino";
import { Long } from "@osmonauts/helpers";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { Any } from "../../../google/protobuf/any";
import { MsgSoftwareUpgrade, MsgCancelUpgrade } from "./tx";
export interface AminoMsgSoftwareUpgrade extends AminoMsg {
  type: "cosmos-sdk/MsgSoftwareUpgrade";
  value: {
    authority: string;
    plan: {
      name: string;
      time: {
        seconds: string;
        nanos: number;
      };
      height: string;
      info: string;
      upgraded_client_state: {
        type_url: string;
        value: Uint8Array;
      };
    };
  };
}
export interface AminoMsgCancelUpgrade extends AminoMsg {
  type: "cosmos-sdk/MsgCancelUpgrade";
  value: {
    authority: string;
  };
}
export const AminoConverter = {
  "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade": {
    aminoType: "cosmos-sdk/MsgSoftwareUpgrade",
    toAmino: ({
      authority,
      plan
    }: MsgSoftwareUpgrade): AminoMsgSoftwareUpgrade["value"] => {
      return {
        authority,
        plan: {
          name: plan.name,
          time: plan.time,
          height: plan.height.toString(),
          info: plan.info,
          upgraded_client_state: {
            type_url: plan.upgradedClientState.typeUrl,
            value: plan.upgradedClientState.value
          }
        }
      };
    },
    fromAmino: ({
      authority,
      plan
    }: AminoMsgSoftwareUpgrade["value"]): MsgSoftwareUpgrade => {
      return {
        authority,
        plan: {
          name: plan.name,
          time: plan.time,
          height: Long.fromString(plan.height),
          info: plan.info,
          upgradedClientState: {
            typeUrl: plan.upgraded_client_state.type_url,
            value: plan.upgraded_client_state.value
          }
        }
      };
    }
  },
  "/cosmos.upgrade.v1beta1.MsgCancelUpgrade": {
    aminoType: "cosmos-sdk/MsgCancelUpgrade",
    toAmino: ({
      authority
    }: MsgCancelUpgrade): AminoMsgCancelUpgrade["value"] => {
      return {
        authority
      };
    },
    fromAmino: ({
      authority
    }: AminoMsgCancelUpgrade["value"]): MsgCancelUpgrade => {
      return {
        authority
      };
    }
  }
};