import { SkipTransferStatusProvider } from "../skip/transfer-status";
import { SquidTransferStatusProvider } from "../squid/transfer-status";

// Status tracking must not eagerly load the quote/signing implementations.
jest.mock("../skip", () => {
  throw new Error("Skip status tracking loaded the bridge provider");
});
jest.mock("../squid", () => {
  throw new Error("Squid status tracking loaded the bridge provider");
});

describe("transfer status provider imports", () => {
  it("keeps the persisted Skip provider ID without loading the bridge", () => {
    const provider = new SkipTransferStatusProvider("mainnet", [], {
      transactionStatus: jest.fn(),
      trackTransaction: jest.fn(),
    });

    expect(provider.providerId).toBe("Skip");
  });

  it("keeps the persisted Squid provider ID without loading the bridge", () => {
    const provider = new SquidTransferStatusProvider(
      "integrator",
      "mainnet",
      []
    );

    expect(provider.providerId).toBe("Squid");
  });
});
