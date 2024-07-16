import { PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { FunctionComponent, useRef, useState } from "react";
import { useLatest } from "react-use";

import { Icon } from "~/components/assets";
import { Intersection } from "~/components/intersection";
import { Spinner } from "~/components/loaders";
import {
  useFilteredData,
  useTranslation,
  useWalletSelect,
  useWindowKeyActions,
} from "~/hooks";
import { useConst } from "~/hooks/use-const";
import { useDraggableScroll } from "~/hooks/use-draggable-scroll";
import { useKeyActions } from "~/hooks/use-key-actions";
import { useStateRef } from "~/hooks/use-state-ref";
import { SwapAsset, useRecommendedAssets } from "~/hooks/use-swap";
import { ActivateUnverifiedTokenConfirmation, ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { formatPretty } from "~/utils/formatter";

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

export const TokenSelectModalLimit: FunctionComponent<{
  isOpen: boolean;
  onClose?: () => void;
  onSelect?: (tokenDenom: string) => void;
  showRecommendedTokens?: boolean;
  showSearchBox?: boolean;
  selectableAssets: SwapAsset[];
  isLoadingSelectAssets?: boolean;
  isFetchingNextPageAssets?: boolean;
  hasNextPageAssets?: boolean;
  fetchNextPageAssets?: () => void;
  headerTitle: string;
  hideBalances?: boolean;
}> = observer(
  ({
    isOpen,
    onClose: onCloseProp,
    onSelect: onSelectProp,
    showSearchBox = true,
    showRecommendedTokens = true,
    selectableAssets,
    isLoadingSelectAssets = false,
    isFetchingNextPageAssets = false,
    hasNextPageAssets = false,
    fetchNextPageAssets = () => {},
    headerTitle,
    hideBalances,
  }) => {
    const { t } = useTranslation();

    const { userSettings, accountStore } = useStore();
    const { onOpenWalletSelect } = useWalletSelect();
    const uniqueId = useConst(() => Math.random().toString(36).substring(2, 9));
    const recommendedAssets = useRecommendedAssets();

    const [tab] = useQueryState("tab");

    const isWalletConnected = accountStore.getWallet(
      accountStore.osmosisChainId
    )?.isWalletConnected;

    const [
      keyboardSelectedIndex,
      setKeyboardSelectedIndex,
      keyboardSelectedIndexRef,
    ] = useStateRef(0);

    const [_isRequestingClose, setIsRequestingClose] = useState(false);
    const [confirmUnverifiedAssetDenom, setConfirmUnverifiedAssetDenom] =
      useState<string | null>(null);

    const showUnverifiedAssetsSetting =
      userSettings.getUserSettingById<UnverifiedAssetsState>(
        "unverified-assets"
      );
    const shouldShowUnverifiedAssets =
      showUnverifiedAssetsSetting?.state.showUnverifiedAssets;

    const assetsRef = useLatest(selectableAssets);

    const searchBoxRef = useRef<HTMLInputElement>(null);
    const quickSelectRef = useRef<HTMLDivElement>(null);

    const { onMouseDown: onMouseDownQuickSelect } =
      useDraggableScroll(quickSelectRef);

    const onClose = () => {
      setIsRequestingClose(true);
      setKeyboardSelectedIndex(0);
      onCloseProp?.();
    };

    const onSelect = (coinDenom: string) => {
      onSelectProp?.(coinDenom);
      onClose();
    };

    const onClickAsset = (coinDenom: string) => {
      let isRecommended = false;
      const selectedAsset = selectableAssets.find(
        (asset) => asset && asset.coinDenom === coinDenom
      );

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

        onClickAsset(coinDenom);
      },
    });

    // const { handleKeyDown: searchBarKeyDown } = useKeyActions({
    //   ArrowDown: (event) => {
    //     event.preventDefault();
    //   },
    //   ArrowUp: (event) => {
    //     event.preventDefault();
    //   },
    // });

    const [, setQuery, results] = useFilteredData(selectableAssets, [
      "coinDenom",
      "coinName",
    ]);

    const onSearch = (nextValue: string) => {
      setKeyboardSelectedIndex(0);
      setQuery(nextValue);
    };

    const assetToActivate = selectableAssets.find(
      (asset) => asset && asset.coinDenom === confirmUnverifiedAssetDenom
    );

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
        <ModalBase
          isOpen={isOpen}
          onRequestClose={onClose}
          hideCloseButton
          className="w-[512px] rounded-5xl !p-0"
        >
          <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-osmoverse-850">
            <div className="relative flex min-h-[80px] items-center justify-center p-4">
              <h6>{headerTitle}</h6>
              <button
                onClick={onClose}
                className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800"
              >
                <Icon id="thin-x" className="text-wosmongton-200" />
              </button>
            </div>
            {!isWalletConnected && (
              <div className="flex w-full items-center justify-center gap-1 pb-4">
                <button
                  onClick={() =>
                    onOpenWalletSelect({
                      walletOptions: [
                        {
                          walletType: "cosmos",
                          chainId: accountStore.osmosisChainId,
                        },
                      ],
                    })
                  }
                  className="body1 font-semibold text-wosmongton-300"
                >
                  {t("limitOrders.connectYourWallet")}
                </button>
                <p className="font-semibold">
                  {t("limitOrders.toSeeYourBalances")}
                </p>
              </div>
            )}
            <div className="flex flex-col">
              {showSearchBox && (
                <div className="px-8" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3 rounded-5xl bg-osmoverse-800 py-4 px-5">
                    <div className="flex h-6 w-6 items-center justify-center">
                      <Icon
                        id="search"
                        className="h-5 w-5 text-wosmongton-200"
                      />
                    </div>
                    <input
                      autoFocus
                      onChange={(e) => onSearch(e.target.value)}
                      placeholder={t("limitOrders.searchAssets")}
                      className="h-6 w-full bg-transparent text-base leading-6 placeholder:tracking-[0.5px] placeholder:text-osmoverse-500"
                    />
                  </div>
                </div>
              )}
              {tab === "buy" && showRecommendedTokens && (
                <div
                  ref={quickSelectRef}
                  onMouseDown={onMouseDownQuickSelect}
                  className="no-scrollbar flex gap-4 overflow-x-auto px-8 pt-3"
                >
                  {recommendedAssets.map(({ coinDenom, coinImageUrl }) => (
                    <button
                      key={coinDenom}
                      className="flex items-center gap-3 rounded-[40px] border border-osmoverse-700 py-2 pl-2 pr-3 transition-colors duration-150 ease-out hover:bg-osmoverse-900 focus:bg-osmoverse-900"
                      onClick={() => {
                        onClickAsset(coinDenom);
                      }}
                    >
                      {coinImageUrl && (
                        <div className="h-6 w-6 rounded-full">
                          <Image
                            src={coinImageUrl}
                            alt="token icon"
                            width={24}
                            height={24}
                          />
                        </div>
                      )}
                      <p className="font-semibold">{coinDenom}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoadingSelectAssets ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="no-scrollbar flex flex-col overflow-auto py-3 px-4">
                {/* TODO: fix typing */}
                {(results as any[]).map(
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
                  ) => {
                    return (
                      <button
                        key={coinMinimalDenom}
                        className={classNames(
                          "flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors duration-150 ease-out",
                          {
                            "bg-osmoverse-900": keyboardSelectedIndex === index,
                          }
                        )}
                        data-testid="token-select-asset"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClickAsset?.(coinDenom);
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
                                !shouldShowUnverifiedAssets && !isVerified,
                            }
                          )}
                        >
                          <div className="flex items-center gap-4">
                            {coinImageUrl && (
                              <div className="h-12 w-12 rounded-full">
                                <Image
                                  src={coinImageUrl}
                                  alt={`${coinDenom} icon`}
                                  width={48}
                                  height={48}
                                  className="rounded-full"
                                />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="subtitle1">{coinName}</span>
                              <span className="subtitle2 text-osmoverse-400">
                                {coinDenom}
                              </span>
                            </div>
                            {/* {!isVerified && shouldShowUnverifiedAssets && (
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
                            )} */}
                          </div>

                          {isWalletConnected && !hideBalances && (
                            <div className="flex flex-col items-end gap-1">
                              <p
                                className={classNames("text-osmoverse-400", {
                                  "text-white-full": usdValue,
                                })}
                              >
                                {formatPretty(
                                  usdValue ??
                                    new PricePretty(DEFAULT_VS_CURRENCY, 0)
                                )}
                              </p>
                              {amount && (
                                <span className="body2 text-osmoverse-300">
                                  {formatPretty(amount).split(" ")[0]}
                                </span>
                              )}
                              {/* <Link
                                href={"#"}
                                className="subtitle2 inline-flex items-center text-wosmongton-300"
                              >
                                2 balances
                                <div className="flex h-4 w-4 items-center justify-center">
                                  <Icon
                                    id="chevron-right"
                                    className="h-3 w-[7px]"
                                  />
                                </div>
                              </Link> */}
                            </div>
                          )}
                          {/* {amount &&
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
                            )} */}
                        </div>
                        {/* {!shouldShowUnverifiedAssets && !isVerified && (
                          <p className="caption whitespace-nowrap text-wosmongton-200">
                            {t("components.selectToken.clickToActivate")}
                          </p>
                        )} */}
                      </button>
                    );
                  }
                )}
                <Intersection
                  onVisible={() => {
                    // If this element becomes visible at bottom of list, fetch next page
                    if (!isFetchingNextPageAssets && hasNextPageAssets) {
                      fetchNextPageAssets();
                    }
                  }}
                />
              </div>
            )}
          </div>
        </ModalBase>
      </div>
    );
  }
);
