import { Transition } from "@headlessui/react";
import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import debounce from "debounce";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  Fragment,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";
import { useLatest } from "react-use";

import { RecommendedSwapDenoms } from "../../config";
import { useFilteredData, useWindowSize } from "../../hooks";
import { useConst } from "../../hooks/use-const";
import useDraggableScroll from "../../hooks/use-draggable-scroll";
import { useKeyActions } from "../../hooks/use-key-actions";
import { useStateRef } from "../../hooks/use-state-ref";
import { useWindowKeyActions } from "../../hooks/window/use-window-key-actions";
import { useStore } from "../../stores";
import { Icon } from "../assets";
import IconButton from "../buttons/icon-button";
import { SearchBox } from "../input";

function getJustDenom(coinDenom: string) {
  return coinDenom.split(" ").slice(0, 1).join(" ") ?? "";
}

function getCurrency(token: CoinPretty | AppCurrency) {
  return token instanceof CoinPretty ? token.currency : token;
}

const dataAttributeName = "data-token-id";

function getTokenItemId(uniqueId: string, index: number) {
  return `token-selector-item-${uniqueId}-${index}`;
}

function getTokenElement(uniqueId: string, index: number) {
  return document.querySelector(
    `[${dataAttributeName}=${getTokenItemId(uniqueId, index)}]`
  );
}

function getAllTokenElements() {
  return document.querySelectorAll(`[${dataAttributeName}]`);
}

