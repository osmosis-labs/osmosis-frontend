import { isSourceWalletConnected } from "../source-wallet";

const base = {
  isEvmWalletConnected: false,
  isCosmosWalletConnected: false,
  phantomAddress: undefined,
};

describe("isSourceWalletConnected", () => {
  it("is ready for a Solana source once Phantom is connected", () => {
    // Regression: Solana had no branch, so a Solana deposit could never
    // advance past the amount screen even with a valid quote.
    expect(
      isSourceWalletConnected({
        ...base,
        chainType: "solana",
        phantomAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      })
    ).toBe(true);
  });

  it("is not ready for a Solana source without Phantom", () => {
    expect(
      isSourceWalletConnected({
        ...base,
        chainType: "solana",
        // other wallets being connected must not stand in for Phantom
        isEvmWalletConnected: true,
        isCosmosWalletConnected: true,
      })
    ).toBe(false);
  });

  it("uses the EVM wallet for EVM sources", () => {
    expect(
      isSourceWalletConnected({
        ...base,
        chainType: "evm",
        isEvmWalletConnected: true,
      })
    ).toBe(true);
    expect(isSourceWalletConnected({ ...base, chainType: "evm" })).toBe(false);
  });

  it("uses the cosmos wallet for cosmos sources", () => {
    expect(
      isSourceWalletConnected({
        ...base,
        chainType: "cosmos",
        isCosmosWalletConnected: true,
      })
    ).toBe(true);
    expect(isSourceWalletConnected({ ...base, chainType: "cosmos" })).toBe(
      false
    );
  });

  it("is not ready for chain types that sign nothing in the app, or no chain", () => {
    expect(isSourceWalletConnected({ ...base, chainType: "bitcoin" })).toBe(
      false
    );
    expect(isSourceWalletConnected({ ...base, chainType: undefined })).toBe(
      false
    );
  });
});
