import { getAlloyedPoolCodeIds } from "@osmosis-labs/pools";

import { IS_TESTNET } from "../../../env";

/** Cosmwasm Code Ids confirmed to be transmuter pools in current env. */
export const TransmuterPoolCodeIds = IS_TESTNET
  ? ["3084", "4643", "8319", "11749"]
  : ["148"];
/** Cosmwasm Code Ids confirmed to be alloyed pools in current env. */
export const AlloyedPoolCodeIds = getAlloyedPoolCodeIds(IS_TESTNET);
const AstroportPclPoolCodeIds = IS_TESTNET ? ["5005", "8611"] : ["842"];
const WhitewhalePoolCodeIds = IS_TESTNET ? ["6688"] : ["503", "641"];
/** Cosmwasm Code Ids confirmed to be orderbook pools in current env. */
export const OrderbookPoolCodeIds = IS_TESTNET ? ["9373"] : ["885"];

export function getCosmwasmPoolTypeFromCodeId(
  codeId: string
):
  | "cosmwasm-transmuter"
  | "cosmwasm-alloyed"
  | "cosmwasm-astroport-pcl"
  | "cosmwasm-whitewhale"
  | "cosmwasm-orderbook"
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
  if (OrderbookPoolCodeIds.includes(codeId)) {
    return "cosmwasm-orderbook";
  }
  return "cosmwasm";
}
