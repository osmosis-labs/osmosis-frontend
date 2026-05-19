type RegisteredWallet = { name: string };
const mockGet: jest.Mock<RegisteredWallet[], []> = jest.fn(() => []);
const mockOn: jest.Mock<() => void, [string, () => void]> = jest.fn(
  (_event: string, _listener: () => void) => () => undefined
);
jest.mock("@mysten/wallet-standard", () => ({
  getWallets: jest.fn(() => ({ get: mockGet, on: mockOn })),
  signAndExecuteTransaction: jest.fn(),
}));

import {
  buildSuiRedeemTransaction,
  decodeBase64Vaa,
  executeSuiRedeem,
  getCoinTypeForSuiVAA,
  getSuiPackageIds,
  listAvailableSuiWallets,
  normalizeSuiAddress,
  subscribeToAvailableSuiWallets,
  SuiRedeemError,
  WORMHOLE_SUI_CORE_STATE,
  WORMHOLE_SUI_TOKEN_BRIDGE_STATE,
} from "../wormhole-sui";

afterEach(() => {
  mockGet.mockReset();
  mockGet.mockReturnValue([]);
  mockOn.mockReset();
  mockOn.mockImplementation(() => () => undefined);
});

describe("normalizeSuiAddress", () => {
  it("pads short hex strings to 32 bytes and lowercases", () => {
    expect(normalizeSuiAddress("0xABC")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000abc"
    );
  });

  it("leaves fully-formed 32-byte addresses alone", () => {
    const addr =
      "0xf2433e78acfee6ef5871f79bcb286be32ddd70b4bfe3368ac1f34c5b68b61bb0";
    expect(normalizeSuiAddress(addr)).toBe(addr);
  });

  it("accepts un-prefixed hex and lowercases mixed case", () => {
    expect(
      normalizeSuiAddress(
        "F2433E78ACFEE6EF5871F79BCB286BE32DDD70B4BFE3368AC1F34C5B68B61BB0"
      )
    ).toBe(
      "0xf2433e78acfee6ef5871f79bcb286be32ddd70b4bfe3368ac1f34c5b68b61bb0"
    );
  });
});

describe("getCoinTypeForSuiVAA", () => {
  it("returns 0x2::sui::SUI for the canonical SUI native address", () => {
    expect(
      getCoinTypeForSuiVAA(
        21,
        "0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3"
      )
    ).toBe("0x2::sui::SUI");
  });

  it("normalizes the address before lookup (works without the 0x prefix)", () => {
    expect(
      getCoinTypeForSuiVAA(
        21,
        "9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3"
      )
    ).toBe("0x2::sui::SUI");
  });

  it("throws SuiRedeemError(unsupported_token) for unknown tokens", () => {
    expect(() =>
      getCoinTypeForSuiVAA(
        2, // chain 2 = Ethereum (e.g. USDC bridged from ETH)
        "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
      )
    ).toThrow(SuiRedeemError);
    try {
      getCoinTypeForSuiVAA(2, "0xdeadbeef");
    } catch (err) {
      expect(err).toBeInstanceOf(SuiRedeemError);
      expect((err as SuiRedeemError).code).toBe("unsupported_token");
    }
  });
});

describe("decodeBase64Vaa", () => {
  it("round-trips through atob to produce bytes", () => {
    const bytes = decodeBase64Vaa(btoa("hello"));
    expect(Array.from(bytes)).toEqual([
      "h".charCodeAt(0),
      "e".charCodeAt(0),
      "l".charCodeAt(0),
      "l".charCodeAt(0),
      "o".charCodeAt(0),
    ]);
  });
});

