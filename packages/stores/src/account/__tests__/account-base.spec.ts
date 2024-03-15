import { Dec } from "@keplr-wallet/unit";
import { DefaultGasPriceStep } from "@osmosis-labs/keplr-hooks";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockChainList, TestOsmosisChainId } from "../../tests/mock-data";
import { server } from "../../tests/msw-server";
import { RootStore } from "../../tests/test-env";
import { GasMultiplier } from "../base";
import { InsufficientFeeError } from "../utils";

let rootStore: RootStore;
let accountStore: RootStore["accountStore"];

beforeEach(() => {
  rootStore = new RootStore();
  accountStore = rootStore.accountStore;
});

describe("getFeeAmount — no address", () => {
  it("should return the correct gas amount when chain has fee token values", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4";

    const gasAmount = await accountStore.getFeeAmount({
      gasLimit: gasLimit.toString(),
      chainId,
      address: undefined,
    });

    const expectedGasAmount =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      MockChainList.find(({ chain_id }) => chain_id === chainId)!.fees
        .fee_tokens[0].average_gas_price! * gasLimit;

    expect(gasAmount.amount).toBe(expectedGasAmount.toString());
    expect(gasAmount.denom).toBe("uatom");
  });

  it("should return the correct gas amount according to current osmosis fee gas price", async () => {
    const gasLimit = 1000;
    const baseFee = 0.055;
    const chainId = TestOsmosisChainId;
    const multiplier = GasMultiplier;

    server.use(
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_fee: baseFee.toString(),
            } as {
              base_fee: string;
            })
          );
        }
      )
    );

    const gasAmount = await accountStore.getFeeAmount({
      gasLimit: gasLimit.toString(),
      chainId,
      address: undefined,
    });

    expect(gasAmount.amount).toBe(
      Math.ceil(baseFee * multiplier * gasLimit).toString()
    );
    expect(gasAmount.denom).toBe("uosmo");
  });

  it("should use the default osmosis gas price if query fails", async () => {
    const gasLimit = 1000;
    const chainId = TestOsmosisChainId;

    server.use(
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(ctx.status(500));
        }
      )
    );

    const gasAmount = await accountStore.getFeeAmount({
      gasLimit: gasLimit.toString(),
      chainId,
      address: undefined,
    });

    const expectedGasAmount =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      MockChainList[0].fees.fee_tokens[0].average_gas_price! * gasLimit;
    expect(gasAmount.amount).toBe(expectedGasAmount.toString());
    expect(gasAmount.denom).toBe("uosmo");
  });

  it("should use default gas price step when chain does not have gas values", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4-no-gas-price";

    const gasAmount = await accountStore.getFeeAmount({
      gasLimit: gasLimit.toString(),
      chainId,
      address: undefined,
    });

    expect(gasAmount.amount).toBe(
      (DefaultGasPriceStep.average * gasLimit).toString()
    );
    expect(gasAmount.denom).toBe("uatom");
  });

  it("should throw an error if the chain is not found", async () => {
    const gasLimit = "1000";
    const chainId = "unknown-chain";

    await expect(
      accountStore.getFeeAmount({ gasLimit, chainId, address: undefined })
    ).rejects.toThrow(`Chain (${chainId}) not found`);
  });
});

