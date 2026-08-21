import { getAlloyedPoolCodeIds } from "@osmosis-labs/pools";

import { IS_TESTNET } from "../../../env";

/** Cosmwasm Code Ids confirmed to be transmuter pools in current env. */
export const TransmuterPoolCodeIds = IS_TESTNET ? ["3084"] : ["148"];
/** Cosmwasm Code Ids confirmed to be alloyed pools in current env. */
export const AlloyedPoolCodeIds = getAlloyedPoolCodeIds(IS_TESTNET);
const AstroportPclPoolCodeIds = IS_TESTNET ? ["8611"] : ["842"];
const WhitewhalePoolCodeIds = IS_TESTNET ? ["?"] : ["503", "641"];
/** Cosmwasm Code Ids confirmed to be orderbook pools in current env. */
export const OrderbookPoolCodeIds = IS_TESTNET ? ["?"] : ["885"];

/** Pool types that swap at a fixed 1:1 ratio with no price movement, so a quote
 *  against them cannot drift between quote and execution. Deliberately excludes
 *  `cosmwasm-astroport-pcl` (a concentrated AMM, with a dynamic spread factor),
 *  `cosmwasm-whitewhale` (an AMM), `cosmwasm-orderbook` (fills at book prices),
 *  and bare `cosmwasm` (unrecognised code id, unknown semantics). */
const OneToOnePoolTypes = ["cosmwasm-transmuter", "cosmwasm-alloyed"];

/** Whether a quoted pool swaps 1:1, so callers may demand the exact quoted
 *  amount out instead of allowing a slippage tolerance. Takes the pool `type`
 *  as it appears on a quote, which `getCosmwasmPoolTypeFromCodeId` has already
 *  narrowed to a CosmWasm subtype. */
export function isOneToOnePoolType(type: string): boolean {
  return OneToOnePoolTypes.includes(type);
}

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
