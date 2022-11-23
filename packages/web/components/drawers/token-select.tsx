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
      console.log("escape");
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
    <div>
      <div
        onClick={() => onClose?.()}
        className="absolute z-40 bg-osmoverse-1000/40 inset-0"
      />
      <div
        className={classNames(
          "bg-osmoverse-800 w-full h-full rounded-[18px] absolute z-50 flex flex-col mt-16",
          isOpen && "inset-0"
        )}
      >
        <div className="pt-8 text-center">
          {/** Pending Translation */}
          <h1 className="text-h6">Select a token</h1>
        </div>

        <div className="p-4" onClick={(e) => e.stopPropagation()}>
          <SearchBox
            autoFocus
            type="text"
            className="!w-full"
            placeholder={t("components.searchTokens")}
            onInput={debounce((nextValue) => setTokenSearch(nextValue), 200)}
          />
        </div>

        <div
          ref={quickSelectRef}
          onMouseDown={onMouseDownQuickSelect}
          className="flex px-4 py-2 space-x-4 overflow-x-auto h-full"
        >
          {quickSelectTokens.map(({ token }) => {
            const currency = getCurrency(token);
            const { coinDenom, coinImageUrl } = currency;
            const justDenom = getJustDenom(coinDenom);

            return (
              <button
                key={currency.coinDenom}
                className="flex space-x-1.5 border border-osmoverse-700 rounded-lg p-2 hover:bg-osmoverse-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(coinDenom);
                  onClose?.();
                }}
              >
                {coinImageUrl && (
                  <div className="w-[23px] h-[23px] rounded-full">
                    <Image
                      src={coinImageUrl}
                      alt="token icon"
                      width={23}
                      height={23}
                    />
                  </div>
                )}
                <p>{justDenom}</p>
              </button>
            );
          })}
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
                className="flex justify-between items-center rounded-2xl py-2.5 px-4 my-1 hover:bg-osmoverse-900 cursor-pointer mx-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(coinDenom);
                  onClose();
                }}
              >
                <button className="flex items-center justify-between text-left w-full">
                  <div className="flex items-center">
                    {coinImageUrl && (
                      <div className="w-8 h-8 rounded-full mr-4">
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
                      <div className="text-osmoverse-400 text-left md:caption font-semibold">
                        {showChannel
                          ? `${networkName} ${channel}`
                          : networkName}
                      </div>
                    </div>
                  </div>
                </button>
                {tokenAmount && tokenPrice && (
                  <div className="flex flex-col text-right">
                    <h6
                      className={classNames({
                        "md:text-subtitle2 md:font-subtitle2":
                          tokenAmount.length > 10,
                      })}
                    >
                      {tokenAmount}
                    </h6>
                    <span className="subtitle1 text-osmoverse-400">
                      {tokenPrice}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});
