import { QuoteDirection } from "@osmosis-labs/tx";
import { Dec } from "@osmosis-labs/unit";
import { useCallback, useEffect } from "react";

import { isValidNumericalRawInput } from "~/hooks/input/use-amount-input";
import { transformAmount, trimPlaceholderZeros } from "~/utils/number";

function isEmptyString(value: string) {
  return typeof value === "undefined" || value.trim().length === 0;
}

interface TwinnedInputProps {
  // Limit inputs
  setTokenAmount: (value: string) => void;
  setFiatAmount: (value: string) => void;
  // Market inputs
  setMarketAmount: (value: string) => void;
  setMarketOutAmount: (value: string) => void;
  setQuoteType: (value: QuoteDirection) => void;
  // Values
  fiatAmount: string;
  tokenAmount: string;
  price: Dec;
  type: "market" | "limit";
  tab: "buy" | "sell";
  focused: "fiat" | "token";
  baseAssetDecimals: number;
}

/**
 * Hook to handle the twinned inputs for the swap modal.
 *
 * This is used for the swap input on the buy and sell tabs.
 *
 * This hook is used to keep the token and fiat amounts in sync based on the current price.
 * The price comes from SQS for market orders and from the user's input for limit orders. If updating
 * values with a hook be careful when calling the provided functions so as not to create an infinite rerender loop.
 */
