import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useMemo, useState } from "react";

import { TokenSelectDrawerLimit } from "~/components/drawers/token-select-drawer-limit";
import { Disableable } from "~/components/types";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useWindowSize } from "~/hooks";
import { useCoinPrice } from "~/hooks/queries/assets/use-coin-price";
import { useSwapAsset } from "~/hooks/use-swap";
import { formatPretty } from "~/utils/formatter";

export interface TokenSelectLimitProps {
  dropdownOpen?: boolean;
  setDropdownOpen?: (value: boolean) => void;
  // TODO: Better typing
  selectableAssets: ReturnType<typeof useSwapAsset>["asset"][];
  selectedToken: ReturnType<typeof useSwapAsset>["asset"] &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  paymentToken: ReturnType<typeof useSwapAsset>["asset"] &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  paymentBalance: CoinPretty;
  onTokenSelect: (tokenDenom: string) => void;
  canSelectTokens?: boolean;
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
    selectedToken,
    paymentToken,
    paymentBalance,
    disabled,
  }) => {
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const { logEvent } = useAmplitudeAnalytics();

    // parent overrideable state
    const [isSelectOpenLocal, setIsSelectOpenLocal] = useState(false);
    const isSelectOpen =
      dropdownOpen === undefined ? isSelectOpenLocal : dropdownOpen;
    const setIsSelectOpen =
      setDropdownOpen === undefined ? setIsSelectOpenLocal : setDropdownOpen;

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

    const { price: paymentCoinPrice, isLoading: isLoadingPaymentPrice } =
      useCoinPrice(paymentBalance);

    const paymentFiatBalance = useMemo(
      () =>
        !isLoadingPaymentPrice && paymentCoinPrice
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              paymentCoinPrice.mul(paymentBalance)
            )
          : new PricePretty(DEFAULT_VS_CURRENCY, 0),
      [paymentCoinPrice, paymentBalance, isLoadingPaymentPrice]
    );

    return (
      <div>
        <div className="align-center relative z-10 flex flex-row place-content-between items-center rounded-xl bg-osmoverse-850 py-5 px-3 md:justify-start">
          {selectedToken && (
            <div
              className={classNames(
                "flex items-center gap-2 text-left transition-opacity",
                tokenSelectionAvailable ? "cursor-pointer" : "cursor-default",
                {
                  "opacity-40": disabled,
                }
              )}
            >
              {selectedToken.coinImageUrl && (
                <div className="mr-1 h-[50px] w-[50px] shrink-0 rounded-full md:h-7 md:w-7">
                  <Image
                    src={selectedToken.coinImageUrl}
                    alt="token icon"
                    width={isMobile ? 30 : 50}
                    height={isMobile ? 30 : 50}
                    priority
                  />
                </div>
              )}
              <div className="flex flex-row">
                <div className="mr-2 flex items-center">
                  {isMobile || selectedToken.coinName.length > 6 ? (
                    <span className="text-h6">{selectedToken.coinName}</span>
                  ) : (
                    <h6>{selectedToken.coinName}</h6>
                  )}
                  <span className="md:caption ml-2 w-32 truncate text-h6 text-osmoverse-400">
                    {selectedToken.coinDenom}
                  </span>
                </div>
              </div>
            </div>
          )}
          {tokenSelectionAvailable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (tokenSelectionAvailable) {
                  setIsSelectOpen(!isSelectOpen);
                }
              }}
              className="h-[32px] rounded-2xl bg-osmoverse-800 py-1 px-3 text-body2 text-wosmongton-200"
            >
              Change
            </button>
          )}
        </div>
        <div className="align-center relative z-0 mt-[-20px] flex flex-row place-content-between items-center rounded-xl bg-osmoverse-1000 py-5 px-3 pt-10 md:justify-start">
          {paymentToken && (
            <div
              className={classNames(
                "flex items-center gap-2 text-left transition-opacity",
                tokenSelectionAvailable ? "cursor-pointer" : "cursor-default",
                {
                  "opacity-40": disabled,
                }
              )}
            >
              <span className="subtitle1 text-osmoverse-300">Pay with</span>
              {paymentToken.coinImageUrl && (
                <div className="h-[24px] w-[24px] shrink-0 rounded-full md:h-7 md:w-7">
                  <Image
                    src={paymentToken.coinImageUrl}
                    alt="token icon"
                    width={24}
                    height={24}
                    priority
                  />
                </div>
              )}
              <div className="flex flex-row">
                <span className="md:caption subtitle1 w-32 truncate">
                  {paymentToken.coinDenom}
                </span>
              </div>
            </div>
          )}
          {!isLoadingPaymentPrice && paymentFiatBalance ? (
            <div className="flex text-body1 text-osmoverse-300">
              {formatPretty(paymentFiatBalance)} available
            </div>
          ) : (
            <div />
          )}
        </div>
        <div className="pt-16">
          <TokenSelectDrawerLimit
            isOpen={isSelectOpen}
            onClose={() => setIsSelectOpen(false)}
            onSelect={onSelect}
            showSearchBox={true}
            showRecommendedTokens={false}
            selectableAssets={preSortedTokens}
          />
        </div>
      </div>
    );
  }
);
