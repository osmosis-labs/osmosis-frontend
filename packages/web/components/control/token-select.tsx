import Image from "next/image";
import { FunctionComponent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { TokenSelectModal } from "../../modals";
import {
  useBooleanWithWindowEvent,
  useFilteredData,
  useWindowSize,
} from "../../hooks";
import classNames from "classnames";

/** Will display balances if provided `CoinPretty` objects. Assumes denoms are unique. */
export const TokenSelect: FunctionComponent<{
  selectedTokenDenom: string;
  tokens: (CoinPretty | AppCurrency)[];
  onSelect: (tokenDenom: string) => void;
  sortByBalances?: boolean;
  dropdownOpen?: boolean;
  setDropdownState?: (isOpen: boolean) => void;
}> = observer(
  ({
    selectedTokenDenom,
    tokens,
    onSelect,
    sortByBalances = false,
    dropdownOpen,
    setDropdownState,
  }) => {
    const { chainStore, priceStore } = useStore();
    const { isMobile } = useWindowSize();

    // parent overrideable state
    const [isSelectOpenLocal, setIsSelectOpenLocal] =
      useBooleanWithWindowEvent(false);
    const isSelectOpen =
      dropdownOpen === undefined ? isSelectOpenLocal : dropdownOpen;
    const setIsSelectOpen =
      setDropdownState === undefined ? setIsSelectOpenLocal : setDropdownState;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const selectedToken = tokens.find((token) =>
      (token instanceof CoinPretty ? token.denom : token.coinDenom).includes(
        selectedTokenDenom
      )
    );

    const dropdownTokens = tokens
      .filter(
        (token) =>
          !(
            token instanceof CoinPretty ? token.denom : token.coinDenom
          ).includes(selectedTokenDenom)
      )
      .map((token) => ({
        token,
        // filter by chain name
        chainName:
          chainStore.getChainFromCurrency(
            token instanceof CoinPretty ? token.denom : token.coinDenom
          )?.chainName ?? "",
      }))
      .sort((a, b) => {
        if (
          !(a.token instanceof CoinPretty) ||
          !(b.token instanceof CoinPretty)
        )
          return 0;

        const aFiatValue = priceStore.calculatePrice(a.token);
        const bFiatValue = priceStore.calculatePrice(b.token);

        if (
          aFiatValue &&
          bFiatValue &&
          aFiatValue.toDec().gt(bFiatValue.toDec()) &&
          sortByBalances
        )
          return -1;
        if (
          aFiatValue &&
          bFiatValue &&
          aFiatValue.toDec().lt(bFiatValue.toDec()) &&
          sortByBalances
        )
          return 1;
        return 0;
      });

    const [searchValue, setTokenSearch, searchedTokens] = useFilteredData(
      dropdownTokens,
      [
        "token.denom",
        "token.currency.originCurrency.coinMinimalDenom",
        "token.originCurrency.coinMinimalDenom",
        "chainName",
        "token.currency.originCurrency.pegMechanism",
      ]
    );
    const selectedCurrency =
      selectedToken instanceof CoinPretty
        ? selectedToken.currency
        : selectedToken;
    const selectedDenom =
      selectedCurrency?.coinDenom.split(" ").slice(0, 1).join(" ") ?? "";

    const canSelectTokens = tokens.length > 1;

    useEffect(() => {
      if (isSelectOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isSelectOpen]);

    useEffect(() => {
      const listener = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsSelectOpen(false);
        }
      };
      if (typeof document !== "undefined") {
        document.addEventListener("keydown", listener);
        return () => document.removeEventListener("keydown", listener);
      }
    }, [setIsSelectOpen]);

    return (
      <div className="flex md:justify-start justify-center items-center relative">
        {selectedCurrency && (
          <button
            className={classNames(
              "flex items-center gap-2 text-left",
              canSelectTokens ? "cursor-pointer" : "cursor-default"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (canSelectTokens) {
                setIsSelectOpen(!isSelectOpen);
              }
            }}
          >
            {selectedCurrency.coinImageUrl && (
              <div className="w-[50px] h-[50px] md:h-7 md:w-7 overflow-hidden shrink-0 mr-1">
                <Image
                  src={selectedCurrency.coinImageUrl}
                  alt="token icon"
                  width={isMobile ? 30 : 50}
                  height={isMobile ? 30 : 50}
                />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center">
                {isMobile ? (
                  <span className="subtitle1">{selectedDenom}</span>
                ) : (
                  <h5>{selectedDenom}</h5>
                )}
                {canSelectTokens && (
                  <div className="w-5 ml-3 md:ml-2 md:pb-1.5">
                    <Image
                      className={`opacity-40 group-hover:opacity-100 transition-transform duration-100 ${
                        isSelectOpen ? "rotate-180" : "rotate-0"
                      }`}
                      src="/icons/chevron-down.svg"
                      alt="select icon"
                      width={20}
                      height={8}
                    />
                  </div>
                )}
              </div>
              <div className="w-24 subtitle2 md:caption text-osmoverse-400">
                {chainStore.getChainFromCurrency(selectedCurrency.coinDenom)
                  ?.chainName ?? ""}
              </div>
            </div>
          </button>
        )}

        <TokenSelectModal
          isOpen={isSelectOpen}
          onRequestClose={() => {
            setTokenSearch("");
            setIsSelectOpen(false);
          }}
          currentValue={searchValue}
          onInput={(v) => setTokenSearch(v)}
          tokens={searchedTokens}
          onSelect={onSelect}
        />
      </div>
    );
  }
);
