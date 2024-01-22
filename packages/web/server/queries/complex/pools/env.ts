import { IS_TESTNET } from "~/config";

/** Cosmwasm Code Ids confirmed to be transmuter pools in current env. */
export const TransmuterPoolCodeIds = IS_TESTNET ? ["3084"] : ["148"];
