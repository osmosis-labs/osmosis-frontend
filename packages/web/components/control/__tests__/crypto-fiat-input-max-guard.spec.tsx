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

const MUL_GAS_SLIPPAGE = new Dec("1.1");

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
}

function renderInput({
  isMax,
  cryptoInput,
  transferGasCost,
  balanceRaw,
  onChangeCryptoInput,
  canSetMax = true,
  address = "uatom",
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
      isInsufficientBal={false}
      isInsufficientFee={false}
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
