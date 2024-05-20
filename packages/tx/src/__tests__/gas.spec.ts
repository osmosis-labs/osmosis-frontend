import { Dec } from "@keplr-wallet/unit";
import {
  queryBalances,
  queryBaseAccount,
  queryFeesBaseDenom,
  queryFeeTokens,
  queryFeeTokenSpotPrice,
  queryGasPrice,
  sendTxSimulate,
} from "@osmosis-labs/server";
import { ApiClientError } from "@osmosis-labs/utils";
import { Any } from "cosmjs-types/google/protobuf/any";

import {
  DefaultGasPriceStep,
  getGasFeeAmount,
  getGasPrice,
  getGasPriceByFeeDenom,
  InsufficientFeeError,
  simulateMsgs,
  SimulateNotAvailableError,
} from "../gas";
import { MockChains } from "./mock-chains";

jest.mock("@osmosis-labs/server");

describe("simulateMsgs", () => {
  const chainId = "osmosis-1";
  const chainList = [
    { chain_id: chainId, features: ["osmosis-txfees"] },
  ] as any;
  // we'll mock the response to simulate fees, so we assume it works if
  // messages are given
  const encodedMessages: Any[] = [];
  const bech32Address = "osmo1address";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return gasUsed on successful simulation", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: { sequence: "1" },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockResolvedValue({
      gas_info: { gas_used: "200000" },
    } as Awaited<ReturnType<typeof sendTxSimulate>>);

    const result = await simulateMsgs({
      chainId,
      chainList,
      encodedMessages,
      bech32Address,
    });

    expect(result).toEqual({ gasUsed: 200000 });
  });

  it("should throw an error if chain is not found", async () => {
    await expect(
      simulateMsgs({
        chainId: "unknown-chain",
        chainList,
        encodedMessages,
        bech32Address,
      })
    ).rejects.toThrow("Chain not found: unknown-chain");
  });

  it("should throw an error if sequence number is invalid", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: { sequence: "invalid" },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);

    await expect(
      simulateMsgs({ chainId, chainList, encodedMessages, bech32Address })
    ).rejects.toThrow("Invalid sequence number: NaN");
  });

  it("should throw SimulateNotAvailableError if chain does not support tx simulation", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: { sequence: "1" },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockRejectedValue(
      new ApiClientError({
        response: { status: 400 },
        data: { message: "invalid empty tx" },
      } as any)
    );

    await expect(
      simulateMsgs({ chainId, chainList, encodedMessages, bech32Address })
    ).rejects.toThrow(SimulateNotAvailableError);
  });

  it("should throw an error if gas used is invalid", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: { sequence: "1" },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockResolvedValue({
      gas_info: { gas_used: "invalid" },
    } as Awaited<ReturnType<typeof sendTxSimulate>>);

    await expect(
      simulateMsgs({ chainId, chainList, encodedMessages, bech32Address })
    ).rejects.toThrow("Gas used is NaN");
  });

  it("should forward ApiClientError message if code is present", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: { sequence: "1" },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockRejectedValue(
      new ApiClientError({
        response: { status: 400 },
        data: { code: 123, message: "Simulate tx error" },
      } as any)
    );

    await expect(
      simulateMsgs({ chainId, chainList, encodedMessages, bech32Address })
    ).rejects.toThrow("Simulate tx error");
  });

  it("should re-throw any other sendTxSimulate error object", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: { sequence: "1" },
    });
    (sendTxSimulate as jest.Mock).mockRejectedValue(new Error("Other error"));

    await expect(
      simulateMsgs({ chainId, chainList, encodedMessages, bech32Address })
    ).rejects.toThrow("Other error");
  });
});

