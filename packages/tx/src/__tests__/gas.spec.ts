import { Dec } from "@keplr-wallet/unit";
import {
  BaseAccountTypeStr,
  queryBalances,
  queryBaseAccount,
  queryFeesBaseDenom,
  queryFeesBaseGasPrice,
  queryFeeTokens,
  queryFeeTokenSpotPrice,
  sendTxSimulate,
} from "@osmosis-labs/server";
import { ApiClientError } from "@osmosis-labs/utils";
import { Any } from "cosmjs-types/google/protobuf/any";

import {
  getDefaultGasPrice,
  getGasFeeAmount,
  getGasPriceByFeeDenom,
  InsufficientFeeError,
  simulateCosmosTxBody,
  SimulateNotAvailableError,
} from "../gas";
import { MockChains } from "./mock-chains";

jest.mock("@osmosis-labs/server");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("simulateCosmosTxBody", () => {
  const chainId = "osmosis-1";
  const chainList = [
    { chain_id: chainId, features: ["osmosis-txfees"] },
  ] as any;
  // we'll mock the response to simulate fees, so we assume it works if
  // messages are given
  const encodedMessages: Any[] = [];
  const bech32Address = "osmo1address";

  it("should return gasUsed on successful simulation", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: {
        "@type": BaseAccountTypeStr,
        sequence: "1",
      },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockResolvedValue({
      gas_info: { gas_used: "200000" },
    } as Awaited<ReturnType<typeof sendTxSimulate>>);

    const result = await simulateCosmosTxBody({
      chainId,
      chainList,
      body: { messages: encodedMessages },
      bech32Address,
    });

    expect(queryBaseAccount).toBeCalledWith({
      chainId,
      chainList,
      bech32Address,
    });
    expect(sendTxSimulate).toBeCalledWith({
      chainId,
      chainList,
      txBytes: expect.any(String),
    });
    expect(result).toEqual({ gasUsed: 200000, coinsSpent: [] });
  });

  it("should return gasUsed on successful vesting simulation", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: {
        "@type": "non-base-type-assummed-vesting",
        base_vesting_account: {
          base_account: {
            sequence: "1",
          },
        },
      },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockResolvedValue({
      gas_info: { gas_used: "200000" },
    } as Awaited<ReturnType<typeof sendTxSimulate>>);

    const result = await simulateCosmosTxBody({
      chainId,
      chainList,
      body: { messages: encodedMessages },
      bech32Address,
    });

    expect(queryBaseAccount).toBeCalledWith({
      chainId,
      chainList,
      bech32Address,
    });
    expect(sendTxSimulate).toBeCalledWith({
      chainId,
      chainList,
      txBytes: expect.any(String),
    });
    expect(result).toEqual({ gasUsed: 200000, coinsSpent: [] });
  });

  it("should throw an error if chain is not found", async () => {
    await expect(
      simulateCosmosTxBody({
        chainId: "unknown-chain",
        chainList,
        body: { messages: encodedMessages },
        bech32Address,
      })
    ).rejects.toThrow("Chain not found: unknown-chain");
  });

  it("should throw an error if sequence number is invalid", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: {
        "@type": BaseAccountTypeStr,
        sequence: "invalid",
      },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);

    await expect(
      simulateCosmosTxBody({
        chainId,
        chainList,
        body: { messages: encodedMessages },
        bech32Address,
      })
    ).rejects.toThrow("Invalid sequence number: NaN");
  });

  it("should throw SimulateNotAvailableError if chain does not support tx simulation", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: {
        "@type": BaseAccountTypeStr,
        sequence: "1",
      },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockRejectedValue(
      new ApiClientError({
        response: { status: 400 },
        data: { message: "invalid empty tx" },
      } as any)
    );

    await expect(
      simulateCosmosTxBody({
        chainId,
        chainList,
        body: { messages: encodedMessages },
        bech32Address,
      })
    ).rejects.toThrow(SimulateNotAvailableError);
  });

  it("should throw an error if gas used is invalid", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: {
        "@type": BaseAccountTypeStr,
        sequence: "1",
      },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockResolvedValue({
      gas_info: { gas_used: "invalid" },
    } as Awaited<ReturnType<typeof sendTxSimulate>>);

    await expect(
      simulateCosmosTxBody({
        chainId,
        chainList,
        body: { messages: encodedMessages },
        bech32Address,
      })
    ).rejects.toThrow("Gas used is missing or NaN");
  });

  it("should forward ApiClientError message if code is present", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: {
        "@type": BaseAccountTypeStr,
        sequence: "1",
      },
    } as Awaited<ReturnType<typeof queryBaseAccount>>);
    (sendTxSimulate as jest.Mock).mockRejectedValue(
      new ApiClientError({
        response: { status: 400 },
        data: { code: 123, message: "Simulate tx error" },
      } as any)
    );

    await expect(
      simulateCosmosTxBody({
        chainId,
        chainList,
        body: { messages: encodedMessages },
        bech32Address,
      })
    ).rejects.toThrow("Simulate tx error");
  });

  it("should re-throw any other sendTxSimulate error object", async () => {
    (queryBaseAccount as jest.Mock).mockResolvedValue({
      account: {
        "@type": BaseAccountTypeStr,
        sequence: "1",
      },
    });
    (sendTxSimulate as jest.Mock).mockRejectedValue(new Error("Other error"));

    await expect(
      simulateCosmosTxBody({
        chainId,
        chainList,
        body: { messages: encodedMessages },
        bech32Address,
      })
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

    const gasAmount = (
      await getGasFeeAmount({
        gasLimit: gasLimit.toString(),
        chainId,
        chainList: MockChains,
        bech32Address: address,
      })
    )[0];

    expect(queryBalances).toHaveBeenCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
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
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
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
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      pool_id: "1",
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const gasMultiplier = 1.2;

    const gasAmount = (
      await getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
        gasMultiplier,
      })
    )[0];

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });
    expect(queryFeesBaseDenom).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeesBaseGasPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokens).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokenSpotPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
      denom:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    });

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
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
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

    const gasAmount = (
      await getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
        gasMultiplier,
      })
    )[0];

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });
    expect(queryFeesBaseGasPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokens).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeesBaseDenom).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokenSpotPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
      denom:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    });

    expect(gasAmount.denom).toBe("uion");
    expect(gasAmount.amount).toBe(expectedGasAmount);
  });

  it("should return the correct gas amount with an alternative fee token when one is spent in coinsSpent", async () => {
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
          denom: "uion",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
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
      pool_id: "2",
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const gasMultiplier = 1.5;
    const coinsSpent = [{ denom: "uosmo", amount: "1" }];

    const gasAmount = (
      await getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
        gasMultiplier,
        coinsSpent,
      })
    )[0];

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });
    expect(queryFeesBaseGasPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokens).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeesBaseDenom).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokenSpotPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
      denom: "uion",
    });

    expect(gasAmount.denom).toBe("uion");
    expect(gasAmount.amount).toBe(expectedGasAmount);
  });

  it("should return the correct gas amount with an alternative fee token when the last available fee token is fully spent", async () => {
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
          denom: "uion",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
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
      pool_id: "2",
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const gasMultiplier = 1.5;
    const coinsSpent = [{ denom: "uion", amount: "1000000" }];

    const gasAmount = (
      await getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
        gasMultiplier,
        coinsSpent,
      })
    )[0];

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });
    expect(queryFeesBaseGasPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokens).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeesBaseDenom).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokenSpotPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
      denom: "uion",
    });

    expect(gasAmount.denom).toBe("uion");
    expect(gasAmount.amount).toBe(expectedGasAmount);
    expect(gasAmount.isSubtractiveFee).toBe(true);
  });

  it("should return the correct gas amount with an alternative fee token when the last available fee token is not fully spent", async () => {
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
          denom: "uion",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
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
      pool_id: "2",
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const gasMultiplier = 1.5;
    const coinsSpent = [{ denom: "uion", amount: "1000" }];

    const gasAmount = (
      await getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
        gasMultiplier,
        coinsSpent,
      })
    )[0];

    const expectedGasAmount = new Dec(baseFee * gasMultiplier)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });
    expect(queryFeesBaseGasPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokens).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeesBaseDenom).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokenSpotPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
      denom: "uion",
    });

    expect(gasAmount.denom).toBe("uion");
    expect(gasAmount.amount).toBe(expectedGasAmount);
    expect(gasAmount.isSubtractiveFee).toBe(false);
  });

  // Scenario: base fee token goes down in price and a very expensive (i.e. WBTC) alternative fee token is checked but resulting fee amount is <= 0
  it("should skip an alternative fee token that has a spot price that results in too little precision for 1 unit of fee amount", async () => {
    const gasLimit = 1000;
    const chainId = "osmosis-1";
    const address = "osmo1...";
    const baseFee = "0.002500000000000000";
    /** Spot price low enough to yield a positive gas fee amount */
    const lowEnoughSpotPrice = "1";
    const veryHighSpotPrice = "1095.350087822065970161";

    (queryBalances as jest.Mock).mockResolvedValue({
      balances: [
        {
          denom: "uosmo",
          amount: "1",
        },
        {
          // ATOM
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "1000",
        },
        {
          denom: "uion",
          amount: "1000000",
        },
      ],
    } as Awaited<ReturnType<typeof queryBalances>>);
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee,
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
        {
          denom: "uion",
          poolID: 2,
        },
        {
          // ATOM
          denom:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          poolID: 1,
        },
      ],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    (queryFeeTokenSpotPrice as jest.Mock).mockImplementation(({ denom }) => {
      // uion should be checked but is skipped due to low precision
      if (denom === "uion") {
        return Promise.resolve({
          pool_id: "2",
          spot_price: veryHighSpotPrice,
        } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);
      }
      if (
        denom ===
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
      ) {
        return Promise.resolve({
          pool_id: "1",
          spot_price: lowEnoughSpotPrice,
        } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);
      }
      throw new Error("Mocked implementation got an unexpected fee denom");
    });

    const gasMultiplier = 1.5;

    const gasAmount = (
      await getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
        gasMultiplier,
      })
    )[0];

    const expectedGasAmount = new Dec(baseFee)
      .mul(new Dec(gasMultiplier))
      .quo(new Dec(lowEnoughSpotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });
    expect(queryFeesBaseGasPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokens).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeesBaseDenom).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeeTokenSpotPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
      denom: "uion",
    });
    expect(queryFeeTokenSpotPrice).toBeCalledWith({
      chainId,
      chainList: MockChains,
      denom:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    });

    expect(gasAmount.denom).toBe(
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
    );
    expect(gasAmount.amount).toBe(expectedGasAmount);
    expect(gasAmount.isSubtractiveFee).toBe(false);
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

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });
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

    // sanity check to make sure a non fee market chain is not calling fee market queries
    (queryFeeTokens as jest.Mock).mockResolvedValue({
      fee_tokens: [
        {
          denom: "uatom",
          poolID: 1,
        },
      ],
    } as Awaited<ReturnType<typeof queryFeeTokens>>);
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      pool_id: "1",
      spot_price: "1000",
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    await expect(
      getGasFeeAmount({
        chainId,
        chainList: MockChains,
        gasLimit: gasLimit.toString(),
        bech32Address: address,
      })
    ).rejects.toThrow(InsufficientFeeError);

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });

    // sanity check to make sure a non fee market chain is not calling fee market queries
    expect(queryFeeTokens).not.toHaveBeenCalled();
    expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
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
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
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
        "Insufficient alternative balance for transaction fees. Please add funds to continue: osmo1..."
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
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);

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

    expect(queryBalances).toBeCalledWith({
      chainId,
      bech32Address: address,
      chainList: MockChains,
    });
    expect(queryFeeTokens).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });

    // would be called but exception is thrown before
    expect(queryFeesBaseDenom).toBeCalledWith({
      chainId,
      chainList: MockChains,
    });
    expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
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
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
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
        "Insufficient alternative balance for transaction fees. Please add funds to continue: osmo1..."
      )
    );
  });
});

