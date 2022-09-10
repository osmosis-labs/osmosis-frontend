import { AminoMsg } from "@cosmjs/amino";
import { MsgStoreCode, MsgInstantiateContract, MsgExecuteContract, MsgMigrateContract, MsgUpdateAdmin, MsgClearAdmin } from "./tx";
export interface AminoMsgStoreCode extends AminoMsg {
    type: "wasm/MsgStoreCode";
    value: {
        sender: string;
        wasm_byte_code: string;
        instantiate_permission: {
            permission: number;
            address: string;
        };
    };
}
export interface AminoMsgInstantiateContract extends AminoMsg {
    type: "wasm/MsgInstantiateContract";
    value: {
        sender: string;
        admin: string;
        code_id: string;
        label: string;
        msg: Uint8Array;
        funds: {
            denom: string;
            amount: string;
        }[];
    };
}
export interface AminoMsgExecuteContract extends AminoMsg {
    type: "wasm/MsgExecuteContract";
    value: {
        sender: string;
        contract: string;
        msg: Uint8Array;
        funds: {
            denom: string;
            amount: string;
        }[];
    };
}
export interface AminoMsgMigrateContract extends AminoMsg {
    type: "wasm/MsgMigrateContract";
    value: {
        sender: string;
        contract: string;
        code_id: string;
        msg: Uint8Array;
    };
}
export interface AminoMsgUpdateAdmin extends AminoMsg {
    type: "wasm/MsgUpdateAdmin";
    value: {
        sender: string;
        new_admin: string;
        contract: string;
    };
}
export interface AminoMsgClearAdmin extends AminoMsg {
    type: "wasm/MsgClearAdmin";
    value: {
        sender: string;
        contract: string;
    };
}
export declare const AminoConverter: {
    "/cosmwasm.wasm.v1.MsgStoreCode": {
        aminoType: string;
        toAmino: ({ sender, wasmByteCode, instantiatePermission }: MsgStoreCode) => AminoMsgStoreCode["value"];
        fromAmino: ({ sender, wasm_byte_code, instantiate_permission }: AminoMsgStoreCode["value"]) => MsgStoreCode;
    };
    "/cosmwasm.wasm.v1.MsgInstantiateContract": {
        aminoType: string;
        toAmino: ({ sender, admin, codeId, label, msg, funds }: MsgInstantiateContract) => AminoMsgInstantiateContract["value"];
        fromAmino: ({ sender, admin, code_id, label, msg, funds }: AminoMsgInstantiateContract["value"]) => MsgInstantiateContract;
    };
    "/cosmwasm.wasm.v1.MsgExecuteContract": {
        aminoType: string;
        toAmino: ({ sender, contract, msg, funds }: MsgExecuteContract) => AminoMsgExecuteContract["value"];
        fromAmino: ({ sender, contract, msg, funds }: AminoMsgExecuteContract["value"]) => MsgExecuteContract;
    };
    "/cosmwasm.wasm.v1.MsgMigrateContract": {
        aminoType: string;
        toAmino: ({ sender, contract, codeId, msg }: MsgMigrateContract) => AminoMsgMigrateContract["value"];
        fromAmino: ({ sender, contract, code_id, msg }: AminoMsgMigrateContract["value"]) => MsgMigrateContract;
    };
    "/cosmwasm.wasm.v1.MsgUpdateAdmin": {
        aminoType: string;
        toAmino: ({ sender, newAdmin, contract }: MsgUpdateAdmin) => AminoMsgUpdateAdmin["value"];
        fromAmino: ({ sender, new_admin, contract }: AminoMsgUpdateAdmin["value"]) => MsgUpdateAdmin;
    };
    "/cosmwasm.wasm.v1.MsgClearAdmin": {
        aminoType: string;
        toAmino: ({ sender, contract }: MsgClearAdmin) => AminoMsgClearAdmin["value"];
        fromAmino: ({ sender, contract }: AminoMsgClearAdmin["value"]) => MsgClearAdmin;
    };
};