describe("getGasFeeAmount", () => {
  it("should return the correct gas amount when user has sufficient balance for fee token", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4";
    const address = "cosmos1q8t4clfg5nxzfpnf04jxsl7ff40489v796axmq";

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uatom",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);

    const expectedGasAmount =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      MockChains.find(({ chain_id }) => chain_id === chainId)!.fees
        .fee_tokens[0].average_gas_price! * gasLimit;

    const gasAmount = await getGasFeeAmount({
      gasLimit: gasLimit.toString(),
      chainId,
      chainList: MockChains,
      bech32Address: address,
    });

    expect(gasAmount.amount).toBe(expectedGasAmount.toString());
    expect(gasAmount.denom).toBe("uatom");
  });

  it("should return the first correct gas amount with an alternative fee token — uatom", async () => {
    const gasLimit = 1000;
    const chainId = "osmosis-1";
    const address = "osmo1q8t4clfg5nxzfpnf04jxsl7ff40489v7dpwkdj";
    const baseFee = 0.055;
    const spotPrice = 8;

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uosmo",
          amount: "1",
        },
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "100000000000",
        },
        {
          denom: "uion",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryGasPrice>>);
    // fee tokens from registry are ignored, and queried instead
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
        {
          // atom
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          poolID: 1,
        },
        {
          denom: "uion",
          poolID: 2,
        },
      ],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      pool_id: "1",
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const gasMultiplier = 1.2;

    const gasAmount = await getGasFeeAmount({
      chainId,
      chainList: MockChains,
      gasLimit: gasLimit.toString(),
      bech32Address: address,
      gasMultiplier,
    });

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(gasAmount.denom).toBe(
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
    );
    expect(gasAmount.amount).toBe(expectedGasAmount);
  });

  it("should return the available correct gas amount with an alternative fee token — uion", async () => {
    const gasLimit = 1000;
    const chainId = "osmosis-1";
    const address = "osmo1...";
    const baseFee = 0.04655;
    const spotPrice = 8;

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uosmo",
          amount: "1",
        },
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "1",
        },
        {
          denom: "uion",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          poolID: 1,
        },
        {
          denom: "uion",
          poolID: 2,
        },
      ],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      pool_id: "1",
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const gasMultiplier = 1.5;

    const gasAmount = await getGasFeeAmount({
      chainId,
      chainList: MockChains,
      gasLimit: gasLimit.toString(),
      bech32Address: address,
      gasMultiplier,
    });

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(gasAmount.denom).toBe("uion");
    expect(gasAmount.amount).toBe(expectedGasAmount);
  });

  it("should return the first correct gas amount with an alternative fee token if the base fee is excluded even if there's enough balance", async () => {
    const gasLimit = 1000;
    const chainId = "osmosis-1";
    const address = "osmo1...";
    const baseFee = 0.055;
    const spotPrice = 8;

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uosmo",
          amount: "10000000000000",
        },
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "100000000000",
        },
        {
          denom: "uion",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          poolID: 1,
        },
        {
          denom: "uion",
          poolID: 2,
        },
      ],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      pool_id: "1",
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const gasMultiplier = 1.5;

    const gasAmount = await getGasFeeAmount({
      chainId,
      chainList: MockChains,
      gasLimit: gasLimit.toString(),
      bech32Address: address,
      excludedFeeDenoms: ["uosmo"],
      gasMultiplier,
    });

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(gasAmount.denom).toBe(
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
    );
    expect(gasAmount.amount).toBe(expectedGasAmount);
  });

  it("should return the first correct gas amount with another alternative fee token if the first viable alternative is excluded", async () => {
    const gasLimit = 1000;
    const chainId = "osmosis-1";
    const address = "osmo1...";
    const baseFee = 0.055;
    const spotPrice = 8;

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uosmo",
          amount: "100000000",
        },
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "100000000000",
        },
        {
          denom: "uion",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          poolID: 1,
        },
        {
          denom: "uion",
          poolID: 2,
        },
      ],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      pool_id: "1",
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const gasMultiplier = 1.5;

    const gasAmount = await getGasFeeAmount({
      chainId,
      chainList: MockChains,
      gasLimit: gasLimit.toString(),
      bech32Address: address,
      excludedFeeDenoms: [
        "uosmo",
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      ],
      gasMultiplier,
    });

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(gasAmount.denom).toBe("uion");
    expect(gasAmount.amount).toBe(expectedGasAmount);
  });

  it("should throw InsufficientFeeError when balance is insufficient without Osmosis fee module — no balances", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4";
    const address = "cosmos1...";

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [],
    } as Awaited<ReturnType<typeof queryBalances>>);

    await expect(
      getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
      })
    ).rejects.toThrow(InsufficientFeeError);
  });

  it("should throw InsufficientFeeError when balance is insufficient without Osmosis fee module — not enough amount", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4";
    const address = "cosmos1...";

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uatom",
          amount: "1",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);

    await expect(
      getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
      })
    ).rejects.toThrow(InsufficientFeeError);
  });

  it("should throw InsufficientFeeError when no alternative fee tokens are available in user's balance — chain has fee tokens", async () => {
    const gasLimit = 1000;
    const chainId = "osmosis-1";
    const address = "osmo1...";
    const baseFee = 0.055;

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uosmo",
          amount: "1",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          poolID: 1,
        },
      ],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);

    await expect(
      getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
      })
    ).rejects.toThrow(
      new InsufficientFeeError(
        "No fee tokens found with sufficient balance on account. Please add funds to continue: osmo1..."
      )
    );
  });

  it("should throw InsufficientFeeError when no base chain or alternative fee tokens are available in user's balance", async () => {
    const gasLimit = 1000;
    const chainId = "osmosis-1";
    const address = "osmo1...";
    const baseFee = 0.055;

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
        {
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          poolID: 1,
        },
      ],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);

    await expect(
      getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
      })
    ).rejects.toThrow(
      new InsufficientFeeError(
        "No fee tokens found with sufficient balance on account. Please add funds to continue: osmo1..."
      )
    );
  });

  it("should throw InsufficientFeeError when no alternative fee tokens are available in user's balance — no chain fee tokens", async () => {
    const gasLimit = 1000;
    const chainId = "osmosis-1";
    const address = "osmo1...";
    const baseFee = 0.055;

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uosmo",
          amount: "1",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    await expect(
      getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
      })
    ).rejects.toThrow(
      new InsufficientFeeError(
        "No fee tokens found with sufficient balance on account. Please add funds to continue: osmo1..."
      )
    );
  });
});

