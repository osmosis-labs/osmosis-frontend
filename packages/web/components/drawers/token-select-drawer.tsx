import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { Fragment, FunctionComponent, useRef, useState } from "react";
import { useLatest } from "react-use";

import { Icon } from "~/components/assets";
import { IconButton } from "~/components/buttons/icon-button";
import { SearchBox } from "~/components/input";
import { Tooltip } from "~/components/tooltip";
import { useTranslation, useWindowSize } from "~/hooks";
import { useKeyboardNavigation } from "~/hooks/use-keyboard-navigation";
import { SwapState } from "~/hooks/use-swap";
import { ActivateUnverifiedTokenConfirmation } from "~/modals";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { formatPretty } from "~/utils/formatter";

import { useDraggableScroll } from "../../hooks/use-draggable-scroll";
import { useWindowKeyActions } from "../../hooks/window/use-window-key-actions";
import { useStore } from "../../stores";
import { Intersection } from "../intersection";
import { Spinner } from "../loaders/spinner";

export const TokenSelectDrawer: FunctionComponent<{
  isOpen: boolean;
  onClose?: () => void;
  onSelect?: (tokenDenom: string) => void;
  showRecommendedTokens?: boolean;
  showSearchBox?: boolean;
  swapState: SwapState;
}> = observer(
  ({
    isOpen,
    swapState,
    onClose: onCloseProp,
    onSelect: onSelectProp,
    showSearchBox = true,
    showRecommendedTokens = true,
  }) => {
    const { t } = useTranslation();
    const { userSettings } = useStore();
    const { isMobile } = useWindowSize();

    const assets = swapState.selectableAssets;
    const assetsRef = useLatest(assets);
    const [confirmUnverifiedAssetDenom, setConfirmUnverifiedAssetDenom] =
      useState<string | null>(null);

    const showUnverifiedAssetsSetting =
      userSettings.getUserSettingById<UnverifiedAssetsState>(
        "unverified-assets"
      );
    const shouldShowUnverifiedAssets =
      showUnverifiedAssetsSetting?.state.showUnverifiedAssets;

    const searchBoxRef = useRef<HTMLInputElement>(null);
    const quickSelectRef = useRef<HTMLDivElement>(null);

    const { onMouseDown: onMouseDownQuickSelect } =
      useDraggableScroll(quickSelectRef);

    const onClose = () => {
      swapState.setAssetsQueryInput("");
      setKeyboardSelectedIndex(0);
      onCloseProp?.();
    };

    const onSelect = (coinDenom: string) => {
      onSelectProp?.(coinDenom);
      onClose();
    };

    const onClickAsset = (coinDenom: string) => {
      let isRecommended = false;
      const selectedAsset =
        assetsRef.current?.find((asset) => asset.coinDenom === coinDenom) ??
        swapState.recommendedAssets.find((asset) => {
          console.log(
            "Checking asset in recommendedAssets array:",
            asset.coinDenom
          );
          if (asset.coinDenom === coinDenom) {
            isRecommended = true;
            return true;
          }
          return false;
        });

      // shouldn't happen, but doing nothing is better
      if (!selectedAsset) return;

      if (
        !isRecommended &&
        !shouldShowUnverifiedAssets &&
        !selectedAsset.isVerified
      ) {
        return setConfirmUnverifiedAssetDenom(coinDenom);
      }

      onSelect(coinDenom);
    };

    useWindowKeyActions({
      Escape: onClose,
    });

    const {
      selectedIndex: keyboardSelectedIndex,
      setSelectedIndex: setKeyboardSelectedIndex,
      itemContainerKeyDown,
      searchBarKeyDown,
      setItemAttribute,
    } = useKeyboardNavigation({
      items: assets,
      onSelectItem: (asset) => onClickAsset(asset.coinDenom),
      searchBoxRef,
    });

    const onSearch = (nextValue: string) => {
      swapState.setAssetsQueryInput(nextValue);
      setKeyboardSelectedIndex(0);
    };

    const assetToActivate = assets.find(
      (asset) => asset.coinDenom === confirmUnverifiedAssetDenom
    );

    return (
      <div onKeyDown={itemContainerKeyDown}>
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
        >
          <div className="absolute inset-0 z-50 mt-16 flex h-full w-full flex-col overflow-hidden rounded-3xl bg-osmoverse-800 pb-16">
            <div
              onClick={() => onClose()}
              className="relative flex items-center justify-center pb-4 pt-8"
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
              {showSearchBox && (
                <div className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <SearchBox
                    ref={searchBoxRef}
                    className="!w-full"
                    placeholder={t("components.searchTokens")}
                    onInput={onSearch}
                    onKeyDown={searchBarKeyDown}
                    size={isMobile ? "medium" : "large"}
                  />
                </div>
              )}

              {showRecommendedTokens && (
                <div
                  data-testid="recommended-assets-container"
                  className="mb-2 h-fit"
                >
                  <div
                    ref={quickSelectRef}
                    onMouseDown={onMouseDownQuickSelect}
                    className="no-scrollbar flex space-x-4 overflow-x-auto px-4"
                  >
                    {swapState.recommendedAssets.map((asset) => {
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
                            onClickAsset(coinDenom);
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
              )}
            </div>

            {swapState.isLoadingSelectAssets ? (
              <Spinner className="m-auto" />
            ) : (
              <div className="flex flex-col overflow-auto">
                {assets.map(
                  (
                    {
                      coinDenom,
                      coinMinimalDenom,
                      coinImageUrl,
                      coinName,
                      amount,
                      usdValue,
                      isVerified,
                    },
                    index
                  ) => (
                    <button
                      key={coinMinimalDenom}
                      className={classNames(
                        "flex cursor-pointer items-center justify-between px-5 py-2",
                        "transition-colors duration-150 ease-out",
                        {
                          "bg-osmoverse-900": keyboardSelectedIndex === index,
                        }
                      )}
                      data-testid="token-select-asset"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClickAsset(coinDenom);
                      }}
                      onMouseOver={() => setKeyboardSelectedIndex(index)}
                      onFocus={() => setKeyboardSelectedIndex(index)}
                      {...setItemAttribute(index)}
                    >
                      <div
                        className={classNames(
                          "flex w-full items-center justify-between text-left",
                          {
                            "opacity-40":
                              !shouldShowUnverifiedAssets && !isVerified,
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
                          {!isVerified && shouldShowUnverifiedAssets && (
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

                        {amount &&
                          isVerified &&
                          usdValue &&
                          amount.toDec().isPositive() && (
                            <div className="flex flex-col text-right">
                              <p className="button">
                                {formatPretty(amount.hideDenom(true), {
                                  maxDecimals: 6,
                                })}
                              </p>
                              <span className="caption font-medium text-osmoverse-400">
                                {usdValue.toString()}
                              </span>
                            </div>
                          )}
                      </div>
                      {!shouldShowUnverifiedAssets && !isVerified && (
                        <p className="caption whitespace-nowrap text-wosmongton-200">
                          {t("components.selectToken.clickToActivate")}
                        </p>
                      )}
                    </button>
                  )
                )}
                <Intersection
                  onVisible={() => {
                    // If this element becomes visible at bottom of list, fetch next page
                    if (
                      !swapState.isFetchingNextPageAssets &&
                      swapState.hasNextPageAssets
                    ) {
                      swapState.fetchNextPageAssets();
                    }
                  }}
                />
              </div>
            )}
          </div>
        </Transition>
      </div>
    );
  }
);
