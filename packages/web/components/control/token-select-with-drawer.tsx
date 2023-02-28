import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";

import { EventName } from "../../config";
import { useAmplitudeAnalytics, useWindowSize } from "../../hooks";
import { useStore } from "../../stores";
import { Icon } from "../assets";
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
    onSelect: onSelectProp,
    sortByBalances = false,
    dropdownOpen,
    setDropdownState,
  }) => {
    const { chainStore, priceStore } = useStore();
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const { logEvent } = useAmplitudeAnalytics();

    // parent overrideable state
    const [isSelectOpenLocal, setIsSelectOpenLocal] = useState(false);
    const isSelectOpen =
      dropdownOpen === undefined ? isSelectOpenLocal : dropdownOpen;
    const setIsSelectOpen =
      setDropdownState === undefined ? setIsSelectOpenLocal : setDropdownState;

    const selectedToken = tokens.find(
      (token) =>
        (token instanceof CoinPretty ? token.denom : token.coinDenom) ===
        selectedTokenDenom
    );

    const dropdownTokens = tokens
      .filter(
        (token) =>
          (token instanceof CoinPretty ? token.denom : token.coinDenom) !==
          selectedTokenDenom
      )
      .map((token) => ({
        token,
        // get chain name
        chainName:
          chainStore.getChainFromCurrency(
            token instanceof CoinPretty ? token.denom : token.coinDenom
          )?.chainName ?? "",
      }))
      .sort((a, b) => {
        // provided tokens don't have balances, or not sorting by balance, don't sort
        if (
          !(a.token instanceof CoinPretty) ||
          !(b.token instanceof CoinPretty) ||
          !sortByBalances
        )
          return 0;

        // 0 balance tokens short circuit sorting
        if (a.token.toDec().isZero() && b.token.toDec().isZero()) return 0;
        if (a.token.toDec().isZero()) return 1;
        if (b.token.toDec().isZero()) return -1;

        // calculate prices for tokens with > 0 balance
        const aFiatValue = priceStore.calculatePrice(a.token);
        const bFiatValue = priceStore.calculatePrice(b.token);

        // sort by positive balances
        if (
          aFiatValue &&
          bFiatValue &&
          aFiatValue.toDec().gt(bFiatValue.toDec())
        )
          return -1;
        if (
          aFiatValue &&
          bFiatValue &&
          aFiatValue.toDec().lt(bFiatValue.toDec())
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

    const onSelect = (tokenDenom: string) => {
      logEvent([
        EventName.Swap.dropdownAssetSelected,
        { tokenName: tokenDenom, isOnHome: router.pathname === "/" },
      ]);
      onSelectProp(tokenDenom);
    };

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
                    <Icon
                      id="chevron-down"
                      width={20}
                      height={8}
                      className={`text-osmoverse-400 opacity-40 transition-transform duration-100 group-hover:opacity-100 ${
                        isSelectOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                )}
              </div>
              <div className="subtitle2 md:caption w-32 text-osmoverse-400">
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
