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

  it("clamps max to zero when gas plus the additive fee exceed the balance", async () => {
    // Reproduces the dust-balance Skip deposit that failed on-chain: the
    // additive bridge fee plus gas head-room cost more than the whole balance,
    // so there is no fundable amount. The input must clamp to zero instead of
    // leaving the full balance (which builds a tx whose value exceeds the
    // balance and fails at signing).
    const balanceRaw = "82750538726230";
    const gasRaw = "16746229134611";
    const feeRaw = "63381527751084";
    const onChangeCryptoInput = jest.fn();

    const ETH_CURRENCY = {
      coinDecimals: 18,
      coinDenom: "ETH",
      coinMinimalDenom: "wei",
    };
    const balance = new CoinPretty(ETH_CURRENCY, balanceRaw);

    const { queryByText } = render(
      <CryptoFiatInput
        currentUnit="crypto"
        setCurrentUnit={jest.fn()}
        isMax={true}
        setIsMax={jest.fn()}
        canSetMax={true}
        transferGasCost={new CoinPretty(ETH_CURRENCY, gasRaw)}
        additiveTransferFee={new CoinPretty(ETH_CURRENCY, feeRaw)}
        transferGasChain={{ prettyName: "Ethereum" }}
        assetPrice={undefined}
        assetWithBalance={{
          denom: "ETH",
          address: "wei",
          decimals: 18,
          amount: balance,
        }}
        cryptoInput={balance.toDec().toString()}
        onChangeCryptoInput={onChangeCryptoInput}
        fiatInput=""
        onChangeFiatInput={jest.fn()}
        isInsufficientBal={false}
        isInsufficientFee={false}
      />
    );

    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith("0");
    });

    // the user is told why max resolved to zero
    await waitFor(() => {
      expect(
        queryByText("components.cryptoFiatInput.feesExceedBalance")
      ).toBeInTheDocument();
    });
  });

  it("keeps max at zero when quoting drops out after a fees-exceed-balance clamp", async () => {
    // After clamping to zero the input stops quoting, so gas/fee go undefined.
    // The no-quote branch must NOT restore the full balance — doing so would
    // re-enable the unfundable transfer and oscillate the input.
    const balanceRaw = "82750538726230";
    const gasRaw = "16746229134611";
    const feeRaw = "63381527751084";
    const onChangeCryptoInput = jest.fn();

    const ETH_CURRENCY = {
      coinDecimals: 18,
      coinDenom: "ETH",
      coinMinimalDenom: "wei",
    };
    const balance = new CoinPretty(ETH_CURRENCY, balanceRaw);

    const baseProps = {
      currentUnit: "crypto" as const,
      setCurrentUnit: jest.fn(),
      setIsMax: jest.fn(),
      canSetMax: true,
      transferGasChain: { prettyName: "Ethereum" },
      assetPrice: undefined,
      assetWithBalance: {
        denom: "ETH",
        address: "wei",
        decimals: 18,
        amount: balance,
      },
      fiatInput: "",
      onChangeFiatInput: jest.fn(),
      isInsufficientBal: false,
      isInsufficientFee: false,
    };

    // 1) Quote present, fees exceed balance -> clamp to zero
    const { rerender } = render(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={new CoinPretty(ETH_CURRENCY, gasRaw)}
        additiveTransferFee={new CoinPretty(ETH_CURRENCY, feeRaw)}
        cryptoInput={balance.toDec().toString()}
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    await waitFor(() => {
      expect(onChangeCryptoInput).toHaveBeenCalledWith("0");
    });

    onChangeCryptoInput.mockClear();

    // 2) Input is now zero so quoting stops: gas and fee go undefined
    rerender(
      <CryptoFiatInput
        {...baseProps}
        isMax={true}
        transferGasCost={undefined}
        additiveTransferFee={undefined}
        cryptoInput="0"
        onChangeCryptoInput={onChangeCryptoInput}
      />
    );

    // The full balance must NOT be restored.
    await new Promise((r) => setTimeout(r, 100));
    expect(onChangeCryptoInput).not.toHaveBeenCalledWith(
      trimPlaceholderZeros(balance.toDec().toString())
    );
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
