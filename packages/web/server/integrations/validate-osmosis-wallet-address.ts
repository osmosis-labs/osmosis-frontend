import { fromBech32 } from "@cosmjs/encoding";

export class InvalidOsmosisWalletAddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOsmosisWalletAddressError";
  }
}

export function validateOsmosisWalletAddress(walletAddress: string): void {
  if (!walletAddress) {
    throw new InvalidOsmosisWalletAddressError("walletAddress is required");
  }

  try {
    const { prefix } = fromBech32(walletAddress);
    if (prefix !== "osmo") {
      throw new InvalidOsmosisWalletAddressError(
        "walletAddress must be an Osmosis (osmo) address"
      );
    }
  } catch (error) {
    if (error instanceof InvalidOsmosisWalletAddressError) {
      throw error;
    }

    throw new InvalidOsmosisWalletAddressError(
      "walletAddress must be a valid bech32 address"
    );
  }
}
