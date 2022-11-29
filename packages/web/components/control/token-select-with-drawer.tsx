import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { useWindowSize } from "../../hooks";
import classNames from "classnames";
import { TokenSelectDrawer } from "../drawers/token-select-drawer";

/** Will display balances if provided `CoinPretty` objects. Assumes denoms are unique. */
export const TokenSelectWithDrawer: FunctionComponent<{
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
    const [isSelectOpenLocal, setIsSelectOpenLocal] = useState(false);
    const isSelectOpen =
      dropdownOpen === undefined ? isSelectOpenLocal : dropdownOpen;
    const setIsSelectOpen =
      setDropdownState === undefined ? setIsSelectOpenLocal : setDropdownState;

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

    const selectedCurrency =
      selectedToken instanceof CoinPretty
        ? selectedToken.currency
        : selectedToken;
    const selectedDenom =
      selectedCurrency?.coinDenom.split(" ").slice(0, 1).join(" ") ?? "";

    const canSelectTokens = tokens.length > 1;

    return (
      <div className="flex items-center justify-center md:justify-start">
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
              <div className="mr-1 h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full md:h-7 md:w-7">
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
                  <div className="ml-3 w-5 md:ml-2 md:pb-1.5">
                    <Image
                      className={`opacity-40 transition-transform duration-100 group-hover:opacity-100 ${
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
              <div className="subtitle2 md:caption w-24 text-osmoverse-400">
                {chainStore.getChainFromCurrency(selectedCurrency.coinDenom)
                  ?.chainName ?? ""}
              </div>
            </div>
          </button>
        )}

        <div className="pt-16">
          <TokenSelectDrawer
            isOpen={isSelectOpen}
            onClose={() => setIsSelectOpen(false)}
            tokens={dropdownTokens}
            onSelect={onSelect}
          />
        </div>
      </div>
    );
  }
);
