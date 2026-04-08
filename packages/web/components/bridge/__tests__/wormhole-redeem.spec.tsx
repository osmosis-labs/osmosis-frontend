import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import React from "react";

const mockClaimKey = {
  toBase58: () => "ClaimPDAAddress111111111111111111111111111111",
};

function MockPublicKey() {}
MockPublicKey.findProgramAddressSync = jest.fn(() => [mockClaimKey]);

jest.mock("@solana/web3.js", () => ({
  PublicKey: MockPublicKey,
}));

jest.mock("@osmosis-labs/server", () => ({
  DEFAULT_VS_CURRENCY: {
    currency: "USD",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
}));

jest.mock("~/utils/formatter", () => ({
  formatPretty: jest.fn(
    (price: { toString: () => string }) => `$${price.toString()}`
  ),
}));

jest.mock("@osmosis-labs/utils", () => ({
  apiClient: jest.fn(),
  shorten: jest.fn((s: string) =>
    s.length > 13 ? `${s.slice(0, 6)}...${s.slice(-5)}` : s
  ),
}));

import { checkIfRedeemed, WormholeRedeem } from "../wormhole-redeem";

const makeOperation = (overrides = {}) => ({
  id: "test-op",
  emitterChain: 20,
  emitterAddress: {
    hex: "0000000000000000000000000000000000000000000000000000000000000001",
    native: "osmo1...",
  },
  sequence: "12345",
  vaa: { raw: btoa("fake-vaa-bytes"), guardianSetIndex: 0 },
  content: {
    payload: {
      payloadType: 1,
      amount: "1000000",
      tokenAddress: "abc",
      tokenChain: 1,
      toAddress: "SolanaAddress111111111111111111111111111111111",
      toChain: 1,
      fee: "0",
    },
    standarizedProperties: {
      appIds: [],
      fromChain: 20,
      fromAddress: "osmo1abc...",
      toChain: 1,
      toAddress: "SolanaAddress111111111111111111111111111111111",
      tokenChain: 1,
      tokenAddress: "abc",
      amount: "1000000",
      fee: "0",
    },
  },
  sourceChain: {
    chainId: 20,
    timestamp: "2026-03-01T00:00:00Z",
    transaction: { txHash: "ABCDEF123456" },
    from: "osmo1sender...",
    status: "completed",
  },
  data: {
    symbol: "WSOL",
    tokenAmount: "60.2",
    usdAmount: "8345.00",
  },
  ...overrides,
});

describe("checkIfRedeemed", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns true when the claim PDA account exists", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { value: { data: ["AAAA", "base64"] } } }),
    });

    const result = await checkIfRedeemed(makeOperation() as any);
    expect(result).toBe(true);
  });

  it("returns false when the claim PDA account does not exist", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { value: null } }),
    });

    const result = await checkIfRedeemed(makeOperation() as any);
    expect(result).toBe(false);
  });

  it("returns false on RPC failure", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await checkIfRedeemed(makeOperation() as any);
    expect(result).toBe(false);
  });

  it("returns false on network error", async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Network error"));

    const result = await checkIfRedeemed(makeOperation() as any);
    expect(result).toBe(false);
  });
});

describe("WormholeRedeem", () => {
  it("renders the heading and input", () => {
    render(<WormholeRedeem />);

    expect(
      screen.getByText("Redeem a stuck Wormhole transfer")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Osmosis transaction hash...")
    ).toBeInTheDocument();
    expect(screen.getByText("Lookup")).toBeInTheDocument();
  });

  it("disables the lookup button when input is empty", () => {
    render(<WormholeRedeem />);

    const button = screen.getByText("Lookup");
    expect(button).toBeDisabled();
  });
});
