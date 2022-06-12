import Image from "next/image";
import { FunctionComponent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { useBooleanWithWindowEvent, useFilteredData } from "../../hooks";
import { MobileProps } from "../types";

/** Will display balances if provided CoinPretty objects. Assumes denoms are unique. */
export const TokenSelect: FunctionComponent<
  {
    selectedTokenDenom: string;
    tokens: (CoinPretty | AppCurrency)[];
    onSelect: (tokenDenom: string) => void;
    sortByBalances?: boolean;
    dropdownOpen?: boolean;
    setDropdownState?: (isOpen: boolean) => void;
  } & MobileProps
> = observer(
  ({
    selectedTokenDenom,
    tokens,
    onSelect,
    sortByBalances = false,
    isMobile = false,
    dropdownOpen,
    setDropdownState,
  }) => {
    const { chainStore, priceStore } = useStore();

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
        if (!(a instanceof CoinPretty) || !(b instanceof CoinPretty)) return 0;

        const aFiatValue = priceStore.calculatePrice(a);
        const bFiatValue = priceStore.calculatePrice(b);

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
            className={`flex items-center text-left group ${
              canSelectTokens ? "cursor-pointer" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (canSelectTokens) {
                setIsSelectOpen(!isSelectOpen);
              }
            }}
          >
            <div className="w-14 h-14 md:h-9 md:w-9 rounded-full border border-enabledGold flex items-center justify-center shrink-0 mr-3 md:mr-2">
              {selectedCurrency.coinImageUrl && (
                <div className="w-11 h-11 md:h-7 md:w-7 rounded-full overflow-hidden">
                  <Image
                    src={selectedCurrency.coinImageUrl}
                    alt="token icon"
                    className="rounded-full"
                    width={isMobile ? 30 : 44}
                    height={isMobile ? 30 : 44}
                  />
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center">
                {isMobile ? <h6>{selectedDenom}</h6> : <h5>{selectedDenom}</h5>}
                {canSelectTokens && (
                  <div className="w-5 ml-3 md:ml-2 pb-1">
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
              <div className="subtitle2 md:caption text-iconDefault">
                {chainStore.getChainFromCurrency(selectedCurrency.coinDenom)
                  ?.chainName ?? ""}
              </div>
            </div>
          </button>
        )}

        {isSelectOpen && (
          <div
            className="absolute bottom-0 md:-left-3 -left-4 translate-y-full md:p-1 p-3.5 bg-surface rounded-b-2xl z-50 w-[28.5rem] sm:w-[calc(100vw-24px)] md:max-w-[454px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center h-9 pl-4 mb-3 rounded-2xl bg-card">
              <div className="w-[1.125rem] h-[1.125rem] shrink-0">
                <Image
                  src="/icons/search-hollow.svg"
                  alt="search"
                  width={18}
                  height={18}
                />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="px-4 subtitle2 text-white-full bg-transparent font-normal"
                placeholder="Search tokens"
                onClick={(e) => e.stopPropagation()}
                value={searchValue}
                onInput={(e: any) => setTokenSearch(e.target.value)}
              />
            </div>

            <ul className="token-item-list overflow-y-scroll max-h-80">
              {searchedTokens.map((token, index) => {
                const currency =
                  token.token instanceof CoinPretty
                    ? token.token.currency
                    : token.token;
                const { coinDenom, coinImageUrl } = currency;
                const networkName = token.chainName;
                const justDenom =
                  coinDenom.split(" ").slice(0, 1).join(" ") ?? "";
                const channel =
                  "paths" in currency
                    ? (currency as IBCCurrency).paths[0].channelId
                    : undefined;

                const showChannel = coinDenom.includes("channel");

                return (
                  <li
                    key={index}
                    className="flex justify-between items-center rounded-2xl py-2.5 px-3 my-1 hover:bg-card cursor-pointer mr-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(coinDenom);
                      setTokenSearch("");
                      setIsSelectOpen(false);
                    }}
                  >
                    <button className="flex items-center justify-between text-left w-full">
                      <div className="flex items-center">
                        {coinImageUrl && (
                          <div className="w-9 h-9 rounded-full mr-3">
                            <Image
                              src={coinImageUrl}
                              alt="token icon"
                              width={36}
                              height={36}
                            />
                          </div>
                        )}
                        <div>
                          <h6 className="text-white-full">{justDenom}</h6>
                          <div className="text-iconDefault text-left md:caption font-semibold">
                            {showChannel
                              ? `${networkName} ${channel}`
                              : networkName}
                          </div>
                        </div>
                      </div>
                      <div className="md:text-sm">
                        {token instanceof CoinPretty &&
                          token.trim(true).hideDenom(true).toString()}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
