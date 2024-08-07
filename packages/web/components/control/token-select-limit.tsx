import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useMemo } from "react";

import { Icon } from "~/components/assets";
import { PriceSelector } from "~/components/swap-tool/price-selector";
import { Disableable } from "~/components/types";
import { EventName, EventPage } from "~/config";
import { useAmplitudeAnalytics, useTranslation, useWindowSize } from "~/hooks";
import { OrderDirection } from "~/hooks/limit-orders";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useControllableState } from "~/hooks/use-controllable-state";
import type { SwapAsset } from "~/hooks/use-swap";
import { TokenSelectModalLimit } from "~/modals/token-select-modal-limit";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

export interface TokenSelectLimitProps {
  dropdownOpen?: boolean;
  setDropdownOpen?: (value: boolean) => void;
  selectableAssets: SwapAsset[];
  baseAsset: SwapAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  quoteAsset: SwapAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  baseBalance: CoinPretty;
  quoteBalance: CoinPretty;
  onTokenSelect: (tokenDenom: string) => void;
  canSelectTokens?: boolean;
  orderDirection: OrderDirection;
  page?: EventPage;
}

export const TokenSelectLimit: FunctionComponent<
  TokenSelectLimitProps & Disableable
> = observer(
  ({
    dropdownOpen,
    setDropdownOpen,
    selectableAssets,
    onTokenSelect,
    canSelectTokens = true,
    baseAsset,
    baseBalance,
    disabled,
    orderDirection,
    page = "Swap Page",
  }) => {
    const { t } = useTranslation();
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const { logEvent } = useAmplitudeAnalytics();
    const { accountStore } = useStore();

    const isWalletConnected = accountStore.getWallet(
      accountStore.osmosisChainId
    )?.isWalletConnected;

    // parent overrideable state
    const [isSelectOpen, setIsSelectOpen] = useControllableState({
      defaultValue: false,
      onChange: setDropdownOpen,
      value: dropdownOpen,
    });

    const preSortedTokens = selectableAssets;

    const tokenSelectionAvailable =
      canSelectTokens && preSortedTokens.length >= 1;

    const onSelect = (tokenDenom: string) => {
      logEvent([
        EventName.Swap.dropdownAssetSelected,
        {
          tokenName: tokenDenom,
          isOnHome: router.pathname === "/",
          page,
        },
      ]);
      onTokenSelect(tokenDenom);
    };

    const { price: baseCoinPrice, isLoading: isLoadingBasePrice } = usePrice({
      coinMinimalDenom: baseAsset.coinMinimalDenom,
    });

    const baseFiatBalance = useMemo(
      () =>
        !isLoadingBasePrice && baseCoinPrice && baseBalance
          ? new PricePretty(DEFAULT_VS_CURRENCY, baseCoinPrice.mul(baseBalance))
          : new PricePretty(DEFAULT_VS_CURRENCY, 0),
      [baseCoinPrice, baseBalance, isLoadingBasePrice]
    );

    const showBaseBalance = orderDirection === "ask" && isWalletConnected;

    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (tokenSelectionAvailable) {
              setIsSelectOpen(!isSelectOpen);
            }
          }}
          className="flex items-center justify-between rounded-t-2xl bg-osmoverse-850 py-3 px-5 text-left"
        >
          {baseAsset && (
            <div
              className={classNames(
                "flex items-center gap-4 transition-opacity",
                tokenSelectionAvailable ? "cursor-pointer" : "cursor-default",
                {
                  "opacity-40": disabled,
                }
              )}
            >
              {baseAsset.coinImageUrl && (
                <div className="h-12 w-12 shrink-0 rounded-full md:h-7 md:w-7">
                  <Image
                    src={baseAsset.coinImageUrl}
                    alt="token icon"
                    width={isMobile ? 30 : 48}
                    height={isMobile ? 30 : 48}
                    priority
                  />
                </div>
              )}
              <div className="flex flex-col">
                <h6 className="inline-flex items-center gap-2">
                  <span className="max-w-[150px] truncate md:max-w-[100px]">
                    {baseAsset.coinName}
                  </span>
                  <span className="md:caption truncate text-left text-osmoverse-400">
                    {baseAsset.coinDenom}
                  </span>
                </h6>
              </div>
            </div>
          )}

          <div className="flex h-6 items-center justify-center">
            {showBaseBalance && (
              <div className="flex text-body1 text-osmoverse-300">
                {formatPretty(baseFiatBalance)}{" "}
                {t("addLiquidity.available").toLowerCase()}
              </div>
            )}
            {tokenSelectionAvailable && (
              <div className="ml-2 flex h-6 w-6 items-center justify-center">
                <Icon
                  id="chevron-down"
                  className="h-[7px] w-3 text-osmoverse-300"
                />
              </div>
            )}
          </div>
        </button>
        <PriceSelector />
        <TokenSelectModalLimit
          headerTitle={
            orderDirection === "ask"
              ? t("limitOrders.selectAnAssetTo.sell")
              : t("limitOrders.selectAnAssetTo.buy")
          }
          isOpen={isSelectOpen}
          onClose={() => setIsSelectOpen(false)}
          onSelect={onSelect}
          showSearchBox
          selectableAssets={preSortedTokens}
        />
      </div>
    );
  }
);
