import { CoinPretty, Dec } from "@osmosis-labs/unit";
import { render, waitFor } from "@testing-library/react";
import React from "react";

import { trimPlaceholderZeros } from "~/utils/number";

import { CryptoFiatInput } from "../crypto-fiat-input";

jest.mock("~/hooks", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useWindowSize: () => ({ isMobile: false }),
}));

const ATOM_CURRENCY = {
  coinDecimals: 6,
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
};

function makeBalance(amount: string) {
  return new CoinPretty(ATOM_CURRENCY, amount);
}

function makeGasCost(amount: string) {
  return new CoinPretty(ATOM_CURRENCY, amount);
}

const MUL_GAS_SLIPPAGE = new Dec("2");

function expectedMaxAfterGas(balanceRaw: string, gasRaw: string) {
  const balance = new CoinPretty(ATOM_CURRENCY, balanceRaw);
  const gas = new CoinPretty(ATOM_CURRENCY, gasRaw);
  const max = balance.toDec().sub(gas.toDec().mul(MUL_GAS_SLIPPAGE));
  return trimPlaceholderZeros(max.toString());
}

interface Props {
  isMax: boolean;
  cryptoInput: string;
  transferGasCost: CoinPretty | undefined;
  balanceRaw: string;
  onChangeCryptoInput: jest.Mock;
  canSetMax?: boolean;
  address?: string;
  additiveTransferFee?: CoinPretty;
  isInsufficientBal?: boolean;
  isInsufficientFee?: boolean;
}

function renderInput({
  isMax,
  cryptoInput,
  transferGasCost,
  balanceRaw,
  onChangeCryptoInput,
  canSetMax = true,
  address = "uatom",
  additiveTransferFee,
  isInsufficientBal = false,
  isInsufficientFee = false,
}: Props) {
  const balance = makeBalance(balanceRaw);
  return render(
    <CryptoFiatInput
      currentUnit="crypto"
      setCurrentUnit={jest.fn()}
      isMax={isMax}
      setIsMax={jest.fn()}
      canSetMax={canSetMax}
      transferGasCost={transferGasCost}
      additiveTransferFee={additiveTransferFee}
      transferGasChain={{ prettyName: "Cosmos Hub" }}
      assetPrice={undefined}
      assetWithBalance={{
        denom: "ATOM",
        address,
        decimals: 6,
        amount: balance,
      }}
      cryptoInput={cryptoInput}
      onChangeCryptoInput={onChangeCryptoInput}
      fiatInput=""
      onChangeFiatInput={jest.fn()}
      isInsufficientBal={isInsufficientBal}
      isInsufficientFee={isInsufficientFee}
    />
  );
}