describe("getGasPriceByFeeDenom", () => {
  const chainId = "osmosis-1";
  const chainList = MockChains;
  const feeDenom = "uion";
  const gasMultiplier = 1.5;

  it("should return the correct gas price with fee market module", async () => {
    const baseFee = 0.01;
    const spotPrice = 8;

    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      spot_price: spotPrice.toString(),
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    const result = await getGasPriceByFeeDenom({
      chainId,
      chainList,
      feeDenom,
      gasMultiplier,
    });

    const expectedGasPrice = new Dec(baseFee)
      .quo(new Dec(spotPrice))
      .mul(new Dec(1.01))
      .mul(new Dec(gasMultiplier));

    expect(result.gasPrice.toString()).toBe(expectedGasPrice.toString());

    expect(queryFeesBaseGasPrice).toHaveBeenCalledWith({
      chainId,
      chainList,
    });
    expect(queryFeeTokenSpotPrice).toHaveBeenCalledWith({
      chainId,
      chainList,
      denom: feeDenom,
    });
  });

  it("should return the default gas price if fee market module is not available", async () => {
    const chainListWithoutFeeMarket = chainList.map((chain) => ({
      ...chain,
      features: [],
    }));

    const defaultGasPrice = new Dec(0.025);

    const result = await getGasPriceByFeeDenom({
      chainId,
      chainList: chainListWithoutFeeMarket,
      feeDenom: "uosmo",
      gasMultiplier,
    });

    expect(result.gasPrice.toString()).toBe(defaultGasPrice.toString());

    expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
    expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
  });

  it("should return an alternative token gas price in registry if fee market module is not available", async () => {
    const chainId = "juno-1";
    const chainListWithoutFeeMarket = chainList.map((chain) => ({
      ...chain,
      features: [],
    }));
    const feeDenom =
      "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9";

    const result = await getGasPriceByFeeDenom({
      chainId,
      chainList: chainListWithoutFeeMarket,
      feeDenom,
      gasMultiplier,
    });

    expect(result.gasPrice.toString()).toBe(new Dec(0.0035).toString());

    expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
    expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
  });

  it("should throw an error if fee token is not in config", async () => {
    const chainListWithoutFeeMarket = chainList.map((chain) => ({
      ...chain,
      features: [],
    }));

    await expect(
      getGasPriceByFeeDenom({
        chainId,
        chainList: chainListWithoutFeeMarket,
        feeDenom,
        gasMultiplier,
      })
    ).rejects.toThrow("Fee token not found: uion");

    expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
    expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
  });

  it("should throw an error if chain is not found", async () => {
    await expect(
      getGasPriceByFeeDenom({
        chainId: "non-existent-chain",
        chainList,
        feeDenom,
        gasMultiplier,
      })
    ).rejects.toThrow("Chain not found: non-existent-chain");

    expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
    expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
  });

  it("should throw an error if spot price is zero or negative", async () => {
    const baseFee = 0.01;

    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);
    (queryFeeTokenSpotPrice as jest.Mock).mockResolvedValue({
      spot_price: "0",
    } as Awaited<ReturnType<typeof queryFeeTokenSpotPrice>>);

    await expect(
      getGasPriceByFeeDenom({
        chainId,
        chainList,
        feeDenom,
        gasMultiplier,
      })
    ).rejects.toThrow(`Failed to fetch spot price for fee token ${feeDenom}.`);

    expect(queryFeesBaseGasPrice).toHaveBeenCalledWith({
      chainId,
      chainList,
    });
    expect(queryFeeTokenSpotPrice).toHaveBeenCalledWith({
      chainId,
      chainList,
      denom: feeDenom,
    });
  });

  it("should throw an error if base fee is invalid", async () => {
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: "invalid",
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);

    await expect(
      getGasPriceByFeeDenom({
        chainId,
        chainList,
        feeDenom,
        gasMultiplier,
      })
    ).rejects.toThrow("Invalid base fee: invalid");
  });

  expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
  expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
});

