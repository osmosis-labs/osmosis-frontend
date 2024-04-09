import { IS_TESTNET } from "../../../env";

/** Cosmwasm Code Ids confirmed to be transmuter pools in current env. */
const TransmuterPoolCodeIds = IS_TESTNET ? ["3084"] : ["148"];
const AstroportPclPoolCodeIds = IS_TESTNET ? ["5005"] : ["580"];
const WhitewhalePoolCodeIds = IS_TESTNET ? ["?"] : ["503", "641"];

export function getCosmwasmPoolTypeFromCodeId(
  codeId: string
):
  | "cosmwasm-transmuter"
  | "cosmwasm-astroport-pcl"
  | "cosmwasm-whitewhale"
  | "cosmwasm" {
  if (TransmuterPoolCodeIds.includes(codeId)) {
    return "cosmwasm-transmuter";
  }
  if (AstroportPclPoolCodeIds.includes(codeId)) {
    return "cosmwasm-astroport-pcl";
  }
  if (WhitewhalePoolCodeIds.includes(codeId)) {
    return "cosmwasm-whitewhale";
  }
  return "cosmwasm";
}