export const useTwinnedSwapInput = ({
  setTokenAmount,
  setFiatAmount,
  setMarketAmount,
  setMarketOutAmount,
  setQuoteType,
  fiatAmount,
  tokenAmount,
  focused,
  price,
  baseAssetDecimals,
  type,
  tab,
}: TwinnedInputProps) => {
  const reset = useCallback(() => {
    setFiatAmount("");
    setMarketAmount("");
    setMarketOutAmount("");
    setTokenAmount("");
  }, [setFiatAmount, setMarketAmount, setMarketOutAmount, setTokenAmount]);

  /**
   * Sets the token amount and updates the market amount and quote type
   * based on the tab and type.
   *
   * This is to keep all values in sync.
   */
  const setAllTokenAmounts = useCallback(
    (value: string) => {
      setTokenAmount(value);
      if (type === "market" && tab === "sell") {
        setMarketAmount(value);
        // When updating the token amount for a market order on the sell tab
        // we are setting the amount in so we must set the quote type to out-given-in
        setQuoteType("out-given-in");
      } else if (type === "market" && tab === "buy") {
        // When updating the token amount for a market order on the buy tab
        // we are setting the amount out so we must set the quote type to in-given-out
        setMarketOutAmount(value);
        setQuoteType("in-given-out");
      }
    },
    [
      setTokenAmount,
      setMarketAmount,
      setMarketOutAmount,
      setQuoteType,
      type,
      tab,
    ]
  );

  const handleTokenAmountChange = useCallback(
    (value: string) => {
      if (isEmptyString(value)) {
        reset();
        return;
      }

      if (price.isNegative()) {
        console.error("INPUT WARNING: Price is negative");
        return;
      }

      const tokenValue = transformAmount(value, baseAssetDecimals, false);

      if (
        !isValidNumericalRawInput(tokenValue) ||
        tokenValue.length > 26 ||
        (tokenValue.length > 0 && tokenValue.startsWith("-")) ||
        tokenValue.length === 0
      ) {
        return;
      }

      const tokenDec = new Dec(tokenValue);
      const fiatValue = price.mul(tokenDec);

      setAllTokenAmounts(tokenValue);
      setFiatAmount(trimPlaceholderZeros(fiatValue.toString()));
    },
    [price, setFiatAmount, baseAssetDecimals, reset, setAllTokenAmounts]
  );

  /**
   * Sets the fiat amount and updates the market amount and quote type
   * based on the tab and type.
   *
   * This is to keep all values in sync.
   */
  const setAllFiatAmounts = useCallback(
    (value: string) => {
      setFiatAmount(value);
      if (type === "market" && tab === "sell") {
        // When updating the fiat amount for a market order on the sell tab
        // we are setting the amount out so we must set the quote type to in-given-out
        setMarketOutAmount(value);
        setQuoteType("in-given-out");
      } else if (type === "market" && tab === "buy") {
        // When updating the fiat amount for a market order on the buy tab
        // we are setting the amount in so we must set the quote type to out-given-in
        setMarketAmount(value);
        setQuoteType("out-given-in");
      }
    },
    [
      setFiatAmount,
      setMarketAmount,
      setMarketOutAmount,
      setQuoteType,
      type,
      tab,
    ]
  );

  const handleFiatAmountChange = useCallback(
    (value: string) => {
      if (isEmptyString(value)) {
        reset();
        return;
      }

      // This should never happen but we should avoid dividing by zero
      if (price.isZero()) {
        console.error("INPUT WARNING: Price is zero");
        return;
      }

      if (price.isNegative()) {
        console.error("INPUT WARNING: Price is negative");
        return;
      }

      // Fiat amount is always 2 decimal places
      const fiatValue = transformAmount(value, 2, false);

      if (
        !isValidNumericalRawInput(fiatValue) ||
        fiatValue.length > 26 ||
        (fiatValue.length > 0 && fiatValue.startsWith("-")) ||
        fiatValue.length === 0
      ) {
        return;
      }

      const fiatDec = new Dec(fiatValue);
      const tokenValue = trimPlaceholderZeros(fiatDec.quo(price).toString());

      setAllFiatAmounts(fiatValue);
      setTokenAmount(tokenValue);
    },
    [price, setAllFiatAmounts, setTokenAmount, reset]
  );

  /**
   * We need to update the non-focused input when the price changes.
   * This is delicate as doing this incorrectly can cause an infinite rerender loop.
   *
   * There are 4 cases:
   * 1. Focused is fiat and tab is buy
   * 2. Focused is fiat and tab is sell
   * 3. Focused is token and tab is buy
   * 4. Focused is token and tab is sell
   *
   * For each case we check if there's an update after calculating the adjustmed amount.
   * If there is no udpate we return.
   */
  useEffect(() => {
    // This should never happen but we should avoid dividing by zero
    if (price.isZero()) {
      return;
    }

    if (price.isNegative()) {
      return;
    }

    if (focused === "fiat") {
      if (isEmptyString(fiatAmount)) {
        return;
      }

      const fiatValue = new Dec(fiatAmount);
      const tokenValue = trimPlaceholderZeros(fiatValue.quo(price).toString());
      if (tokenAmount === tokenValue) {
        // Nothing to update
        return;
      }

      setTokenAmount(tokenValue);

      if (tab === "buy") {
        // Case 1: Focused is fiat and tab is buy
        setMarketOutAmount(tokenValue);
      } else if (tab === "sell") {
        // Case 2: Focused is fiat and tab is sell
        setMarketAmount(tokenValue);
      }
    }

    if (focused === "token") {
      if (isEmptyString(tokenAmount)) {
        return;
      }

      const tokenValue = new Dec(tokenAmount);
      const fiatValue = trimPlaceholderZeros(tokenValue.mul(price).toString());
      if (fiatAmount === fiatValue) {
        // Nothing to update
        return;
      }

      setFiatAmount(fiatValue);

      if (tab === "buy") {
        // Case 3: Focused is token and tab is buy
        setMarketAmount(fiatValue);
      } else if (tab === "sell") {
        // Case 4: Focused is token and tab is sell
        setMarketOutAmount(fiatValue);
      }
    }
  }, [
    price,
    focused,
    fiatAmount,
    tokenAmount,
    setFiatAmount,
    setTokenAmount,
    tab,
    setMarketAmount,
    setMarketOutAmount,
  ]);

  return {
    onTokenAmountChange: handleTokenAmountChange,
    onFiatAmountChange: handleFiatAmountChange,
  };
};
