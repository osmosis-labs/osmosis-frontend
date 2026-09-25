import type { BridgeChain } from "@osmosis-labs/bridge";

/**
 * Whether the wallet that must sign on the transfer's source chain is
 * connected. Gates `isDepositReady`, and through it whether the transfer can
 * advance at all, so every chain type that can originate a signed deposit
 * needs a branch here: a missing one silently leaves Confirm disabled even
 * with a valid quote and a connected wallet.
 */
export function isSourceWalletConnected({
  chainType,
  isEvmWalletConnected,
  isCosmosWalletConnected,
  phantomAddress,
}: {
  chainType: BridgeChain["chainType"] | undefined;
  isEvmWalletConnected: boolean;
  isCosmosWalletConnected: boolean;
  /** The connected Phantom account, when any. */
  phantomAddress: string | undefined;
}): boolean {
  switch (chainType) {
    case "evm":
      return isEvmWalletConnected;
    case "cosmos":
      return isCosmosWalletConnected;
    case "solana":
      return Boolean(phantomAddress);
    default:
      return false;
  }
}