export const TokenSelectDrawer: FunctionComponent<{
  isOpen: boolean;
  onClose?: () => void;
  onSelect?: (tokenDenom: string) => void;
  tokens: {
    token: CoinPretty | AppCurrency;
    chainName: string;
  }[];
}> = observer(
  ({
    isOpen,
    tokens: tokensProp,
    onClose: onCloseProp,
    onSelect: onSelectProp,
  }) => {
    const t = useTranslation();
    const { priceStore } = useStore();
    const { isMobile } = useWindowSize();
    const uniqueId = useConst(() => Math.random().toString(36).substring(2, 9));

    const [selectedIndex, setSelectedIndex, selectedIndexRef] = useStateRef(0);

    const [tokens, setTokens] = useState(tokensProp);
    const [isRequestingClose, setIsRequestingClose] = useState(false);

    // Only update tokens while not requesting to close
    useEffect(() => {
      if (isRequestingClose) return;
      setTokens(tokensProp);
    }, [isRequestingClose, tokensProp]);

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

    const searchTokensRef = useLatest(searchedTokens);

    const searchBoxRef = useRef<HTMLInputElement>(null);
    const quickSelectRef = useRef<HTMLDivElement>(null);

    const { onMouseDown: onMouseDownQuickSelect } =
      useDraggableScroll(quickSelectRef);

    const onClose = () => {
      setIsRequestingClose(true);
      setTokenSearch("");
      setSelectedIndex(0);
      onCloseProp?.();
    };

    const onSelect = (coinDenom: string) => {
      onSelectProp?.(coinDenom);
      onClose();
    };

    useWindowKeyActions({
      Escape: onClose,
    });

    const { handleKeyDown: containerKeyDown } = useKeyActions({
      ArrowDown: () => {
        setSelectedIndex((selectedIndex) =>
          selectedIndex === getAllTokenElements().length - 1
            ? 0
            : selectedIndex + 1
        );

        getTokenElement(uniqueId, selectedIndexRef.current)?.scrollIntoView({
          block: "nearest",
        });

        // Focus on search bar if user starts keyboard navigation
        searchBoxRef.current?.focus();
      },
      ArrowUp: () => {
        setSelectedIndex((selectedIndex) =>
          selectedIndex === 0
            ? getAllTokenElements().length - 1
            : selectedIndex - 1
        );

        getTokenElement(uniqueId, selectedIndexRef.current)?.scrollIntoView({
          block: "nearest",
        });

        // Focus on search bar if user starts keyboard navigation
        searchBoxRef.current?.focus();
      },
      Enter: () => {
        const token = searchTokensRef.current[selectedIndexRef.current]?.token;
        if (!token) return;
        const currency = getCurrency(token);
        const { coinDenom } = currency;

        onSelect(coinDenom);
      },
    });

    const { handleKeyDown: searchBarKeyDown } = useKeyActions({
      ArrowDown: (event) => {
        event.preventDefault();
      },
      ArrowUp: (event) => {
        event.preventDefault();
      },
    });

    const onSearch = debounce((nextValue: string) => {
      setTokenSearch(nextValue);
      setSelectedIndex(0);
    }, 200);

    const quickSelectTokens = tokens.filter(({ token }) => {
      const currency = getCurrency(token);

      const { coinDenom } = currency;
      const justDenom = getJustDenom(coinDenom);

      return RecommendedSwapDenoms.includes(justDenom);
    });

    return (
      <div onKeyDown={containerKeyDown}>
        <Transition
          as={Fragment}
          show={isOpen}
          enter="transition duration-300 ease-inOutBack"
          enterFrom="invisible opacity-0"
          enterTo="visible opacity-100"
          leave="transition duration-300 ease-inOutBack"
          leaveFrom="visible opacity-100"
          leaveTo="visible opacity-0"
        >
          <div
            onClick={() => onClose?.()}
            className="absolute inset-0 z-40 bg-osmoverse-1000/80"
          />
        </Transition>

        <Transition
          as={Fragment}
          show={isOpen}
          enter="transition duration-300 ease-inOutBack"
          enterFrom="invisible opacity-0 translate-y-[15%]"
          enterTo="visible opacity-100 translate-y-0"
          leave="transition duration-300 ease-inOutBack"
          leaveFrom="visible opacity-100 translate-y-0"
          leaveTo="visible opacity-0 translate-y-[15%]"
          afterEnter={() => searchBoxRef?.current?.focus()}
          afterLeave={() => setIsRequestingClose(false)}
        >
          <div className="absolute inset-0 z-50 mt-16 flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-osmoverse-800 pb-16">
            <div
              onClick={() => onClose()}
              className="relative flex items-center justify-center pt-8 pb-4"
            >
              <IconButton
                className="absolute left-4 w-fit py-0 text-osmoverse-400"
                mode="unstyled"
                size="unstyled"
                aria-label="Close"
                icon={<Icon id="chevron-left" width={16} height={16} />}
              />

              <h1 className="text-h6 font-h6">
                {t("components.selectToken.title")}
              </h1>
            </div>

            <div className="mb-2 shadow-[0_4px_8px_0_rgba(9,5,36,0.12)]">
              <div className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                <SearchBox
                  ref={searchBoxRef}
                  type="text"
                  className="!w-full"
                  placeholder={t("components.searchTokens")}
                  onInput={onSearch}
                  onKeyDown={searchBarKeyDown}
                  size={isMobile ? "medium" : "large"}
                />
              </div>

              <div className="mb-2 h-fit">
                <div
                  ref={quickSelectRef}
                  onMouseDown={onMouseDownQuickSelect}
                  className="no-scrollbar flex space-x-4 overflow-x-auto px-4"
                >
                  {quickSelectTokens.map(({ token }) => {
                    const currency = getCurrency(token);
                    const { coinDenom, coinImageUrl } = currency;
                    const justDenom = getJustDenom(coinDenom);

                    return (
                      <button
                        key={currency.coinDenom}
                        className={classNames(
                          "flex items-center space-x-3 rounded-lg border border-osmoverse-700 p-2",
                          "transition-colors duration-150 ease-out hover:bg-osmoverse-900",
                          "my-1 focus:bg-osmoverse-900"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(coinDenom);
                        }}
                      >
                        {coinImageUrl && (
                          <div className="h-[24px] w-[24px] rounded-full">
                            <Image
                              src={coinImageUrl}
                              alt="token icon"
                              width={24}
                              height={24}
                            />
                          </div>
                        )}
                        <p className="subtitle1">{justDenom}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col overflow-auto">
              {searchedTokens.map((t, index) => {
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
                    ? t.token
                        .hideDenom(true)
                        .maxDecimals(8)
                        .trim(true)
                        .locale(false)
                        .toString()
                    : undefined;
                const tokenPrice =
                  t.token instanceof CoinPretty
                    ? priceStore.calculatePrice(t.token)?.toString()
                    : undefined;

                return (
                  <button
                    key={currency.coinDenom}
                    className={classNames(
                      "flex cursor-pointer items-center justify-between py-2 px-5",
                      "transition-colors duration-150 ease-out",
                      {
                        "bg-osmoverse-900": selectedIndex === index,
                      }
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(coinDenom);
                      onClose();
                    }}
                    onMouseOver={() => setSelectedIndex(index)}
                    onFocus={() => setSelectedIndex(index)}
                    {...{
                      [dataAttributeName]: getTokenItemId(uniqueId, index),
                    }}
                  >
                    <div className="flex w-full items-center justify-between text-left">
                      <div className="flex items-center">
                        {coinImageUrl && (
                          <div className="mr-4 h-8 w-8 rounded-full">
                            <Image
                              src={coinImageUrl}
                              alt="token icon"
                              width={32}
                              height={32}
                            />
                          </div>
                        )}
                        <div>
                          <h6 className="button font-button text-white-full">
                            {justDenom}
                          </h6>
                          <div className="caption text-left font-medium text-osmoverse-400">
                            {showChannel
                              ? `${networkName} ${channel}`
                              : networkName}
                          </div>
                        </div>
                      </div>

                      {tokenAmount && tokenPrice && Number(tokenAmount) > 0 && (
                        <div className="flex flex-col text-right">
                          <p className="button">{tokenAmount}</p>
                          <span className="caption font-medium text-osmoverse-400">
                            {tokenPrice}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Transition>
      </div>
    );
  }
);