describe("getSuiPackageIds", () => {
  it("returns the upgrade_cap.fields.package from both state objects", async () => {
    const getObject = jest.fn(async ({ id }: { id: string }) => {
      if (id === WORMHOLE_SUI_CORE_STATE) {
        return {
          data: {
            content: {
              dataType: "moveObject",
              fields: {
                upgrade_cap: { fields: { package: "0xcorePkgAbc" } },
              },
            },
          },
        };
      }
      if (id === WORMHOLE_SUI_TOKEN_BRIDGE_STATE) {
        return {
          data: {
            content: {
              dataType: "moveObject",
              fields: {
                upgrade_cap: { fields: { package: "0xtbPkgDef" } },
              },
            },
          },
        };
      }
      throw new Error(`unexpected id: ${id}`);
    });

    const ids = await getSuiPackageIds({ getObject });
    expect(ids.corePackageId).toBe("0xcorePkgAbc");
    expect(ids.tokenBridgePackageId).toBe("0xtbPkgDef");
    expect(getObject).toHaveBeenCalledTimes(2);
  });

  it("throws when the state object isn't a Move object", async () => {
    const getObject = jest.fn(async () => ({
      data: { content: { dataType: "package" } },
    }));

    await expect(getSuiPackageIds({ getObject })).rejects.toThrow(
      SuiRedeemError
    );
  });

  it("throws when the upgrade_cap.package field is missing", async () => {
    const getObject = jest.fn(async () => ({
      data: {
        content: {
          dataType: "moveObject",
          fields: { upgrade_cap: { fields: {} } },
        },
      },
    }));

    await expect(getSuiPackageIds({ getObject })).rejects.toThrow(
      SuiRedeemError
    );
  });
});

describe("buildSuiRedeemTransaction", () => {
  // Avoid base64 decoding noise in the move-call shape assertions: a tiny
  // payload is fine for asserting structure.
  const vaaBase64 = btoa("X");
  const FAKE_CORE_PKG =
    "0x1111111111111111111111111111111111111111111111111111111111111111";
  const FAKE_TB_PKG =
    "0x2222222222222222222222222222222222222222222222222222222222222222";

  it("emits the five Wormhole Move calls in the canonical order", async () => {
    const tx = await buildSuiRedeemTransaction({
      vaaBase64,
      coinType: "0x2::sui::SUI",
      packageIds: {
        corePackageId: FAKE_CORE_PKG,
        tokenBridgePackageId: FAKE_TB_PKG,
      },
    });

    const commands = tx
      .getData()
      .commands.filter(
        (c): c is typeof c & { MoveCall: NonNullable<typeof c.MoveCall> } =>
          Boolean(c.MoveCall)
      );
    expect(commands).toHaveLength(5);

    const targets = commands.map(
      (c) =>
        `${c.MoveCall.package}::${c.MoveCall.module}::${c.MoveCall.function}`
    );
    expect(targets).toEqual([
      `${FAKE_CORE_PKG}::vaa::parse_and_verify`,
      `${FAKE_TB_PKG}::vaa::verify_only_once`,
      `${FAKE_TB_PKG}::complete_transfer::authorize_transfer`,
      `${FAKE_TB_PKG}::complete_transfer::redeem_relayer_payout`,
      `${FAKE_TB_PKG}::coin_utils::return_nonzero`,
    ]);

    // The three CoinType-parametric calls must carry the type argument.
    expect(commands[2].MoveCall.typeArguments).toEqual(["0x2::sui::SUI"]);
    expect(commands[3].MoveCall.typeArguments).toEqual(["0x2::sui::SUI"]);
    expect(commands[4].MoveCall.typeArguments).toEqual(["0x2::sui::SUI"]);
    // The VAA verification calls are not CoinType-generic.
    expect(commands[0].MoveCall.typeArguments).toEqual([]);
    expect(commands[1].MoveCall.typeArguments).toEqual([]);
  });
});