describe("getFeeAmount — with address", () => {
  it("should return the correct gas amount when user has sufficient balance for fee token", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4";
    const address = "cosmos1...";

    server.use(
      rest.get(
        `https://lcd-cosmoshub.keplr.app/cosmos/bank/v1beta1/balances/${address}`,
        (_req, res, ctx) => {
          return res(
            ctx.json({
              balances: [
                {
                  denom: "uatom",
                  amount: "1000000",
                },
              ],
            } as {
              balances: {
                denom: string;
                amount: string;
              }[];
            })
          );
        }
      )
    );

    // Mock the balance query to return a sufficient balance for the fee token
    // and any other necessary mocks for this test case
    const gasAmount = await accountStore.getFeeAmount({
      gasLimit: gasLimit.toString(),
      chainId,
      address,
    });

    const expectedGasAmount =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      MockChainList.find(({ chain_id }) => chain_id === chainId)!.fees
        .fee_tokens[0].average_gas_price! * gasLimit;

    expect(gasAmount.amount).toBe(expectedGasAmount.toString());
    expect(gasAmount.denom).toBe("uatom");
  });

  it("should return the first correct gas amount with an alternative fee token — uatom", async () => {
    const gasLimit = 1000;
    const chainId = TestOsmosisChainId;
    const address = "osmo1...";
    const baseFee = 0.055;
    const spotPrice = 8;

    server.use(
      rest.get(
        `https://lcd-osmosis.keplr.app/cosmos/bank/v1beta1/balances/${address}`,
        (_req, res, ctx) => {
          return res(
            ctx.json({
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
            } as {
              balances: {
                denom: string;
                amount: string;
              }[];
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_fee: baseFee.toString(),
            } as {
              base_fee: string;
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/fee_tokens",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              fee_tokens: [
                {
                  // atom
                  denom:
                    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
                  poolID: 1,
                },
                {
                  // atom
                  denom: "uion",
                  poolID: 2,
                },
              ],
            } as { fee_tokens: { denom: string; poolID: number }[] })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/base_denom",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_denom: "uosmo",
            } as { base_denom: string })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/spot_price_by_denom",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              pool_id: "1",
              spot_price: spotPrice.toString(),
            } as {
              pool_id: string;
              spot_price: string;
            })
          );
        }
      )
    );

    const gasAmount = await accountStore.getFeeAmount({
      gasLimit: gasLimit.toString(),
      chainId,
      address,
    });

    const expectedGasAmount = new Dec(baseFee * GasMultiplier)
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
    const chainId = TestOsmosisChainId;
    const address = "osmo1...";
    const baseFee = 0.04655;
    const spotPrice = 8;

    server.use(
      rest.get(
        `https://lcd-osmosis.keplr.app/cosmos/bank/v1beta1/balances/${address}`,
        (_req, res, ctx) => {
          return res(
            ctx.json({
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
            } as {
              balances: {
                denom: string;
                amount: string;
              }[];
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_fee: baseFee.toString(),
            } as {
              base_fee: string;
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/fee_tokens",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              fee_tokens: [
                {
                  // atom
                  denom:
                    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
                  poolID: 1,
                },
                {
                  // atom
                  denom: "uion",
                  poolID: 2,
                },
              ],
            } as { fee_tokens: { denom: string; poolID: number }[] })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/base_denom",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_denom: "uosmo",
            } as { base_denom: string })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/spot_price_by_denom",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              pool_id: "1",
              spot_price: spotPrice.toString(),
            } as {
              pool_id: string;
              spot_price: string;
            })
          );
        }
      )
    );

    const gasAmount = await accountStore.getFeeAmount({
      gasLimit: gasLimit.toString(),
      chainId,
      address,
    });

    const expectedGasAmount = new Dec(baseFee * GasMultiplier)
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

    server.use(
      rest.get(
        `https://lcd-cosmoshub.keplr.app/cosmos/bank/v1beta1/balances/${address}`,
        (_req, res, ctx) => {
          return res(
            ctx.json({
              balances: [],
            } as {
              balances: {
                denom: string;
                amount: string;
              }[];
            })
          );
        }
      )
    );

    await expect(
      accountStore.getFeeAmount({
        gasLimit: gasLimit.toString(),
        chainId,
        address,
      })
    ).rejects.toThrow(InsufficientFeeError);
  });

  it("should throw InsufficientFeeError when balance is insufficient without Osmosis fee module — not enough amount", async () => {
    const gasLimit = 1000;
    const chainId = "cosmoshub-4";
    const address = "cosmos1...";

    server.use(
      rest.get(
        `https://lcd-cosmoshub.keplr.app/cosmos/bank/v1beta1/balances/${address}`,
        (_req, res, ctx) => {
          return res(
            ctx.json({
              balances: [
                {
                  denom: "uatom",
                  amount: "1",
                },
              ],
            } as {
              balances: {
                denom: string;
                amount: string;
              }[];
            })
          );
        }
      )
    );

    await expect(
      accountStore.getFeeAmount({
        gasLimit: gasLimit.toString(),
        chainId,
        address,
      })
    ).rejects.toThrow(InsufficientFeeError);
  });

  it("should throw InsufficientFeeError when no alternative fee tokens are available in user's balance — chain has fee tokens", async () => {
    const gasLimit = 1000;
    const chainId = TestOsmosisChainId;
    const address = "osmo1...";
    const baseFee = 0.055;

    server.use(
      rest.get(
        `https://lcd-osmosis.keplr.app/cosmos/bank/v1beta1/balances/${address}`,
        (_req, res, ctx) => {
          return res(
            ctx.json({
              balances: [
                {
                  denom: "uosmo",
                  amount: "1",
                },
              ],
            } as {
              balances: {
                denom: string;
                amount: string;
              }[];
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_fee: baseFee.toString(),
            } as {
              base_fee: string;
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/fee_tokens",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              fee_tokens: [
                {
                  // atom
                  denom:
                    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
                  poolID: 1,
                },
              ],
            } as { fee_tokens: { denom: string; poolID: number }[] })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/base_denom",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_denom: "uosmo",
            } as { base_denom: string })
          );
        }
      )
    );

    await expect(
      accountStore.getFeeAmount({
        gasLimit: gasLimit.toString(),
        chainId,
        address,
      })
    ).rejects.toThrow(
      new InsufficientFeeError(
        "Insufficient balance for transaction fees. Please add funds to continue."
      )
    );
  });

  it("should throw InsufficientFeeError when no base chain or alternative fee tokens are available in user's balance", async () => {
    const gasLimit = 1000;
    const chainId = TestOsmosisChainId;
    const address = "osmo1...";
    const baseFee = 0.055;

    server.use(
      rest.get(
        `https://lcd-osmosis.keplr.app/cosmos/bank/v1beta1/balances/${address}`,
        (_req, res, ctx) => {
          return res(
            ctx.json({
              balances: [],
            } as {
              balances: {
                denom: string;
                amount: string;
              }[];
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_fee: baseFee.toString(),
            } as {
              base_fee: string;
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/fee_tokens",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              fee_tokens: [
                {
                  // atom
                  denom:
                    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
                  poolID: 1,
                },
              ],
            } as { fee_tokens: { denom: string; poolID: number }[] })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/base_denom",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_denom: "uosmo",
            } as { base_denom: string })
          );
        }
      )
    );

    await expect(
      accountStore.getFeeAmount({
        gasLimit: gasLimit.toString(),
        chainId,
        address,
      })
    ).rejects.toThrow(
      new InsufficientFeeError(
        "Insufficient balance for transaction fees. Please add funds to continue."
      )
    );
  });

  it("should throw InsufficientFeeError when no alternative fee tokens are available in user's balance — no chain fee tokens", async () => {
    const gasLimit = 1000;
    const chainId = TestOsmosisChainId;
    const address = "osmo1...";
    const baseFee = 0.055;

    server.use(
      rest.get(
        `https://lcd-osmosis.keplr.app/cosmos/bank/v1beta1/balances/${address}`,
        (_req, res, ctx) => {
          return res(
            ctx.json({
              balances: [
                {
                  denom: "uosmo",
                  amount: "1",
                },
              ],
            } as {
              balances: {
                denom: string;
                amount: string;
              }[];
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/cur_eip_base_fee",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_fee: baseFee.toString(),
            } as {
              base_fee: string;
            })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/fee_tokens",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              fee_tokens: [],
            } as { fee_tokens: { denom: string; poolID: number }[] })
          );
        }
      ),
      rest.get(
        "https://lcd-osmosis.keplr.app/osmosis/txfees/v1beta1/base_denom",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              base_denom: "uosmo",
            } as { base_denom: string })
          );
        }
      )
    );

    await expect(
      accountStore.getFeeAmount({
        gasLimit: gasLimit.toString(),
        chainId,
        address,
      })
    ).rejects.toThrow(
      new InsufficientFeeError(
        "Insufficient balance for transaction fees. Please add funds to continue."
      )
    );
  });
});
