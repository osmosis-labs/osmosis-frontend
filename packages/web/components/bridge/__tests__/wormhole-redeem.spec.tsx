import "@testing-library/jest-dom";

import { apiClient } from "@osmosis-labs/utils";
import { fireEvent, render, screen } from "@testing-library/react";
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
  getSolanaExplorerUrl: jest.fn(
    ({ hash }: { hash: string }) => `https://solscan.io/tx/${hash}`
  ),
}));

// `@mysten/wallet-standard` ships as ESM-only and isn't run through Jest's
// transform pipeline, so we stub the surface our code touches.
jest.mock("@mysten/wallet-standard", () => ({
  getWallets: jest.fn(() => ({ get: () => [], on: () => () => {} })),
  signAndExecuteTransaction: jest.fn(),
}));

import {
  checkIfRedeemed,
  fetchGovernorDelay,
  findWormchainRecvTx,
  formatGovernorReleaseCountdown,
  lookupOsmosisIbcPacket,
  resolveOperation,
  WormholeRedeem,
} from "../wormhole-redeem";

const mockedApiClient = apiClient as unknown as jest.Mock;

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

const OSMOSIS_TX_EVENTS_FIXTURE = {
  tx_response: {
    events: [
      {
        type: "send_packet",
        attributes: [
          {
            key: "packet_data",
            value: JSON.stringify({
              amount: "1430080000",
              denom:
                "transfer/channel-2186/factory/wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx/46YEtoSN1AcwgGSRoWruoS6bnVh8XpMp5aQTpKohCJYh",
              memo: JSON.stringify({
                gateway_ibc_token_bridge_payload: {
                  gateway_transfer: {
                    chain: 21,
                    nonce: 6842,
                    recipient: "8kM+eKz+5u9Ycfebyyhr4y3dcLS/4zaKwfNMW2i2G7A=",
                    fee: "0",
                  },
                },
              }),
              receiver:
                "wormhole14ejqjyq8um4p3xfqj74yld5waqljf88fz25yxnma0cngspxe3les00fpjx",
              sender: "osmo1kwm9s5hjcvtxj9df6z5lxut2ecvaxstdyaz89m",
            }),
          },
          { key: "packet_sequence", value: "43411" },
          { key: "packet_src_channel", value: "channel-2186" },
          { key: "packet_dst_channel", value: "channel-3" },
        ],
      },
      {
        type: "ibc_transfer",
        attributes: [
          {
            key: "memo",
            value: JSON.stringify({
              gateway_ibc_token_bridge_payload: {
                gateway_transfer: {
                  chain: 21,
                  nonce: 6842,
                  recipient: "8kM+eKz+5u9Ycfebyyhr4y3dcLS/4zaKwfNMW2i2G7A=",
                  fee: "0",
                },
              },
            }),
          },
        ],
      },
    ],
  },
};

const OPERATION_SUI_COMPLETED = {
  id: "3104/aeb534c45c3049d380b9d9b966f9895f53abd4301bfaff407fa09dea8ae7a924/51994",
  emitterChain: 3104,
  emitterAddress: {
    hex: "aeb534c45c3049d380b9d9b966f9895f53abd4301bfaff407fa09dea8ae7a924",
    native:
      "wormhole1466nf3zuxpya8q9emxukd7vftaf6h4psr0a07srl5zw74zh84yjq4lyjmh",
  },
  sequence: "51994",
  vaa: { raw: btoa("fake-sui-vaa-bytes"), guardianSetIndex: 6 },
  content: {
    payload: {
      payloadType: 1,
      amount: "1430080000",
      tokenAddress:
        "0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3",
      tokenChain: 21,
      toAddress:
        "0xf2433e78acfee6ef5871f79bcb286be32ddd70b4bfe3368ac1f34c5b68b61bb0",
      toChain: 21,
      fee: "0",
    },
    standarizedProperties: {
      appIds: ["PORTAL_TOKEN_BRIDGE"],
      fromChain: 3104,
      fromAddress: "",
      toChain: 21,
      toAddress:
        "0xf2433e78acfee6ef5871f79bcb286be32ddd70b4bfe3368ac1f34c5b68b61bb0",
      tokenChain: 21,
      tokenAddress:
        "0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3",
      amount: "1430080000",
      fee: "0",
    },
  },
  sourceChain: {
    chainId: 3104,
    timestamp: "2026-05-07T03:09:53Z",
    transaction: {
      txHash:
        "0x6fd35ac0a9cf306fcf76c3d18d201aa5a152082caf0e58a6af47c07716953390",
    },
    from: "",
    status: "confirmed",
  },
  targetChain: {
    chainId: 21,
    timestamp: "2026-05-07T21:29:11Z",
    transaction: {
      txHash: "6JagZJ2r2R5tCnXxdsoNirQgkK9fYXK2Avp4oqQoioFY",
    },
    status: "completed",
  },
  data: {
    symbol: "SUI",
    tokenAmount: "14.3008",
    usdAmount: "13.87659536",
  },
};

