import Image from "next/image";
import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FunctionComponent, useRef } from "react";
import { useTranslation } from "react-multi-lang";
import { SearchBox } from "../input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useFilteredData } from "../../hooks";
import debounce from "debounce";
import { useWindowKeyActions } from "../../hooks/window/use-window-key-actions";
import { RecommendedSwapDenoms } from "../../config";
import useDraggableScroll from "../../hooks/use-draggable-scroll";

function getJustDenom(coinDenom: string) {
  return coinDenom.split(" ").slice(0, 1).join(" ") ?? "";
}

function getCurrency(token: CoinPretty | AppCurrency) {
  return token instanceof CoinPretty ? token.currency : token;
}

export const TokenSelectDrawer: FunctionComponent<{
  isOpen: boolean;
  onClose?: () => void;
  onSelect?: (tokenDenom: string) => void;
  tokens: {
    token: CoinPretty | AppCurrency;
    chainName: string;
  }[];
}> = observer(({ isOpen, tokens, onClose: onCloseProp, onSelect }) => {
  const t = useTranslation();
  const { priceStore } = useStore();

  const [_searchValue, setTokenSearch, searchedTokens] = useFilteredData(
    tokens,
    [
      "token.denom",
      "token.currency.originCurrency.coinMinimalDenom",
      "token.originCurrency.coinMinimalDenom",
      "chainName",
      "token.currency.originCurrency.pegMechanism",
    ]
  );

  const quickSelectRef = useRef<HTMLDivElement>(null);

  const { onMouseDown: onMouseDownQuickSelect } =
    useDraggableScroll(quickSelectRef);

  const onClose = () => {
    setTokenSearch("");
    onCloseProp?.();
  };

  useWindowKeyActions({
    escape: () => {
      onClose?.();
    },
  });

  const quickSelectTokens = tokens.filter(({ token }) => {
    const currency = getCurrency(token);

    const { coinDenom } = currency;
    const justDenom = getJustDenom(coinDenom);

    return RecommendedSwapDenoms.includes(justDenom);
  });

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={() => onClose?.()}
        className="absolute inset-0 z-40 bg-osmoverse-1000/40"
      />

      <div
        className={classNames(
          "bg-osmoverse-800 w-full h-full rounded-[24px] absolute z-50 flex flex-col mt-16",
          isOpen && "inset-0"
        )}
      >
        <div className="relative flex justify-center pt-8 pb-4">
          <button className="absolute left-4" onClick={() => onClose()}>
            <Image src="/icons/left.svg" alt="Close" width={24} height={24} />
          </button>

          <h1 className="text-h6">{t("components.selectToken.title")}</h1>
        </div>

        <div className="shadow-[0_4px_8px_0_rgba(9,5,36,0.12)]">
          <div className="p-4" onClick={(e) => e.stopPropagation()}>
            <SearchBox
              autoFocus
              type="text"
              className="!w-full"
              placeholder={t("components.searchTokens")}
              onInput={debounce((nextValue) => setTokenSearch(nextValue), 200)}
            />
          </div>

          <div className="mb-3 h-fit">
            <div
              ref={quickSelectRef}
              onMouseDown={onMouseDownQuickSelect}
              className="flex px-4 space-x-4 overflow-x-auto no-scrollbar"
            >
              {quickSelectTokens.map(({ token }) => {
                const currency = getCurrency(token);
                const { coinDenom, coinImageUrl } = currency;
                const justDenom = getJustDenom(coinDenom);

                return (
                  <button
                    key={currency.coinDenom}
                    className={classNames(
                      "flex items-center space-x-3 border border-osmoverse-700 rounded-lg p-2",
                      "transition-colors duration-150 ease-out hover:bg-osmoverse-900"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(coinDenom);
                      onClose?.();
                    }}
                  >
                    {coinImageUrl && (
                      <div className="w-[24px] h-[24px] rounded-full">
                        <Image
                          src={coinImageUrl}
                          alt="token icon"
                          width={24}
                          height={24}
                        />
                      </div>
                    )}
                    <p>{justDenom}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <ul className="flex flex-col overflow-auto">
          {searchedTokens.map((t) => {
            const currency = getCurrency(t.token);
            const { coinDenom, coinImageUrl } = currency;
            const networkName = t.chainName;
            const justDenom = getJustDenom(coinDenom);
            const channel =
              "paths" in currency
                ? (currency as IBCCurrency).paths[0].channelId
                : undefined;

            const showChannel = coinDenom.includes("channel");

            const tokenAmount =
              t.token instanceof CoinPretty
                ? t.token.hideDenom(true).trim(true).toString()
                : undefined;
            const tokenPrice =
              t.token instanceof CoinPretty
                ? priceStore.calculatePrice(t.token)?.toString()
                : undefined;

            return (
              <li
                key={currency.coinDenom}
                className={classNames(
                  "flex justify-between items-center py-2 px-5 cursor-pointer",
                  "transition-colors duration-150 ease-out hover:bg-osmoverse-900"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(coinDenom);
                  onClose();
                }}
              >
                <button className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center">
                    {coinImageUrl && (
                      <div className="w-8 h-8 mr-4 rounded-full">
                        <Image
                          src={coinImageUrl}
                          alt="token icon"
                          width={32}
                          height={32}
                        />
                      </div>
                    )}
                    <div>
                      <h6 className="text-white-full">{justDenom}</h6>
                      <div className="font-semibold text-left text-osmoverse-400 md:caption">
                        {showChannel
                          ? `${networkName} ${channel}`
                          : networkName}
                      </div>
                    </div>
                  </div>

                  {tokenAmount && tokenPrice && (
                    <div className="flex flex-col text-right">
                      <p className="subtitle1">{tokenAmount}</p>
                      <span className="subtitle2 text-osmoverse-400">
                        {tokenPrice}
                      </span>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
});