describe("getDefaultGasPrice", () => {
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

    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: baseFee.toString(),
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);

    const gasMultiplier = 1.5;
    const result = await getDefaultGasPrice({
      chainId,
      chainList,
      gasMultiplier,
    });

    expect(result.gasPrice.toString()).toBe(
      new Dec(baseFee * gasMultiplier).toString()
    );
    expect(result.feeDenom).toBe("uosmo");

    expect(queryFeesBaseDenom).toHaveBeenCalledWith({
      chainId,
      chainList,
    });
    expect(queryFeesBaseGasPrice).toHaveBeenCalledWith({
      chainId,
      chainList,
    });
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

    const result = await getDefaultGasPrice({
      chainId,
      chainList: chainListWithoutFeeMarket,
    });

    expect(result.gasPrice.toString()).toBe(new Dec(0.025).toString());
    expect(result.feeDenom).toBe("uosmo");

    expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
    expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
  });

  it("should throw an error if chain is not found", async () => {
    await expect(
      getDefaultGasPrice({
        chainId: "non-existent-chain",
        chainList,
      })
    ).rejects.toThrow("Chain not found: non-existent-chain");

    expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
    expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
  });

  it("should throw an error if base fee is invalid", async () => {
    (queryFeesBaseDenom as jest.Mock).mockResolvedValue({
      base_denom: "uosmo",
    } as Awaited<ReturnType<typeof queryFeesBaseDenom>>);
    (queryFeesBaseGasPrice as jest.Mock).mockResolvedValue({
      base_fee: "invalid",
    } as Awaited<ReturnType<typeof queryFeesBaseGasPrice>>);

    await expect(
      getDefaultGasPrice({
        chainId,
        chainList,
      })
    ).rejects.toThrow("Invalid base fee: invalid");

    expect(queryFeesBaseDenom).toHaveBeenCalledWith({
      chainId,
      chainList,
    });
    expect(queryFeesBaseGasPrice).toHaveBeenCalledWith({
      chainId,
      chainList,
    });
  });

  it("should use default gas price if average_gas_price is not defined", async () => {
    const chainListWithoutAverageGasPrice = [
      {
        chain_id: chainId,
        // no fee market
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

    const default_ = 0.025;

    const result = await getDefaultGasPrice({
      chainId,
      chainList: chainListWithoutAverageGasPrice,
      defaultGasPrice: default_,
    });

    expect(result.gasPrice.toString()).toBe(new Dec(default_).toString());
    expect(result.feeDenom).toBe("uosmo");

    expect(queryFeesBaseGasPrice).not.toHaveBeenCalled();
    expect(queryFeeTokenSpotPrice).not.toHaveBeenCalled();
  });
});