const OSMOSIS_HASH =
  "76E201188AADA09CB977FD72626C857FB12253D86608B7E3E9F17F434818BED4";
const WORMCHAIN_HASH =
  "6FD35AC0A9CF306FCF76C3D18D201AA5A152082CAF0E58A6AF47C07716953390";

describe("lookupOsmosisIbcPacket", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("extracts the gateway packet sequence + memo from the first LCD that responds", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => OSMOSIS_TX_EVENTS_FIXTURE,
    });

    const packet = await lookupOsmosisIbcPacket(OSMOSIS_HASH, [
      "https://lcd-a.example",
    ]);
    expect(packet).toEqual({
      sequence: "43411",
      srcChannel: "channel-2186",
      dstChannel: "channel-3",
      destinationChain: 21,
      recipientBase64: "8kM+eKz+5u9Ycfebyyhr4y3dcLS/4zaKwfNMW2i2G7A=",
    });
  });

  it("falls back to the next LCD on non-200 responses", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => OSMOSIS_TX_EVENTS_FIXTURE,
      });

    const packet = await lookupOsmosisIbcPacket(OSMOSIS_HASH, [
      "https://lcd-a.example",
      "https://lcd-b.example",
    ]);
    expect(packet?.sequence).toBe("43411");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("throws a provider-outage error when every LCD returns 5xx", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

    await expect(
      lookupOsmosisIbcPacket(OSMOSIS_HASH, [
        "https://lcd-a.example",
        "https://lcd-b.example",
      ])
    ).rejects.toThrow(/Could not fetch Osmosis tx/);
  });

  it("throws a tx-not-found error when every LCD returns 404", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(
      lookupOsmosisIbcPacket(OSMOSIS_HASH, [
        "https://lcd-a.example",
        "https://lcd-b.example",
      ])
    ).rejects.toThrow(/Osmosis transaction not found/);
  });

  it("returns null when the tx exists but has no Wormhole gateway send_packet", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tx_response: {
          events: [
            {
              type: "send_packet",
              attributes: [
                { key: "packet_sequence", value: "1" },
                // A different IBC channel, not the Wormhole gateway. We must
                // not silently follow this packet to wormchain.
                { key: "packet_src_channel", value: "channel-0" },
                { key: "packet_dst_channel", value: "channel-141" },
              ],
            },
          ],
        },
      }),
    });

    const packet = await lookupOsmosisIbcPacket(OSMOSIS_HASH, [
      "https://lcd-a.example",
    ]);
    expect(packet).toBeNull();
  });
});

describe("findWormchainRecvTx", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("URL-encodes the Tendermint query and returns the first match hash", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: { txs: [{ hash: WORMCHAIN_HASH }], total_count: "1" },
      }),
    });
    global.fetch = fetchMock;

    const hash = await findWormchainRecvTx({
      sequence: "43411",
      srcChannel: "channel-2186",
      wormchainRpcs: ["https://wormchain-rpc.example"],
    });
    expect(hash).toBe(WORMCHAIN_HASH);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain(
      "https://wormchain-rpc.example/tx_search?query="
    );
    // The quoted query value should be URL-encoded (quote -> %22, etc.)
    expect(decodeURIComponent(calledUrl.split("query=")[1])).toBe(
      `"recv_packet.packet_sequence='43411' AND recv_packet.packet_src_channel='channel-2186'"`
    );
  });

  it("returns null when wormchain has not received the packet yet", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { txs: [], total_count: "0" } }),
    });

    const hash = await findWormchainRecvTx({
      sequence: "99999",
      srcChannel: "channel-2186",
    });
    expect(hash).toBeNull();
  });

  it("falls back to the next Wormchain RPC on a non-200 response", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 502 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { txs: [{ hash: WORMCHAIN_HASH }] } }),
      });
    global.fetch = fetchMock;

    const hash = await findWormchainRecvTx({
      sequence: "43411",
      srcChannel: "channel-2186",
      wormchainRpcs: [
        "https://wormchain-rpc-a.example",
        "https://wormchain-rpc-b.example",
      ],
    });
    expect(hash).toBe(WORMCHAIN_HASH);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws when every Wormchain RPC is down", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

    await expect(
      findWormchainRecvTx({
        sequence: "1",
        srcChannel: "channel-2186",
        wormchainRpcs: [
          "https://wormchain-rpc-a.example",
          "https://wormchain-rpc-b.example",
        ],
      })
    ).rejects.toThrow(/Could not query Wormchain RPC/);
  });
});