describe("CryptoFiatInput gasAppliedToMax guard", () => {
  it("subtracts gas on first render with isMax and transferGasCost", async () => {
    const balanceRaw = "2000000";
    const gasRaw = "5000";
    const onChangeCryptoInput = jest.fn();

    renderInput({
      isMax: true,
      cryptoInput: makeBalance(balanceRaw).toDec().toString(),
      transferGasCost: makeGasCost(gasRaw),
      balanceRaw,
      onChangeCryptoInput,
    });

    const expected = expectedMaxAfterGas(balanceRaw, gasRaw);

    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected);
    });
  });

  it("does NOT re-apply gas when transferGasCost changes slightly (feedback loop prevention)", async () => {
    const balanceRaw = "2000000";
    const gasRaw1 = "5000";
    const gasRaw2 = "5050";
    const onChangeCryptoInput = jest.fn();

    const balanceDec = makeBalance(balanceRaw).toDec().toString();

    const { rerender } = renderInput({
      isMax: true,
      cryptoInput: balanceDec,
      transferGasCost: makeGasCost(gasRaw1),
      balanceRaw,
      onChangeCryptoInput,
    });

    const expected1 = expectedMaxAfterGas(balanceRaw, gasRaw1);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected1);
    });

    onChangeCryptoInput.mockClear();

    const balance = makeBalance(balanceRaw);
    rerender(
      <CryptoFiatInput
        currentUnit="crypto"
        setCurrentUnit={jest.fn()}
        isMax={true}
        setIsMax={jest.fn()}
        canSetMax={true}
        transferGasCost={makeGasCost(gasRaw2)}
        transferGasChain={{ prettyName: "Cosmos Hub" }}
        assetPrice={undefined}
        assetWithBalance={{
          denom: "ATOM",
          address: "uatom",
          decimals: 6,
          amount: balance,
        }}
        cryptoInput={expected1}
        onChangeCryptoInput={onChangeCryptoInput}
        fiatInput=""
        onChangeFiatInput={jest.fn()}
        isInsufficientBal={false}
        isInsufficientFee={false}
      />
    );

    // Give effects time to settle — gas should NOT be re-applied
    await new Promise((r) => setTimeout(r, 100));
    expect(onChangeCryptoInput).not.toHaveBeenCalled();
  });

  it("resets guard when isMax is toggled off, allowing gas to apply on next Max", async () => {
    const balanceRaw = "2000000";
    const gasRaw1 = "5000";
    const gasRaw2 = "6000";
    const onChangeCryptoInput = jest.fn();

    const balanceDec = makeBalance(balanceRaw).toDec().toString();
    const balance = makeBalance(balanceRaw);

    const baseProps = {
      currentUnit: "crypto" as const,
      setCurrentUnit: jest.fn(),
      setIsMax: jest.fn(),
      canSetMax: true,
      transferGasChain: { prettyName: "Cosmos Hub" },
      assetPrice: undefined,
      assetWithBalance: {
        denom: "ATOM",
        address: "uatom",
        decimals: 6,
        amount: balance,
      },
      fiatInput: "",
      onChangeFiatInput: jest.fn(),
      isInsufficientBal: false,
      isInsufficientFee: false,
    };

    // 1) isMax=true with first gas cost
    const { rerender } = render(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={makeGasCost(gasRaw1)}
        cryptoInput={balanceDec}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const expected1 = expectedMaxAfterGas(balanceRaw, gasRaw1);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected1);
    });

    onChangeCryptoInput.mockClear();

    // 2) Toggle isMax off
    rerender(
      <CryptoFiatInput
        {...baseProps}
        isMax={false}
        transferGasCost={makeGasCost(gasRaw1)}
        cryptoInput="0"
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    await new Promise((r) => setTimeout(r, 50));

    // 3) Toggle isMax back on with a different gas cost
    rerender(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={makeGasCost(gasRaw2)}
        cryptoInput={balanceDec}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const expected2 = expectedMaxAfterGas(balanceRaw, gasRaw2);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected2);
    });
  });

  it("subtracts an additive transfer fee in addition to gas on max", async () => {
    const balanceRaw = "2000000";
    const gasRaw = "5000";
    const feeRaw = "30000";
    const onChangeCryptoInput = jest.fn();

    renderInput({
      isMax: true,
      cryptoInput: makeBalance(balanceRaw).toDec().toString(),
      transferGasCost: makeGasCost(gasRaw),
      additiveTransferFee: new CoinPretty(ATOM_CURRENCY, feeRaw),
      balanceRaw,
      onChangeCryptoInput,
    });

    const expected = trimPlaceholderZeros(
      makeBalance(balanceRaw)
        .toDec()
        .sub(makeGasCost(gasRaw).toDec().mul(MUL_GAS_SLIPPAGE))
        .sub(new CoinPretty(ATOM_CURRENCY, feeRaw).toDec())
        .toString()
    );

    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected);
    });
  });

  it("subtracts an additive transfer fee even when gas is unknown", async () => {
    const balanceRaw = "2000000";
    const feeRaw = "30000";
    const onChangeCryptoInput = jest.fn();

    renderInput({
      isMax: true,
      cryptoInput: makeBalance(balanceRaw).toDec().toString(),
      transferGasCost: undefined,
      additiveTransferFee: new CoinPretty(ATOM_CURRENCY, feeRaw),
      balanceRaw,
      onChangeCryptoInput,
    });

    const expected = trimPlaceholderZeros(
      makeBalance(balanceRaw)
        .toDec()
        .sub(new CoinPretty(ATOM_CURRENCY, feeRaw).toDec())
        .toString()
    );

    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected);
    });
  });

  it("re-applies when an additive fee arrives after a gas-only application", async () => {
    const balanceRaw = "2000000";
    const gasRaw = "5000";
    const feeRaw = "30000";
    const onChangeCryptoInput = jest.fn();

    // 1) gas-only quote applies and latches the guard
    const { rerender } = renderInput({
      isMax: true,
      cryptoInput: makeBalance(balanceRaw).toDec().toString(),
      transferGasCost: makeGasCost(gasRaw),
      balanceRaw,
      onChangeCryptoInput,
    });

    const gasOnlyExpected = expectedMaxAfterGas(balanceRaw, gasRaw);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(gasOnlyExpected);
    });

    onChangeCryptoInput.mockClear();

    // 2) the selected quote switches to one with an additive fee
    //    (e.g. best provider becomes Skip) — the fee must also be reserved
    const balance = makeBalance(balanceRaw);
    rerender(
      <CryptoFiatInput
        currentUnit="crypto"
        setCurrentUnit={jest.fn()}
        isMax={true}
        setIsMax={jest.fn()}
        canSetMax={true}
        transferGasCost={makeGasCost(gasRaw)}
        additiveTransferFee={new CoinPretty(ATOM_CURRENCY, feeRaw)}
        transferGasChain={{ prettyName: "Cosmos Hub" }}
        assetPrice={undefined}
        assetWithBalance={{
          denom: "ATOM",
          address: "uatom",
          decimals: 6,
          amount: balance,
        }}
        cryptoInput={gasOnlyExpected}
        onChangeCryptoInput={onChangeCryptoInput}
        fiatInput=""
        onChangeFiatInput={jest.fn()}
        isInsufficientBal={false}
        isInsufficientFee={false}
      />
    );

    const withFeeExpected = trimPlaceholderZeros(
      balance
        .toDec()
        .sub(makeGasCost(gasRaw).toDec().mul(MUL_GAS_SLIPPAGE))
        .sub(new CoinPretty(ATOM_CURRENCY, feeRaw).toDec())
        .toString()
    );

    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(withFeeExpected);
    });
  });

  it("leaves the input at the full balance when fees exceed it (quote stays visible)", async () => {
    // Dust-balance Skip deposit: the additive bridge fee plus gas head-room
    // cost more than the whole balance, so there is no fundable max. The input
    // must NOT be clamped to zero — keeping it non-zero lets the quote and its
    // fee breakdown render; useBridgeQuotes flags the shortfall and blocks the
    // transfer.
    const balanceRaw = "30000";
    const gasRaw = "16000"; // *2 slippage = 32000, already over balance
    const feeRaw = "20000";
    const onChangeCryptoInput = jest.fn();

    renderInput({
      isMax: true,
      cryptoInput: makeBalance(balanceRaw).toDec().toString(),
      transferGasCost: makeGasCost(gasRaw),
      additiveTransferFee: new CoinPretty(ATOM_CURRENCY, feeRaw),
      balanceRaw,
      onChangeCryptoInput,
    });

    await new Promise((r) => setTimeout(r, 100));
    expect(onChangeCryptoInput).not.toHaveBeenCalledWith("0");
  });

  it("shows the fee-specific message when an additive fee makes the balance insufficient", () => {
    const { queryByText } = renderInput({
      isMax: false,
      cryptoInput: "1",
      transferGasCost: makeGasCost("5000"),
      additiveTransferFee: new CoinPretty(ATOM_CURRENCY, "30000"),
      balanceRaw: "2000000",
      onChangeCryptoInput: jest.fn(),
      isInsufficientFee: true,
    });

    expect(
      queryByText("components.cryptoFiatInput.feesExceedBalance")
    ).toBeInTheDocument();
    expect(
      queryByText("components.cryptoFiatInput.insufficientFunds")
    ).not.toBeInTheDocument();
  });

  it("shows the generic insufficient-funds message when there is no additive fee", () => {
    const { queryByText } = renderInput({
      isMax: false,
      cryptoInput: "1",
      transferGasCost: makeGasCost("5000"),
      balanceRaw: "2000000",
      onChangeCryptoInput: jest.fn(),
      isInsufficientBal: true,
    });

    expect(
      queryByText("components.cryptoFiatInput.insufficientFunds")
    ).toBeInTheDocument();
    expect(
      queryByText("components.cryptoFiatInput.feesExceedBalance")
    ).not.toBeInTheDocument();
  });

  it("leaves the full balance usable when the additive fee denom differs from the input", async () => {
    // the common ERC-20 deposit path: input in the token (here ATOM stands in
    // for WETH/USDC), while gas and the additive bridge fee are native ETH
    const balanceRaw = "2000000";
    const onChangeCryptoInput = jest.fn();

    const ETH_CURRENCY = {
      coinDecimals: 18,
      coinDenom: "ETH",
      coinMinimalDenom: "wei",
    };

    renderInput({
      isMax: true,
      cryptoInput: makeBalance(balanceRaw).toDec().toString(),
      transferGasCost: new CoinPretty(ETH_CURRENCY, "840000000000000"),
      additiveTransferFee: new CoinPretty(ETH_CURRENCY, "73924361079993"),
      balanceRaw,
      onChangeCryptoInput,
    });

    // Neither the gas nor the fee is payable in the input denom, so the
    // max input must remain the full balance (no deduction fires).
    await new Promise((r) => setTimeout(r, 100));
    expect(onChangeCryptoInput).not.toHaveBeenCalled();
  });

  it("sets full balance when transferGasCost is undefined", async () => {
    const balanceRaw = "2000000";
    const onChangeCryptoInput = jest.fn();
    const balanceDec = makeBalance(balanceRaw).toDec().toString();
    const expected = trimPlaceholderZeros(balanceDec);

    renderInput({
      isMax: true,
      cryptoInput: "",
      transferGasCost: undefined,
      balanceRaw,
      onChangeCryptoInput,
    });

    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected);
    });
  });

  it("applies gas when transferGasCost arrives after initial undefined", async () => {
    const balanceRaw = "2000000";
    const gasRaw = "5000";
    const onChangeCryptoInput = jest.fn();
    const balanceDec = makeBalance(balanceRaw).toDec().toString();
    const balance = makeBalance(balanceRaw);

    const baseProps = {
      currentUnit: "crypto" as const,
      setCurrentUnit: jest.fn(),
      setIsMax: jest.fn(),
      canSetMax: true,
      transferGasChain: { prettyName: "Cosmos Hub" },
      assetPrice: undefined,
      assetWithBalance: {
        denom: "ATOM",
        address: "uatom",
        decimals: 6,
        amount: balance,
      },
      fiatInput: "",
      onChangeFiatInput: jest.fn(),
      isInsufficientBal: false,
      isInsufficientFee: false,
    };

    // 1) Initial render: isMax=true, no gas cost yet
    const { rerender } = render(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={undefined}
        cryptoInput=""
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const fullBalance = trimPlaceholderZeros(balanceDec);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(fullBalance);
    });

    onChangeCryptoInput.mockClear();

    // 2) Gas cost arrives — should deduct gas from balance
    rerender(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={makeGasCost(gasRaw)}
        cryptoInput={balanceDec}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const expectedAfterGas = expectedMaxAfterGas(balanceRaw, gasRaw);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expectedAfterGas);
    });
  });

  it("does not adjust input when it is already below gas-adjusted max", async () => {
    const balanceRaw = "2000000";
    const gasRaw = "5000";
    const onChangeCryptoInput = jest.fn();

    const alreadyReducedInput = "1.0";

    renderInput({
      isMax: true,
      cryptoInput: alreadyReducedInput,
      transferGasCost: makeGasCost(gasRaw),
      balanceRaw,
      onChangeCryptoInput,
    });

    await new Promise((r) => setTimeout(r, 100));
    expect(onChangeCryptoInput).not.toHaveBeenCalled();
  });

  it("re-applies gas when asset changes while Max stays enabled", async () => {
    const balanceRaw = "2000000";
    const gasRaw = "5000";
    const onChangeCryptoInput = jest.fn();

    const balanceDec = makeBalance(balanceRaw).toDec().toString();
    const balance = makeBalance(balanceRaw);

    const baseProps = {
      currentUnit: "crypto" as const,
      setCurrentUnit: jest.fn(),
      setIsMax: jest.fn(),
      canSetMax: true,
      transferGasChain: { prettyName: "Cosmos Hub" },
      assetPrice: undefined,
      fiatInput: "",
      onChangeFiatInput: jest.fn(),
      isInsufficientBal: false,
      isInsufficientFee: false,
    };

    // 1) First asset (ATOM)
    const { rerender } = render(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={makeGasCost(gasRaw)}
        assetWithBalance={{
          denom: "ATOM",
          address: "uatom",
          decimals: 6,
          amount: balance,
        }}
        cryptoInput={balanceDec}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const expectedAtom = expectedMaxAfterGas(balanceRaw, gasRaw);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expectedAtom);
    });

    onChangeCryptoInput.mockClear();

    const junoBalance = new CoinPretty(
      { coinDecimals: 6, coinDenom: "JUNO", coinMinimalDenom: "ujuno" },
      "3000000"
    );
    const junoGas = new CoinPretty(
      { coinDecimals: 6, coinDenom: "JUNO", coinMinimalDenom: "ujuno" },
      "4200"
    );

    // 2) Switch to JUNO while Max is still enabled
    rerender(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={junoGas}
        assetWithBalance={{
          denom: "JUNO",
          address: "ujuno",
          decimals: 6,
          amount: junoBalance,
        }}
        cryptoInput={junoBalance.toDec().toString()}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const expectedJuno = trimPlaceholderZeros(
      junoBalance.toDec().sub(junoGas.toDec().mul(MUL_GAS_SLIPPAGE)).toString()
    );

    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expectedJuno);
    });
  });

  it("re-applies gas after transferGasCost goes undefined then returns", async () => {
    const balanceRaw = "2000000";
    const gasRaw1 = "5000";
    const gasRaw2 = "5200";
    const onChangeCryptoInput = jest.fn();

    const balanceDec = makeBalance(balanceRaw).toDec().toString();
    const balance = makeBalance(balanceRaw);

    const baseProps = {
      currentUnit: "crypto" as const,
      setCurrentUnit: jest.fn(),
      setIsMax: jest.fn(),
      canSetMax: true,
      transferGasChain: { prettyName: "Cosmos Hub" },
      assetPrice: undefined,
      assetWithBalance: {
        denom: "ATOM",
        address: "uatom",
        decimals: 6,
        amount: balance,
      },
      fiatInput: "",
      onChangeFiatInput: jest.fn(),
      isInsufficientBal: false,
      isInsufficientFee: false,
    };

    // 1) Gas applied initially
    const { rerender } = render(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={makeGasCost(gasRaw1)}
        cryptoInput={balanceDec}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const expected1 = expectedMaxAfterGas(balanceRaw, gasRaw1);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected1);
    });

    onChangeCryptoInput.mockClear();

    // 2) Quotes fail — transferGasCost goes undefined while isMax stays true
    rerender(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={undefined}
        cryptoInput={expected1}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const fullBalance = trimPlaceholderZeros(balanceDec);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(fullBalance);
    });

    onChangeCryptoInput.mockClear();

    // 3) Quotes succeed again — gas should be deducted fresh
    rerender(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={makeGasCost(gasRaw2)}
        cryptoInput={balanceDec}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    const expected2 = expectedMaxAfterGas(balanceRaw, gasRaw2);
    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith(expected2);
    });
  });
});
