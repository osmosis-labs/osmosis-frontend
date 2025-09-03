import { IS_TESTNET } from "../../../env";

/** Cosmwasm Code Ids confirmed to be transmuter pools in current env. */
export const TransmuterPoolCodeIds = IS_TESTNET ? ["3084"] : ["148"];
/** Cosmwasm Code Ids confirmed to be alloyed pools in current env. */
export const AlloyedPoolCodeIds = IS_TESTNET ? [] : ["814", "867", "996"];
const AstroportPclPoolCodeIds = IS_TESTNET ? ["8611"] : ["842"];
const WhitewhalePoolCodeIds = IS_TESTNET ? ["?"] : ["503", "641"];

export function getCosmwasmPoolTypeFromCodeId(
  codeId: string
):
  | "cosmwasm-transmuter"
  | "cosmwasm-alloyed"
  | "cosmwasm-astroport-pcl"
  | "cosmwasm-whitewhale"
  | "cosmwasm" {
  if (TransmuterPoolCodeIds.includes(codeId)) {
    return "cosmwasm-transmuter";
  }
  if (AlloyedPoolCodeIds.includes(codeId)) {
    return "cosmwasm-alloyed";
  }
  if (AstroportPclPoolCodeIds.includes(codeId)) {
    return "cosmwasm-astroport-pcl";
  }
  if (WhitewhalePoolCodeIds.includes(codeId)) {
    return "cosmwasm-whitewhale";
  }
  return "cosmwasm";
}
