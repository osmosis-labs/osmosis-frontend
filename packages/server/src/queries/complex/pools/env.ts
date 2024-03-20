import { IS_TESTNET } from "../../../env";

/** Cosmwasm Code Ids confirmed to be transmuter pools in current env. */
const TransmuterPoolCodeIds = IS_TESTNET ? ["3084"] : ["148"];
const AstroportPclPoolCodeIds = IS_TESTNET ? ["5005"] : ["580"];

export function getCosmwasmPoolTypeFromCodeId(
  codeId: string
): "cosmwasm-transmuter" | "cosmwasm-astroport-pcl" | "cosmwasm" {
  if (TransmuterPoolCodeIds.includes(codeId)) {
    return "cosmwasm-transmuter";
  }
  if (AstroportPclPoolCodeIds.includes(codeId)) {
    return "cosmwasm-astroport-pcl";
  }
  return "cosmwasm";
}