describe("executeSuiRedeem", () => {
  const recipient =
    "0xf2433e78acfee6ef5871f79bcb286be32ddd70b4bfe3368ac1f34c5b68b61bb0";

  it("rejects when the connected Sui account isn't the recipient", async () => {
    const connection = {
      id: "slush" as const,
      displayName: "Slush",
      address:
        "0x1111111111111111111111111111111111111111111111111111111111111111",
      wallet: {} as never,
    };

    await expect(
      executeSuiRedeem({
        vaaBase64: btoa("vaa"),
        recipient,
        tokenChain: 21,
        tokenAddressHex:
          "0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3",
        connection,
        suiClient: {
          getObject: jest.fn(),
          waitForTransaction: jest.fn(),
        },
      })
    ).rejects.toMatchObject({ code: "wallet_mismatch" });
  });

  it("includes the connected wallet displayName in the mismatch error so users know which wallet to switch", async () => {
    const connection = {
      id: "phantom" as const,
      displayName: "Phantom",
      address:
        "0x1111111111111111111111111111111111111111111111111111111111111111",
      wallet: {} as never,
    };

    await expect(
      executeSuiRedeem({
        vaaBase64: btoa("vaa"),
        recipient,
        tokenChain: 21,
        tokenAddressHex:
          "0x9258181f5ceac8dbffb7030890243caed69a9599d2886d957a9cb7656af3bdb3",
        connection,
        suiClient: {
          getObject: jest.fn(),
          waitForTransaction: jest.fn(),
        },
      })
    ).rejects.toMatchObject({
      code: "wallet_mismatch",
      message: expect.stringContaining("Phantom"),
    });
  });

  it("rejects unsupported tokens before touching the wallet", async () => {
    const connection = {
      id: "slush" as const,
      displayName: "Slush",
      address: recipient,
      wallet: {} as never,
    };
    const getObject = jest.fn();

    await expect(
      executeSuiRedeem({
        vaaBase64: btoa("vaa"),
        recipient,
        tokenChain: 2,
        tokenAddressHex:
          "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        connection,
        suiClient: {
          getObject,
          waitForTransaction: jest.fn(),
        },
      })
    ).rejects.toMatchObject({ code: "unsupported_token" });
    expect(getObject).not.toHaveBeenCalled();
  });
});

describe("listAvailableSuiWallets", () => {
  it("returns an empty list when no allowlisted wallets are registered", () => {
    mockGet.mockReturnValue([{ name: "Random Other Wallet" }]);
    expect(listAvailableSuiWallets()).toEqual([]);
  });

  it("returns Slush before Phantom (registry order) when both are present", () => {
    // Registered in reverse order to make sure we sort by registry, not
    // by Wallet Standard registration order.
    mockGet.mockReturnValue([
      { name: "Phantom" },
      { name: "Slush" },
      { name: "Some Other Wallet" },
    ]);

    const result = listAvailableSuiWallets();
    expect(result.map((w) => w.id)).toEqual(["slush", "phantom"]);
    expect(result[0].displayName).toBe("Slush");
    expect(result[1].displayName).toBe("Phantom");
  });

  it("accepts Slush legacy names (`Sui Wallet`)", () => {
    mockGet.mockReturnValue([{ name: "Sui Wallet" }]);
    const result = listAvailableSuiWallets();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("slush");
  });
});

describe("subscribeToAvailableSuiWallets", () => {
  it("emits the initial snapshot and re-emits on register/unregister events", () => {
    const listeners: Record<string, () => void> = {};
    mockOn.mockImplementation((event: string, listener: () => void) => {
      listeners[event] = listener;
      return () => {
        delete listeners[event];
      };
    });
    mockGet.mockReturnValue([{ name: "Slush" }]);

    const callback = jest.fn();
    const unsubscribe = subscribeToAvailableSuiWallets(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].map((w: { id: string }) => w.id)).toEqual([
      "slush",
    ]);

    // Simulate a Phantom wallet registering after subscription.
    mockGet.mockReturnValue([{ name: "Slush" }, { name: "Phantom" }]);
    listeners.register?.();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback.mock.calls[1][0].map((w: { id: string }) => w.id)).toEqual([
      "slush",
      "phantom",
    ]);

    unsubscribe();
    expect(Object.keys(listeners)).toEqual([]);
  });
});
