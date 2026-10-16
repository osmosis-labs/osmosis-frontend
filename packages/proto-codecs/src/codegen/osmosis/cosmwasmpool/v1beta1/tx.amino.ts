//@ts-nocheck
import { MsgCreateCosmWasmPool } from "./model/tx";
export const AminoConverter = {
  "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool": {
    aminoType: "osmosis/MsgCreateCosmWasmPool",
    toAmino: MsgCreateCosmWasmPool.toAmino,
    fromAmino: MsgCreateCosmWasmPool.fromAmino,
  },
};