describe("resolveOperation", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("returns the operation directly when Wormholescan indexes the user-supplied hash", async () => {
    mockedApiClient.mockResolvedValueOnce({
      operations: [OPERATION_SUI_COMPLETED],
    });
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy;

    const resolved = await resolveOperation(WORMCHAIN_HASH);
    expect(resolved).toEqual({
      operation: OPERATION_SUI_COMPLETED,
      resolvedTxHash: WORMCHAIN_HASH,
      derivedFromOsmosis: false,
    });
    // No fallback chain hit when Wormholescan already has the operation.
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mockedApiClient).toHaveBeenCalledTimes(1);
  });

  it("falls back to Osmosis LCD -> wormchain RPC when Wormholescan does not index the hash", async () => {
    // 1st call (direct lookup): empty result
    // 2nd call (after wormchain resolution): the operation
    mockedApiClient
      .mockResolvedValueOnce({ operations: [] })
      .mockResolvedValueOnce({ operations: [OPERATION_SUI_COMPLETED] });

    global.fetch = jest
      .fn()
      // Osmosis LCD
      .mockResolvedValueOnce({
        ok: true,
        json: async () => OSMOSIS_TX_EVENTS_FIXTURE,
      })
      // Wormchain tx_search
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: { txs: [{ hash: WORMCHAIN_HASH }] },
        }),
      });

    const resolved = await resolveOperation(OSMOSIS_HASH);
    expect(resolved.operation).toEqual(OPERATION_SUI_COMPLETED);
    expect(resolved.resolvedTxHash).toBe(WORMCHAIN_HASH);
    expect(resolved.derivedFromOsmosis).toBe(true);
    expect(mockedApiClient).toHaveBeenCalledTimes(2);
  });

  it("throws a guardian-pending error when wormchain has the recv but Wormholescan has no VAA yet", async () => {
    mockedApiClient
      .mockResolvedValueOnce({ operations: [] })
      .mockResolvedValueOnce({ operations: [] });

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => OSMOSIS_TX_EVENTS_FIXTURE,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { txs: [{ hash: WORMCHAIN_HASH }] } }),
      });

    await expect(resolveOperation(OSMOSIS_HASH)).rejects.toThrow(
      /guardians may still be signing/i
    );
  });

  it("throws when wormchain has not received the packet yet (pending relay)", async () => {
    mockedApiClient.mockResolvedValueOnce({ operations: [] });

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => OSMOSIS_TX_EVENTS_FIXTURE,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { txs: [] } }),
      });

    await expect(resolveOperation(OSMOSIS_HASH)).rejects.toThrow(
      /has not been relayed yet/i
    );
  });

  it("rejects non-Cosmos-format hashes with the user-facing 'not found' message", async () => {
    mockedApiClient.mockResolvedValueOnce({ operations: [] });

    await expect(
      resolveOperation("not-a-cosmos-hash-just-some-garbage-input")
    ).rejects.toThrow(/Transaction not found/);
  });

  it("surfaces both possibilities when a 64-byte hex hash is on neither Wormholescan nor any Osmosis LCD", async () => {
    // The hash format alone can't disambiguate: it could be a wrong
    // Osmosis hash, or a valid Wormchain receive that Wormholescan
    // simply hasn't indexed yet. The error must say so.
    mockedApiClient.mockResolvedValueOnce({ operations: [] });
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(resolveOperation(OSMOSIS_HASH)).rejects.toThrow(
      /Wormchain receive hash/i
    );
  });
});

// Fixtures: a Wormchain-emitter operation with no VAA yet. Mirrors the
// shape of `/api/v1/operations` while the chain governor is holding the
// VAA (i.e. before `vaa.raw` is populated).
const OPERATION_WITHOUT_VAA = {
  ...OPERATION_SUI_COMPLETED,
  vaa: { raw: "", guardianSetIndex: 0 },
  targetChain: undefined,
} as const;

