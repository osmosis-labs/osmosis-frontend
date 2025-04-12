import { QuoteDirection } from "@osmosis-labs/tx";
import { Dec } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";
import { useState } from "react";

import { useTwinnedSwapInput } from "../use-twinned-swap-input";

describe("useTwinnedSwapInput", () => {
  const TestComponent = () => {
    const [tokenAmount, setTokenAmount] = useState("");
    const [fiatAmount, setFiatAmount] = useState("");
    const [price, setPrice] = useState("1");
    const [marketAmount, setMarketAmount] = useState("");
    const [marketOutAmount, setMarketOutAmount] = useState("");
    const [quoteType, setQuoteType] = useState<QuoteDirection>("in-given-out");
    const [tab, setTab] = useState<"buy" | "sell">("buy");
    const [focused, setFocused] = useState<"fiat" | "token">("fiat");

    const twinnedInputs = useTwinnedSwapInput({
      tokenAmount,
      setTokenAmount,
      fiatAmount,
      setFiatAmount,
      price: new Dec(
        typeof price !== "undefined" && price.length > 0 ? price : 1
      ),
      setMarketAmount,
      setMarketOutAmount,
      setQuoteType,
      // We only need to test the market input
      // as we can manually adjust the price using the above state variable
      // which can replicate the behavior of the limit price input
      type: "market",
      tab,
      focused,
      baseAssetDecimals: 6,
    });

    return {
      tokenAmount,
      fiatAmount,
      price,
      marketAmount,
      marketOutAmount,
      quoteType,
      setQuoteType,
      setTokenAmount,
      setFiatAmount,
      setPrice,
      setTab,
      setFocused,
      twinnedInputs,
    };
  };

  let result: any;

  describe.each(["buy", "sell"])("when the user is %sing", (tabType) => {
    describe.each(["fiat", "token"])("and inputting a %s amount", (focused) => {
      beforeEach(() => {
        const { result: hookResult } = renderHook(() => TestComponent());
        act((): void => {
          hookResult.current.setTab(tabType as "buy" | "sell");
          hookResult.current.setFocused(focused as "fiat" | "token");
        });
        result = hookResult;
      });

      describe("input validation", () => {
        let setAmount: (value: string) => void;
        let expectedQuoteType: QuoteDirection;
        let updatedMarketField: string;

        beforeEach(() => {
          setAmount =
            focused === "fiat"
              ? result.current.twinnedInputs.onFiatAmountChange
              : result.current.twinnedInputs.onTokenAmountChange;

          if (tabType === "buy") {
            expectedQuoteType =
              focused === "fiat" ? "out-given-in" : "in-given-out";
          } else {
            expectedQuoteType =
              focused === "fiat" ? "in-given-out" : "out-given-in";
          }

          if (expectedQuoteType === "out-given-in") {
            updatedMarketField = "marketAmount";
          } else {
            updatedMarketField = "marketOutAmount";
          }

          act(() => {
            result.current.setPrice("1");
            setAmount("");
            result.current.setQuoteType("in-given-out");
          });
        });

        test.each([
          {
            scenario: "valid number input",
            input: "100",
            expectedToken: "100",
            expectedFiat: "100",
          },
          {
            scenario: "empty input",
            input: "",
            expectedToken: "",
            expectedFiat: "",
            fail: true,
          },
          {
            scenario: "non-numeric input",
            input: "notanumber",
            expectedToken: "",
            expectedFiat: "",
            fail: true,
          },
          {
            scenario: "extremely large number",
            input: "1234567891011121314151617181920212223242526",
            expectedToken: "",
            expectedFiat: "",
            fail: true,
          },
          {
            scenario: "negative number",
            input: "-100",
            expectedToken: "",
            expectedFiat: "",
            fail: true,
          },
          {
            scenario: "decimal number with proper precision",
            input: "100.12345678",
            expectedToken: focused === "fiat" ? "100.12" : "100.123456",
            expectedFiat: focused === "fiat" ? "100.12" : "100.123456",
          },
          {
            scenario: "number with too many decimal places",
            input: "100.1234567890",
            expectedToken: focused === "fiat" ? "100.12" : "100.123456",
            expectedFiat: focused === "fiat" ? "100.12" : "100.123456",
          },
          {
            scenario: "a non-standard price",
            input: "100",
            price: "0.125",
            expectedToken: focused === "fiat" ? "800" : "100",
            expectedFiat: focused === "fiat" ? "100" : "12.5",
          },
        ])(
          "should handle $scenario",
          ({ input, expectedToken, expectedFiat, fail, price = "1" }) => {
            act(() => {
              result.current.setPrice(price);
              setAmount(input);
            });

            // Check primary inputs are set correctly
            expect(result.current.tokenAmount).toBe(expectedToken);
            expect(result.current.fiatAmount).toBe(expectedFiat);

            // Check market conditions are set correctly
            expect(result.current.quoteType).toBe(
              fail ? "in-given-out" : expectedQuoteType
            );
            if (!fail) {
              expect(result.current[updatedMarketField]).toBe(
                focused === "fiat" ? expectedFiat : expectedToken
              );
            }
          }
        );
      });

      describe(`should update the non-focused input when the price changes`, () => {
        let setAmount: (value: string) => void;
        let focusedInput: string;
        let nonFocusedInput: string;
        let updatedMarketField: string;

        beforeEach(() => {
          setAmount =
            focused === "fiat"
              ? result.current.twinnedInputs.onFiatAmountChange
              : result.current.twinnedInputs.onTokenAmountChange;

          if (tabType === "buy") {
            updatedMarketField =
              focused === "fiat" ? "marketOutAmount" : "marketAmount";
          } else {
            updatedMarketField =
              focused === "fiat" ? "marketAmount" : "marketOutAmount";
          }

          focusedInput = focused === "fiat" ? "fiatAmount" : "tokenAmount";
          nonFocusedInput = focused === "fiat" ? "tokenAmount" : "fiatAmount";

          // Set initial amount to 100
          act(() => {
            setAmount("100");
            result.current.setPrice("1");
          });
        });

        test.each([
          { price: "-1", expectedOutput: "100" },
          { price: "0", expectedOutput: "100" },
          { price: "0.5", expectedOutput: focused === "fiat" ? "200" : "50" },
          { price: "1", expectedOutput: "100" },
          { price: "2", expectedOutput: focused === "fiat" ? "50" : "200" },
          { price: "10", expectedOutput: focused === "fiat" ? "10" : "1000" },
        ])(
          "should handle price change to $price correctly",
          ({ price, expectedOutput }) => {
            // Update the price
            act(() => {
              result.current.setPrice(price);
            });

            // Primary input should be the same as the initial amount
            expect(result.current[focusedInput]).toBe("100");
            expect(result.current[nonFocusedInput]).toBe(expectedOutput);
            // If the price is not 1 and larger than 0, the market input should be updated
            // We do not count if the price is 1 as no adjustment is made when the price is unchanged
            if (parseInt(price) > 0 && parseInt(price) !== 1) {
              expect(result.current[updatedMarketField]).toBe(expectedOutput);
            }
          }
        );
      });
    });
  });
});
