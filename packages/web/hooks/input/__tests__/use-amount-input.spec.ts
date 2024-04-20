/* eslint-disable import/no-extraneous-dependencies */
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY, queryBalances } from "@osmosis-labs/server";
import { Currency } from "@osmosis-labs/types";
import { act, waitFor } from "@testing-library/react";
import { rest } from "msw";

import { server, trpcMsw } from "~/__tests__/msw";
import {
  cleanupTestWallets,
  connectTestWallet,
  renderHookWithProviders,
} from "~/__tests__/test-utils";
import { ChainList } from "~/config/generated/chain-list";

import { isValidNumericalRawInput, useAmountInput } from "../use-amount-input";

describe("useAmountInput", () => {
  const osmoMockCurrency: Currency = {
    coinDenom: "OSMO",
    coinMinimalDenom: "uosmo",
    coinDecimals: 6,
  };

  beforeEach(() => {
    cleanupTestWallets();
    server.use(
      trpcMsw.edge.assets.getAssetPrice.query((_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1)))
        );
      }),
      rest.get(
        "https://lcd-osmosis.keplr.app/cosmos/bank/v1beta1/balances/osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks",
        (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              balances: [
                {
                  denom: osmoMockCurrency.coinMinimalDenom,
                  amount: "1000000000",
                },
              ],
            } as Awaited<ReturnType<typeof queryBalances>>)
          );
        }
      )
    );
  });

  it("initializes with default values", async () => {
    const { result } = renderHookWithProviders(() =>
      useAmountInput({ currency: osmoMockCurrency })
    );

    await waitFor(() => {
      expect(result.current.inputAmount).toBe("");
    });

    expect(result.current.debouncedInAmount).toBeNull();
    expect(result.current.amount).toBeUndefined();
    expect(result.current.balance).toBeUndefined();
    expect(result.current.fiatValue).toBeUndefined();
    expect(result.current.price).toBeUndefined();
    expect(result.current.error).toEqual(new Error("Empty amount"));
    expect(result.current.isTyping).toBe(false);
    expect(result.current.isEmpty).toBe(true);
  });

  it("sets amount correctly", async () => {
    const { result } = renderHookWithProviders(() =>
      useAmountInput({ currency: osmoMockCurrency })
    );

    act(() => {
      result.current.setAmount("10");
    });

    await waitFor(() => {
      expect(result.current.inputAmount).toBe("10");
    });

    expect(result.current.amount).toBeInstanceOf(CoinPretty);
    expect(result.current.amount?.toDec().toString()).toEqual(
      "10.000000000000000000"
    );
  });

  it("handles invalid input", async () => {
    const { result } = renderHookWithProviders(() =>
      useAmountInput({ currency: osmoMockCurrency })
    );

    act(() => {
      result.current.setAmount("invalid");
    });

    await waitFor(() => {
      expect(result.current.inputAmount).toBe("");
    });
    expect(result.current.error).toEqual(new Error("Empty amount"));
  });

  it("calculates max amount considering gas", async () => {
    const mockGasAmount = new CoinPretty(
      osmoMockCurrency,
      new Dec(1).mul(DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals))
    ); // 1 OSMO for gas

    const { result, rootStore } = renderHookWithProviders(() =>
      useAmountInput({ currency: osmoMockCurrency, gasAmount: mockGasAmount })
    );

    await connectTestWallet({
      accountStore: rootStore.accountStore,
      chainId: ChainList[0].chain_id,
    });

    act(() => {
      result.current.toggleMax();
    });

    await waitFor(() => {
      expect(result.current.isMaxSelected).toBe(true);
      expect(result.current.inputAmount).toBe("999");
    });
  });

  it("calculates max amount but does not consider gas if 'gasAmount' currency does not match currency", async () => {
    const mockGasAmount = new CoinPretty(
      { ...osmoMockCurrency, coinDenom: "ATOM" },
      new Dec(1).mul(DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals))
    ); // 1 ATOM for gas

    const { result, rootStore } = renderHookWithProviders(() =>
      useAmountInput({ currency: osmoMockCurrency, gasAmount: mockGasAmount })
    );

    await connectTestWallet({
      accountStore: rootStore.accountStore,
      chainId: ChainList[0].chain_id,
    });

    act(() => {
      result.current.toggleMax();
    });

    await waitFor(() => {
      expect(result.current.isMaxSelected).toBe(true);
      expect(result.current.inputAmount).toBe("1000");
    });
  });
});

describe("isValidNumericalRawInput", () => {
  it("should return true for valid positive numbers", () => {
    expect(isValidNumericalRawInput("123")).toBe(true);
    expect(isValidNumericalRawInput("0.456")).toBe(true);
    expect(isValidNumericalRawInput("7890")).toBe(true);
  });

  it("should return true for zero", () => {
    expect(isValidNumericalRawInput("0")).toBe(true);
  });

  it("should return false for negative numbers", () => {
    expect(isValidNumericalRawInput("-1")).toBe(false);
    expect(isValidNumericalRawInput("-0.1")).toBe(false);
  });

  it("should return false for non-numeric strings", () => {
    expect(isValidNumericalRawInput("abc")).toBe(false);
    expect(isValidNumericalRawInput("12abc34")).toBe(false);
  });

  it("should return true for empty string", () => {
    expect(isValidNumericalRawInput("")).toBe(true);
  });

  it("should return false for numbers exceeding MAX_SAFE_INTEGER", () => {
    expect(isValidNumericalRawInput("9007199254740992")).toBe(false); // MAX_SAFE_INTEGER + 1
  });

  it("should return true for MAX_SAFE_INTEGER", () => {
    expect(isValidNumericalRawInput("9007199254740991")).toBe(true); // MAX_SAFE_INTEGER
  });
});