describe("getGasPrice", () => {
  const chainId = "osmosis-1";
  const chainList = [
    {
      chain_id: chainId,
      features: ["osmosis-txfees"],
      fees: {
        fee_tokens: [
          {
            denom: "uosmo",
            average_gas_price: 0.025,
          },
        ],
      },
    },
  ] as any;

  it("should return the correct gas price with fee market module", async () => {
    const baseFee = 0.01;

    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryGasPrice>>);

    const gasMultiplier = 1.5;
    const result = await getGasPrice({
      chainId,
      chainList,
      gasMultiplier,
    });

    expect(result.gasPrice.toString()).toBe(
      new Dec(baseFee * gasMultiplier).toString()
    );
    expect(result.feeDenom).toBe("uosmo");
  });

  it("should return the correct gas price without fee market module", async () => {
    const chainListWithoutFeeMarket = [
      {
        chain_id: chainId,
        features: [],
        fees: {
          fee_tokens: [
            {
              denom: "uosmo",
              average_gas_price: 0.025,
            },
          ],
        },
      },
    ] as any;

    const result = await getGasPrice({
      chainId,
      chainList: chainListWithoutFeeMarket,
    });

    expect(result.gasPrice.toString()).toBe(new Dec(0.025).toString());
    expect(result.feeDenom).toBe("uosmo");
  });

  it("should throw an error if chain is not found", async () => {
    await expect(
      getGasPrice({
        chainId: "non-existent-chain",
        chainList,
      })
    ).rejects.toThrow("Chain not found: non-existent-chain");
  });

  it("should throw an error if base fee is invalid", async () => {
    (queryGasPrice as jest.Mock).mockResolvedValue({
      base_fee: "invalid",
    } as Awaited<ReturnType<typeof queryGasPrice>>);

    await expect(
      getGasPrice({
        chainId,
        chainList,
      })
    ).rejects.toThrow("Invalid base fee: NaN");
  });

  it("should use DefaultGasPriceStep.average if average_gas_price is not defined", async () => {
    const chainListWithoutAverageGasPrice = [
      {
        chain_id: chainId,
        features: [],
        fees: {
          fee_tokens: [
            {
              denom: "uosmo",
              // no average_gas_price
            },
          ],
        },
      },
    ] as any;

    const result = await getGasPrice({
      chainId,
      chainList: chainListWithoutAverageGasPrice,
    });

    expect(result.gasPrice.toString()).toBe(
      new Dec(DefaultGasPriceStep.average).toString()
    );
    expect(result.feeDenom).toBe("uosmo");
  });
});

describe("getGasPriceByFeeDenom", () => {
  // params
  const chainId = "osmosis-1";
  const chainList = MockChains;
  const feeDenom = "uosmo";
  const baseFee = "0.025";

  it("should return the correct gas price", async () => {
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      spot_price: "0.5",
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const result = await getGasPriceByFeeDenom({
      chainId,
      chainList,
      feeDenom,
      baseFee,
    });

    expect(result.gasPrice.toString()).toBe(
      new Dec(baseFee).quo(new Dec("0.5")).mul(new Dec(1.01)).toString()
    );
  });

  it("should throw an error if spot price is zero", async () => {
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      spot_price: "0",
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    await expect(
      getGasPriceByFeeDenom({
        chainId,
        chainList,
        feeDenom,
        baseFee,
      })
    ).rejects.toThrow(`Failed to fetch spot price for fee token ${feeDenom}.`);
  });

  it("should throw an error if spot price is negative", async () => {
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      spot_price: "-1",
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    await expect(
      getGasPriceByFeeDenom({
        chainId,
        chainList,
        feeDenom,
        baseFee,
      })
    ).rejects.toThrow(`Failed to fetch spot price for fee token ${feeDenom}.`);
  });

  it("should use DefaultGasPriceStep.average if baseFee is undefined", async () => {
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      spot_price: "0.5",
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const result = await getGasPriceByFeeDenom({
      chainId,
      chainList,
      feeDenom,
      baseFee: undefined,
    });

    expect(result.gasPrice.toString()).toBe(
      new Dec(DefaultGasPriceStep.average)
        .quo(new Dec("0.5"))
        .mul(new Dec(1.01))
        .toString()
    );
  });
});
