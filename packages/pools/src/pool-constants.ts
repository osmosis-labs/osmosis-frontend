/**
 * Shared pool constants that are environment-dependent.
 * These should be used across all packages to ensure consistency.
 */

/**
 * Gets the code IDs for alloyed pools based on the environment.
 * @param isTestnet Whether the current environment is testnet
 * @returns Array of code IDs for alloyed pools, empty array for testnet
 */
export function getAlloyedPoolCodeIds(isTestnet: boolean): string[] {
  return isTestnet ? [] : ["814", "867", "996"];
}

/**
 * Default alloyed pool code IDs for mainnet.
 * Use getAlloyedPoolCodeIds(isTestnet) when IS_TESTNET flag is available.
 */
export const ALLOYED_POOL_CODE_IDS_MAINNET = ["814", "867", "996"];
