import { PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import { Intersection } from "~/components/intersection";
import { Spinner } from "~/components/loaders";
import {
  Breakpoint,
  useFilteredData,
  useTranslation,
  useWalletSelect,
  useWindowKeyActions,
  useWindowSize,
} from "~/hooks";
import { useDraggableScroll } from "~/hooks/use-draggable-scroll";
import { useKeyboardNavigation } from "~/hooks/use-keyboard-navigation";
import { SwapAsset, useRecommendedAssets } from "~/hooks/use-swap";
import { ActivateUnverifiedTokenConfirmation, ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { UnverifiedAssetsState } from "~/stores/user-settings";
import { formatFiatPrice, formatPretty } from "~/utils/formatter";

interface TokenSelectModalLimitProps {
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
  assetQueryInput?: string;
  setAssetQueryInput?: (input: string) => void;
}

export const TokenSelectModalLimit: FunctionComponent<TokenSelectModalLimitProps> =
  observer(
    ({
      isOpen,
      onClose: onCloseProp,
      onSelect: onSelectProp,
      showSearchBox = true,
      showRecommendedTokens,
      selectableAssets,
      isLoadingSelectAssets = false,
      isFetchingNextPageAssets = false,
      hasNextPageAssets = false,
      fetchNextPageAssets,
      headerTitle,
      hideBalances,
      setAssetQueryInput,
      assetQueryInput,
    }) => {
      const { t } = useTranslation();
      const { isMobile } = useWindowSize(Breakpoint.sm);
      const { userSettings, accountStore } = useStore();
      const { onOpenWalletSelect } = useWalletSelect();
      const recommendedAssets = useRecommendedAssets();

      const isWalletConnected = accountStore.getWallet(
        accountStore.osmosisChainId
      )?.isWalletConnected;

      const [_isRequestingClose, setIsRequestingClose] = useState(false);
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

      const onSelect = (coinDenom: string) => {
        onSelectProp?.(coinDenom);
        onClose();
      };

      const onClickAsset = (coinDenom: string) => {
        let isRecommended = false;
        const selectedAsset =
          selectableAssets.find((asset) => asset?.coinDenom === coinDenom) ??
          recommendedAssets.find((asset) => {
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

      const [filterValue, setQuery, results] = useFilteredData(
        selectableAssets,
        ["coinDenom", "coinName"]
      );

      const {
        selectedIndex: keyboardSelectedIndex,
        setSelectedIndex: setKeyboardSelectedIndex,
        itemContainerKeyDown,
        searchBarKeyDown,
        setItemAttribute,
      } = useKeyboardNavigation({
        items: results,
        onSelectItem: (item) => {
          if (item) {
            onSelect(item.coinDenom);
          }
        },
        searchBoxRef,
      });

      const onClose = () => {
        setIsRequestingClose(true);
        setKeyboardSelectedIndex(0);
        onCloseProp?.();
        setQuery("");
        if (setAssetQueryInput) setAssetQueryInput("");
      };

      useWindowKeyActions({
        Escape: onClose,
      });

      const searchValue = useMemo(
        () => (!!assetQueryInput ? assetQueryInput : filterValue),
        [assetQueryInput, filterValue]
      );

      const onSearch = useCallback(
        (nextValue: string) => {
          setKeyboardSelectedIndex(0);
          if (setAssetQueryInput) {
            setAssetQueryInput(nextValue);
          } else {
            setQuery(nextValue);
          }
        },
        [setAssetQueryInput, setKeyboardSelectedIndex, setQuery]
      );

      const assetToActivate = useMemo(
        () =>
          selectableAssets.find(
            (asset) => asset && asset.coinDenom === confirmUnverifiedAssetDenom
          ),
        [confirmUnverifiedAssetDenom, selectableAssets]
      );

      if (!isOpen) return;

      return (
        <div className="absolute" onKeyDown={itemContainerKeyDown}>
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
            className="!max-h-[90vh] w-[512px] self-start rounded-5xl !p-0 sm:!m-0 sm:h-full sm:!max-h-[100vh] sm:!rounded-none"
          >
            <div className="flex h-full w-full flex-col overflow-hidden bg-osmoverse-850">
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
                  <p className="font-semibold text-osmoverse-300">
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
                        ref={searchBoxRef}
                        autoFocus={!isMobile}
                        value={searchValue}
                        onKeyDown={searchBarKeyDown}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder={t("limitOrders.searchAssets")}
                        className="h-6 w-full bg-transparent text-base leading-6 placeholder:tracking-[0.5px] placeholder:text-osmoverse-500"
                      />
                    </div>
                  </div>
                )}
                {showRecommendedTokens && (
                  <div
                    ref={quickSelectRef}
                    onMouseDown={onMouseDownQuickSelect}
                    className="no-scrollbar flex gap-4 overflow-x-auto px-8 pt-3"
                  >
                    {recommendedAssets.map(({ coinDenom, coinImageUrl }) => {
                      return (
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
                      );
                    })}
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
                  {results.length > 0 ? (
                    (results as any[]).map(
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
                                "bg-osmoverse-900":
                                  keyboardSelectedIndex === index,
                              }
                            )}
                            data-testid="token-select-asset"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClickAsset?.(coinDenom);
                            }}
                            onMouseOver={() => setKeyboardSelectedIndex(index)}
                            onFocus={() => setKeyboardSelectedIndex(index)}
                            {...setItemAttribute(index)}
                          >
                            <div
                              className={classNames(
                                "flex w-full min-w-0 items-center justify-between text-left",
                                {
                                  "opacity-40":
                                    !shouldShowUnverifiedAssets && !isVerified,
                                }
                              )}
                            >
                              <div className="flex min-w-0 items-center gap-4">
                                {coinImageUrl && (
                                  <div className="h-12 w-12 shrink-0 rounded-full">
                                    <Image
                                      src={coinImageUrl}
                                      alt={`${coinDenom} icon`}
                                      width={48}
                                      height={48}
                                      className="rounded-full"
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col gap-1 overflow-hidden">
                                  <span className="subtitle1 truncate">
                                    {coinName}
                                  </span>
                                  <span className="body2 text-osmoverse-400">
                                    {coinDenom}
                                  </span>
                                </div>
                              </div>

                              {isWalletConnected && !hideBalances && (
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                  {usdValue && (
                                    <p
                                      className={classNames(
                                        "text-osmoverse-400",
                                        {
                                          "text-white-full": usdValue,
                                        }
                                      )}
                                    >
                                      {formatFiatPrice(
                                        usdValue ??
                                          new PricePretty(
                                            DEFAULT_VS_CURRENCY,
                                            0
                                          )
                                      )}
                                    </p>
                                  )}
                                  {amount && (
                                    <span className="body2 text-osmoverse-300">
                                      {amount
                                        ? formatPretty(amount).split(" ")[0]
                                        : "0"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      }
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-osmoverse-300">
                      <Icon
                        id="search"
                        width={32}
                        height={32}
                        className="text-osmoverse-700"
                      />
                      <span className="mt-6 text-h6 font-h6 text-white-high">
                        No results for "{searchValue}"
                      </span>
                      <span className="body1 pt-1">
                        Try adjusting your search query
                      </span>
                    </div>
                  )}
                  <Intersection
                    onVisible={() => {
                      // If this element becomes visible at bottom of list, fetch next page
                      if (!isFetchingNextPageAssets && hasNextPageAssets) {
                        fetchNextPageAssets?.();
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