describe("fetchGovernorDelay", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("returns null when the operation already has a signed VAA", async () => {
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy;

    const result = await fetchGovernorDelay(OPERATION_SUI_COMPLETED as any);

    expect(result).toBeNull();
    // Skipping the governor lookups entirely keeps the happy path snappy.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns kind=enqueued with releaseTime when the VAA is in the chain's queue", async () => {
    const RELEASE_TIME = 1779540976; // matches enqueued_vaas.releaseTime

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isEnqueued: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              sequence: "51994",
              emitterAddress:
                "0xaeb534c45c3049d380b9d9b966f9895f53abd4301bfaff407fa09dea8ae7a924",
              chainId: 3104,
              releaseTime: RELEASE_TIME,
              txHash: "0xabc",
            },
          ],
        }),
      });

    const result = await fetchGovernorDelay(OPERATION_WITHOUT_VAA as any);

    expect(result).toEqual({
      kind: "enqueued",
      releaseTime: RELEASE_TIME,
      usdAmount: Number(OPERATION_SUI_COMPLETED.data.usdAmount),
    });
  });

  it("still returns kind=enqueued (without releaseTime) when the row isn't in the enqueued list yet", async () => {
    // Wormholescan occasionally returns `isEnqueued: true` slightly
    // before the enqueued list endpoint catches up. We must still show
    // the badge — just without a countdown — rather than suppressing it.
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isEnqueued: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    const result = await fetchGovernorDelay(OPERATION_WITHOUT_VAA as any);

    expect(result?.kind).toBe("enqueued");
    expect(result?.releaseTime).toBeUndefined();
  });

  it("returns kind=likely-enqueued when the transfer value exceeds the best guardian's headroom", async () => {
    // is_vaa_enqueued is `false` (propagation window). Fall back to
    // comparing the transfer's USD value against the chain's
    // max-available notional.
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isEnqueued: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { availableNotional: 10 } }),
      });

    const usdAmount = Number(OPERATION_SUI_COMPLETED.data.usdAmount);
    const result = await fetchGovernorDelay(OPERATION_WITHOUT_VAA as any);

    expect(result).toEqual({
      kind: "likely-enqueued",
      availableNotional: 10,
      usdAmount,
    });
  });

  it("returns null when the transfer fits within the available headroom", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isEnqueued: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { availableNotional: 1_000_000 } }),
      });

    const result = await fetchGovernorDelay(OPERATION_WITHOUT_VAA as any);

    expect(result).toBeNull();
  });

  it("returns null when the governor endpoints all fail", async () => {
    // Governor lookups are best-effort. A flaky guardian endpoint must
    // never block the user from at least seeing the existing
    // "VAA not yet available" error.
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const result = await fetchGovernorDelay(OPERATION_WITHOUT_VAA as any);

    expect(result).toBeNull();
  });

  it("returns null when usdAmount is not a finite number", async () => {
    // Wormholescan occasionally returns a non-numeric placeholder for
    // transfers the notional pricing service hasn't scored yet. Without
    // a number we can't render the badge meaningfully, so we bail
    // before even hitting the governor endpoints to avoid spurious
    // "$NaN" copy.
    const op = {
      ...OPERATION_WITHOUT_VAA,
      data: { ...OPERATION_WITHOUT_VAA.data, usdAmount: "n/a" },
    };
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy;

    const result = await fetchGovernorDelay(op as any);

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("WormholeRedeem governor_delayed render guard", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("does not mount a redeem panel for a Sui-destination op held by the governor", async () => {
    // resolveOperation: direct Wormholescan hit returns a VAA-less,
    // Sui-destination operation.
    mockedApiClient.mockResolvedValueOnce({
      operations: [OPERATION_WITHOUT_VAA],
    });
    // fetchGovernorDelay: the VAA is enqueued in the chain governor.
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isEnqueued: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    render(<WormholeRedeem />);

    fireEvent.change(
      screen.getByPlaceholderText("Osmosis transaction hash..."),
      { target: { value: WORMCHAIN_HASH } }
    );
    fireEvent.click(screen.getByText("Lookup"));

    // The governor delay badge renders for the queued transfer.
    expect(await screen.findByText("Daily limit exceeded")).toBeInTheDocument();

    // The Sui redeem panel must NOT mount: governor_delayed leaves
    // `operation.vaa.raw === ""`, and the panel would otherwise invite the
    // user to redeem an empty VAA. Both the native Sui panel and its
    // generic Wormholescan fallback advertise "VAA is signed and ready",
    // so its absence proves neither rendered.
    expect(
      screen.queryByText(/VAA is signed and ready/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Redeem on Sui")).not.toBeInTheDocument();
  });
});

describe("formatGovernorReleaseCountdown", () => {
  it("renders hours + minutes for long waits", () => {
    const now = 1_000_000_000_000;
    const releaseTime = Math.floor(now / 1000) + 3 * 3600 + 25 * 60;
    expect(formatGovernorReleaseCountdown(releaseTime, now)).toBe(
      "Releases in 3h 25m"
    );
  });

  it("renders minutes only when less than an hour remains", () => {
    const now = 1_000_000_000_000;
    const releaseTime = Math.floor(now / 1000) + 7 * 60;
    expect(formatGovernorReleaseCountdown(releaseTime, now)).toBe(
      "Releases in 7m"
    );
  });

  it("renders 'Releases shortly' for the last minute", () => {
    const now = 1_000_000_000_000;
    const releaseTime = Math.floor(now / 1000) + 30;
    expect(formatGovernorReleaseCountdown(releaseTime, now)).toBe(
      "Releases shortly"
    );
  });

  it("falls back to the generic 24h string when releaseTime is missing", () => {
    expect(formatGovernorReleaseCountdown(undefined)).toBe("Up to 24 hours");
  });
});
