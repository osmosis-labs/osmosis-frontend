import Image from "next/image";
import { FunctionComponent, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { TokenSelectModal } from "../../modals";
import { useBooleanWithWindowEvent, useFilteredData } from "../../hooks";
import { MobileProps } from "../types";
import classNames from "classnames";

/** Will display balances if provided `CoinPretty` objects. Assumes denoms are unique. */
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
            className={`flex items-center gap-2 text-left ${
              canSelectTokens ? "cursor-pointer" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (canSelectTokens) {
                setIsSelectOpen(!isSelectOpen);
              }
            }}
          >
            {selectedCurrency.coinImageUrl && (
              <div className="w-[50px] h-[50px] md:h-7 md:w-7 rounded-full overflow-hidden shrink-0 mr-1">
                <Image
                  src={selectedCurrency.coinImageUrl}
                  alt="token icon"
                  width={isMobile ? 30 : 50}
                  height={isMobile ? 30 : 50}
                />
              </div>
            )}
            <div className="relative flex flex-col">
              <div className="absolute -bottom-2.5 md:-bottom- flex items-center">
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
              <div className="absolute top-1 md:top-1.5 w-24 subtitle2 md:caption text-iconDefault">
                {chainStore.getChainFromCurrency(selectedCurrency.coinDenom)
                  ?.chainName ?? ""}
              </div>
            </div>
          </button>
        )}

        {isMobile ? (
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
        ) : (
          isSelectOpen && (
            <div
              className="absolute -bottom-1.5 md:-left-3 -left-4 translate-y-full md:p-1 p-3.5 bg-surface rounded-b-2xl z-50 w-[24.5rem] sm:w-[calc(100vw-50px)] md:max-w-[400px]"
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
                {searchedTokens.map((t, index) => {
                  const currency =
                    t.token instanceof CoinPretty ? t.token.currency : t.token;
                  const { coinDenom, coinImageUrl } = currency;
                  const networkName = t.chainName;
                  const justDenom =
                    coinDenom.split(" ").slice(0, 1).join(" ") ?? "";
                  const channel =
                    "paths" in currency
                      ? (currency as IBCCurrency).paths[0].channelId
                      : undefined;

                  const showChannel = coinDenom.includes("channel");
                  const fiatValue =
                    t.token instanceof CoinPretty && !t.token.toDec().isZero()
                      ? priceStore.calculatePrice(t.token)?.toString()
                      : undefined;

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
                        {t.token instanceof CoinPretty && (
                          <div className="flex flex-col text-right">
                            <span
                              className={classNames(
                                "text-white-high",
                                t.token.trim(true).hideDenom(true).toString()
                                  .length > 16 && t.token.toDec().isPositive()
                                  ? "body1 text-xs"
                                  : "body1"
                              )}
                            >
                              {t.token.trim(true).hideDenom(true).toString()}
                            </span>
                            {fiatValue && (
                              <span className="body2 text-iconDefault">
                                {fiatValue}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        )}
      </div>
    );
  }
);
