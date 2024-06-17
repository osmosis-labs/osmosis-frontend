import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useMemo } from "react";

import { Icon } from "~/components/assets";
import { TokenSelectModalLimit } from "~/components/modals/token-select-modal-limit";
import { PriceSelector } from "~/components/swap-tool/price-selector";
import { Disableable } from "~/components/types";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useWindowSize } from "~/hooks";
import { OrderDirection } from "~/hooks/limit-orders";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useControllableState } from "~/hooks/use-controllable-state";
import type { SwapAsset } from "~/hooks/use-swap";
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
    quoteAsset,
    baseBalance,
    quoteBalance,
    disabled,
    orderDirection,
  }) => {
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const { logEvent } = useAmplitudeAnalytics();

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
          page: "Swap Page",
        },
      ]);
      onTokenSelect(tokenDenom);
    };

    const { price: baseCoinPrice, isLoading: isLoadingBasePrice } = usePrice({
      coinMinimalDenom: baseAsset.coinMinimalDenom,
    });
    const { price: quoteCoinPrice, isLoading: isLoadingQuotePrice } = usePrice({
      coinMinimalDenom: quoteAsset.coinMinimalDenom,
    });
    const baseFiatBalance = useMemo(
      () =>
        !isLoadingBasePrice && baseCoinPrice && baseBalance
          ? new PricePretty(DEFAULT_VS_CURRENCY, baseCoinPrice.mul(baseBalance))
          : new PricePretty(DEFAULT_VS_CURRENCY, 0),
      [baseCoinPrice, baseBalance, isLoadingBasePrice]
    );

    const quoteFiatBalance = useMemo(
      () =>
        !isLoadingQuotePrice && quoteCoinPrice && quoteBalance
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              quoteCoinPrice.mul(quoteBalance)
            )
          : new PricePretty(DEFAULT_VS_CURRENCY, 0),
      [quoteCoinPrice, quoteBalance, isLoadingQuotePrice]
    );

    const showBaseBalance = useMemo(
      () =>
        orderDirection === OrderDirection.Ask &&
        !baseFiatBalance.toDec().isZero(),
      [orderDirection, baseFiatBalance]
    );
    const showQuoteBalance = useMemo(
      () =>
        orderDirection === OrderDirection.Bid &&
        !quoteFiatBalance.toDec().isZero(),
      [orderDirection, quoteFiatBalance]
    );

    return (
      <div className="flex flex-col">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (tokenSelectionAvailable) {
              setIsSelectOpen(!isSelectOpen);
            }
          }}
          className="flex items-center justify-between rounded-t-xl bg-osmoverse-850 py-3 px-5 md:justify-start"
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
                  <span>{baseAsset.coinName}</span>
                  <span className="md:caption w-32 truncate text-left text-osmoverse-400">
                    {baseAsset.coinDenom}
                  </span>
                </h6>
              </div>
            </div>
          )}

          <div className="flex h-6 items-center justify-center">
            {showBaseBalance && (
              <div className="flex text-body1 text-osmoverse-300">
                {formatPretty(baseFiatBalance)} available
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
        <PriceSelector
          showQuoteBalance={showQuoteBalance}
          tokenSelectionAvailable={tokenSelectionAvailable}
          disabled={disabled}
        />
        <TokenSelectModalLimit
          isOpen={isSelectOpen}
          onClose={() => setIsSelectOpen(false)}
          onSelect={onSelect}
          showSearchBox
          showRecommendedTokens
          selectableAssets={preSortedTokens}
        />
      </div>
    );
  }
);
