import Image from "next/image";
import { AppCurrency, IBCCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { Fragment, FunctionComponent, useRef } from "react";
import { useTranslation } from "react-multi-lang";
import { SearchBox } from "../input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useFilteredData } from "../../hooks";
import debounce from "debounce";
import { useWindowKeyActions } from "../../hooks/window/use-window-key-actions";
import { RecommendedSwapDenoms } from "../../config";
import useDraggableScroll from "../../hooks/use-draggable-scroll";
import { Transition } from "@headlessui/react";
import { useKeyActions } from "../../hooks/use-key-actions";
import { useStateRef } from "../../hooks/use-state-ref";
import useLatest from "../../hooks/use-latest";

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
}> = observer(
  ({ isOpen, tokens, onClose: onCloseProp, onSelect: onSelectProp }) => {
    const t = useTranslation();
    const { priceStore } = useStore();

    const [selectedIndex, setSelectedIndex, selectedIndexRef] = useStateRef(0);

    const tokenItemsRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const searchBoxRef = useRef<HTMLInputElement>(null);

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

    const quickSelectRef = useRef<HTMLDivElement>(null);

    const { onMouseDown: onMouseDownQuickSelect } =
      useDraggableScroll(quickSelectRef);

    const onClose = () => {
      setTokenSearch("");
      tokenItemsRefs.current = [];
      setSelectedIndex(0);
      onCloseProp?.();
    };

    const onSelect = (coinDenom: string) => {
      onSelectProp?.(coinDenom);
      onClose?.();
    };

    useWindowKeyActions({
      Escape: () => {
        onClose?.();
      },
    });

    const { handleKeyDown: containerKeyDown } = useKeyActions({
      ArrowDown: () => {
        setSelectedIndex((selectedIndex) =>
          selectedIndex === tokenItemsRefs.current.length - 1
            ? 0
            : selectedIndex + 1
        );

        tokenItemsRefs.current[selectedIndexRef.current]?.scrollIntoView({
          block: "nearest",
        });

        // Focus on search bar if user starts keyboard navigation
        searchBoxRef.current?.focus();
      },
      ArrowUp: () => {
        setSelectedIndex((selectedIndex) =>
          selectedIndex === 0
            ? tokenItemsRefs.current.length - 1
            : selectedIndex - 1
        );

        tokenItemsRefs.current[selectedIndexRef.current]?.scrollIntoView({
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
      tokenItemsRefs.current = [];
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
            className="absolute inset-0 z-40 bg-osmoverse-1000/40"
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
        >
          <div className="bg-osmoverse-800 w-full h-full rounded-[24px] absolute z-50 flex flex-col mt-16 inset-0">
            <div className="relative flex justify-center pt-8 pb-4">
              <button className="absolute left-4" onClick={() => onClose()}>
                <Image
                  src="/icons/left.svg"
                  alt="Close"
                  width={24}
                  height={24}
                />
              </button>

              <h1 className="text-h6">{t("components.selectToken.title")}</h1>
            </div>

            <div className="shadow-[0_4px_8px_0_rgba(9,5,36,0.12)]">
              <div
                className="px-4 pt-4 pb-3"
                onClick={(e) => e.stopPropagation()}
              >
                <SearchBox
                  ref={searchBoxRef}
                  type="text"
                  className="!w-full"
                  placeholder={t("components.searchTokens")}
                  onInput={onSearch}
                  onKeyDown={searchBarKeyDown}
                />
              </div>

              <div className="mb-2 h-fit">
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
                          "transition-colors duration-150 ease-out hover:bg-osmoverse-900",
                          "focus:bg-osmoverse-900 my-1"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(coinDenom);
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
                    ? t.token.hideDenom(true).trim(true).toString()
                    : undefined;
                const tokenPrice =
                  t.token instanceof CoinPretty
                    ? priceStore.calculatePrice(t.token)?.toString()
                    : undefined;

                return (
                  <button
                    key={currency.coinDenom}
                    className={classNames(
                      "flex justify-between items-center py-2 px-5 cursor-pointer",
                      "transition-colors duration-150 ease-out",
                      {
                        "bg-osmoverse-900": selectedIndex === index,
                      }
                    )}
                    ref={(el) => {
                      if (el === null) return;
                      tokenItemsRefs.current[index] = el;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(coinDenom);
                      onClose();
                    }}
                    onMouseOver={() => setSelectedIndex(index)}
                    onFocus={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center justify-between w-full text-left">
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
