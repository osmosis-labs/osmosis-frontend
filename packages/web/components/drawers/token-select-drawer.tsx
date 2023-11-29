import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  Fragment,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLatest } from "react-use";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { SearchBox } from "~/components/input";
import { Tooltip } from "~/components/tooltip";
import { RecommendedSwapDenoms } from "~/config";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { SwapState } from "~/hooks/use-swap";
import { ActivateUnverifiedTokenConfirmation } from "~/modals";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { formatPretty } from "~/utils/formatter";

import { useConst } from "../../hooks/use-const";
import useDraggableScroll from "../../hooks/use-draggable-scroll";
import { useKeyActions } from "../../hooks/use-key-actions";
import { useStateRef } from "../../hooks/use-state-ref";
import { useWindowKeyActions } from "../../hooks/window/use-window-key-actions";
import { useStore } from "../../stores";
import Spinner from "../spinner";

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
  swapState: SwapState;
}> = observer(
  ({ isOpen, swapState, onClose: onCloseProp, onSelect: onSelectProp }) => {
    const { t } = useTranslation();
    const { assetsStore, userSettings } = useStore();
    const { isMobile } = useWindowSize();
    const uniqueId = useConst(() => Math.random().toString(36).substring(2, 9));

    const [
      keyboardSelectedIndex,
      setKeyboardSelectedIndex,
      keyboardSelectedIndexRef,
    ] = useStateRef(0);

    const [assets, setAssets] = useState(swapState.selectableAssets);
    const [isRequestingClose, setIsRequestingClose] = useState(false);
    const [confirmUnverifiedAssetDenom, setConfirmUnverifiedAssetDenom] =
      useState<string | null>(null);

    const showUnverifiedAssetsSetting =
      userSettings.getUserSettingById<UnverifiedAssetsState>(
        "unverified-assets"
      );
    const shouldShowUnverifiedAssets =
      showUnverifiedAssetsSetting?.state.showUnverifiedAssets;

    // Only update tokens while not requesting to close
    useEffect(() => {
      if (isRequestingClose) return;
      setAssets(swapState.selectableAssets);
    }, [isRequestingClose, swapState.selectableAssets]);

    const assetsRef = useLatest(assets);

    const searchBoxRef = useRef<HTMLInputElement>(null);
    const quickSelectRef = useRef<HTMLDivElement>(null);

    const { onMouseDown: onMouseDownQuickSelect } =
      useDraggableScroll(quickSelectRef);

    const onClose = () => {
      setIsRequestingClose(true);
      swapState.setAssetsQueryInput("");
      setKeyboardSelectedIndex(0);
      onCloseProp?.();
    };

    const onSelect = (coinDenom: string) => {
      onSelectProp?.(coinDenom);
      onClose();
    };

    const onClickCoin = (coinDenom: string) => {
      if (
        !shouldShowUnverifiedAssets &&
        !assetsStore.isVerifiedAsset(coinDenom)
      ) {
        return setConfirmUnverifiedAssetDenom(coinDenom);
      }

      onSelect(coinDenom);
    };

    useWindowKeyActions({
      Escape: onClose,
    });

    const { handleKeyDown: containerKeyDown } = useKeyActions({
      ArrowDown: () => {
        setKeyboardSelectedIndex((selectedIndex) =>
          selectedIndex === getAllTokenElements().length - 1
            ? 0
            : selectedIndex + 1
        );

        getTokenElement(
          uniqueId,
          keyboardSelectedIndexRef.current
        )?.scrollIntoView({
          block: "nearest",
        });

        // Focus on search bar if user starts keyboard navigation
        searchBoxRef.current?.focus();
      },
      ArrowUp: () => {
        setKeyboardSelectedIndex((selectedIndex) =>
          selectedIndex === 0
            ? getAllTokenElements().length - 1
            : selectedIndex - 1
        );

        getTokenElement(
          uniqueId,
          keyboardSelectedIndexRef.current
        )?.scrollIntoView({
          block: "nearest",
        });

        // Focus on search bar if user starts keyboard navigation
        searchBoxRef.current?.focus();
      },
      Enter: () => {
        const asset = assetsRef.current[keyboardSelectedIndexRef.current];
        if (!asset) return;
        const { coinDenom } = asset;

        onClickCoin(coinDenom);
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

    const onSearch = (nextValue: string) => {
      swapState.setAssetsQueryInput(nextValue);
      setKeyboardSelectedIndex(0);
    };

    const quickSelectAssets = assets.filter(({ coinDenom }) => {
      return RecommendedSwapDenoms.includes(coinDenom);
    });

    const assetToActivate = assets.find(
      (asset) => asset.coinDenom === confirmUnverifiedAssetDenom
    );

    // Check if scrolled to bottom of token list
    const tokenScrollRef = useRef(null);
    const checkScrollBottom = () => {
      if (!tokenScrollRef.current) return false;
      const { scrollTop, scrollHeight, clientHeight } = tokenScrollRef.current;
      return scrollTop + clientHeight >= scrollHeight;
    };

    return (
      <div onKeyDown={containerKeyDown}>
        <ActivateUnverifiedTokenConfirmation
          coinDenom={assetToActivate?.coinDenom}
          coinImageUrl={assetToActivate?.coinImageUrl}
          isOpen={Boolean(confirmUnverifiedAssetDenom)}
          onConfirm={() => {
            if (!confirmUnverifiedAssetDenom) return;
            showUnverifiedAssetsSetting?.setState({
              showUnverifiedAssets: true,
            });
            onSelect(confirmUnverifiedAssetDenom);
          }}
          onRequestClose={() => {
            setConfirmUnverifiedAssetDenom(null);
          }}
        />

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
          <div className="absolute inset-0 z-50 mt-16 flex h-full w-full flex-col overflow-hidden rounded-3xl bg-osmoverse-800 pb-16">
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
                  {quickSelectAssets.map((asset) => {
                    const { coinDenom, coinImageUrl } = asset;

                    return (
                      <button
                        key={asset.coinDenom}
                        className={classNames(
                          "flex items-center space-x-3 rounded-lg border border-osmoverse-700 p-2",
                          "transition-colors duration-150 ease-out hover:bg-osmoverse-900",
                          "my-1 focus:bg-osmoverse-900"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClickCoin(coinDenom);
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
                        <p className="subtitle1">{coinDenom}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {swapState.isLoadingSelectAssets ? (
              <Spinner className="m-auto" />
            ) : (
              <div
                ref={tokenScrollRef}
                className="flex flex-col overflow-auto"
                onScroll={() => {
                  if (
                    checkScrollBottom() &&
                    !swapState.isFetchingNextPageAssets &&
                    swapState.hasNextPageAssets
                  ) {
                    swapState.fetchNextPageAssets();
                  }
                }}
              >
                {assets.map((asset, index) => {
                  const {
                    coinDenom,
                    coinMinimalDenom,
                    coinImageUrl,
                    coinName,
                    amount,
                    usdValue,
                  } = asset;

                  return (
                    <button
                      key={coinMinimalDenom}
                      className={classNames(
                        "flex cursor-pointer items-center justify-between py-2 px-5",
                        "transition-colors duration-150 ease-out",
                        {
                          "bg-osmoverse-900": keyboardSelectedIndex === index,
                        }
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClickCoin?.(coinDenom);
                      }}
                      onMouseOver={() => setKeyboardSelectedIndex(index)}
                      onFocus={() => setKeyboardSelectedIndex(index)}
                      {...{
                        [dataAttributeName]: getTokenItemId(uniqueId, index),
                      }}
                    >
                      <div
                        className={classNames(
                          "flex w-full items-center justify-between text-left",
                          {
                            "opacity-40":
                              !shouldShowUnverifiedAssets && !asset.isVerified,
                          }
                        )}
                      >
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
                          <div className="mr-4">
                            <h6 className="button font-button text-white-full">
                              {coinDenom}
                            </h6>
                            <div className="caption text-left font-medium text-osmoverse-400">
                              {coinName}
                            </div>
                          </div>
                          {!asset.isVerified && shouldShowUnverifiedAssets && (
                            <Tooltip
                              content={t(
                                "components.selectToken.unverifiedAsset"
                              )}
                            >
                              <Icon
                                id="alert-triangle"
                                className="h-5 w-5 text-osmoverse-400"
                              />
                            </Tooltip>
                          )}
                        </div>

                        {amount && usdValue && Number(amount) > 0 && (
                          <div className="flex flex-col text-right">
                            <p className="button">
                              {formatPretty(amount.hideDenom(true))}
                            </p>
                            <span className="caption font-medium text-osmoverse-400">
                              {usdValue.toString()}
                            </span>
                          </div>
                        )}
                      </div>
                      {!shouldShowUnverifiedAssets && !asset.isVerified && (
                        <p className="caption whitespace-nowrap text-wosmongton-200">
                          {t("components.selectToken.clickToActivate")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Transition>
      </div>
    );
  }
);
