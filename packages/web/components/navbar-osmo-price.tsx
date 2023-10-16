import { WalletStatus } from "@cosmos-kit/core";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { CoinsIcon } from "~/components/assets/coins-icon";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import { Button } from "~/components/buttons";
import { Sparkline } from "~/components/chart/sparkline";
import SkeletonLoader from "~/components/skeleton-loader";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useFeatureFlags,
  useTranslation,
} from "~/hooks";
import { FiatOnrampSelectionModal } from "~/modals";
import { useStore } from "~/stores";

/**
 * Get chart data.
 * @param prices - prices by hour
 */
function getChartData(prices: PricePretty[] = []) {
  /**
   * We are querying the 1H chart which returns a bar for each hour.
   * So we need to subtract length by 24 to get current day's data.
   *  */
  const chunkedPrices = [...prices]
    .splice(prices.length - 24)
    .map((price) => Number(price.toDec().toString()));

  return chunkedPrices;
}

const NavbarOsmoPrice = observer(() => {
  const { accountStore, priceStore, chainStore, assetsStore } = useStore();
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();
  const flags = useFeatureFlags();

  const {
    isOpen: isFiatOnrampSelectionOpen,
    onOpen: onOpenFiatOnrampSelection,
    onClose: onCloseFiatOnrampSelection,
  } = useDisclosure();

  const { nativeBalances } = assetsStore;

  const { chainId } = chainStore.osmosis;
  const wallet = accountStore.getWallet(chainId);

  const osmoCurrency = chainStore.osmosis.stakeCurrency;
  const osmoPrice = priceStore.calculatePrice(
    new CoinPretty(
      chainStore.osmosis.stakeCurrency,
      DecUtils.getTenExponentNInPrecisionRange(
        chainStore.osmosis.stakeCurrency.coinDecimals
      )
    )
  );

  if (!osmoPrice || !osmoCurrency) return null;

  return (
    <div className="flex flex-col gap-6 px-2">
      <div className="flex items-center justify-between px-2">
        <SkeletonLoader isLoaded={osmoPrice.isReady} className="min-w-[70px]">
          <div className="flex items-center gap-1">
            <div className="h-[20px] w-[20px]">
              <Image
                src={osmoCurrency.coinImageUrl!}
                alt="Osmo icon"
                width={20}
                height={20}
              />
            </div>

            <p className="mt-[3px]">
              {osmoPrice.fiatCurrency.symbol}
              {Number(osmoPrice.toDec().toString()).toFixed(2)}
            </p>
          </div>
        </SkeletonLoader>

        {flags.sidebarOsmoChangeAndChart && (
          <OsmoPriceAndChart isOsmoPriceReady={osmoPrice.isReady} />
        )}
      </div>

      {wallet?.walletStatus === WalletStatus.Connected && (
        <SkeletonLoader isLoaded={osmoPrice.isReady}>
          <Button
            mode="unstyled"
            className={classNames(
              "button group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full border-2 !border-osmoverse-700 !py-1 font-bold text-osmoverse-100 transition-all duration-300 ease-in-out",
              "hover:border-none hover:bg-gradient-positive hover:text-osmoverse-1000"
            )}
            onClick={() => onOpenFiatOnrampSelection()}
          >
            <CreditCardIcon
              isAnimated
              classes={{
                container: "z-10",
                backCard: "group-hover:stroke-[2]",
                frontCard: "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
              }}
            />{" "}
            <span className="z-10 mt-0.5 flex-shrink-0">{t("buyTokens")}</span>{" "}
            <CoinsIcon
              className={classNames(
                "invisible absolute top-0 -translate-y-full transform transition-transform ease-linear",
                "group-hover:visible group-hover:translate-y-[30%] group-hover:duration-[3s]"
              )}
            />
          </Button>
        </SkeletonLoader>
      )}

      <FiatOnrampSelectionModal
        isOpen={isFiatOnrampSelectionOpen}
        onRequestClose={onCloseFiatOnrampSelection}
        onSelectRamp={(ramp) => {
          if (ramp !== "transak") return;
          const tokenName = "OSMO";

          const cryptoBalance = nativeBalances.find(
            (coin) =>
              coin.balance.denom.toLowerCase() === tokenName.toLowerCase()
          );

          logEvent([
            EventName.Sidebar.buyOsmoClicked,
            {
              tokenName,
              tokenAmount: Number(
                (cryptoBalance?.fiatValue ?? cryptoBalance?.balance)
                  ?.maxDecimals(4)
                  .toString()
              ),
            },
          ]);
        }}
      />
    </div>
  );
});

const OsmoPriceAndChart: FunctionComponent<{ isOsmoPriceReady: boolean }> =
  observer(({ isOsmoPriceReady }) => {
    const { chainStore, queriesExternalStore } = useStore();

    const tokenChartQuery = queriesExternalStore.queryTokenHistoricalChart.get(
      chainStore.osmosis.stakeCurrency.coinDenom,
      60
    );
    const tokenDataQuery = queriesExternalStore.queryTokenData.get(
      chainStore.osmosis.stakeCurrency.coinDenom
    );

    return (
      <SkeletonLoader
        isLoaded={
          !tokenDataQuery.isFetching &&
          !tokenChartQuery.isFetching &&
          isOsmoPriceReady
        }
        className="flex min-h-[23px] min-w-[85px] items-center justify-end gap-1.5"
      >
        <Sparkline
          data={getChartData(tokenChartQuery?.getChartPrices)}
          width={25}
          height={24}
          lineWidth={2}
          color={
            tokenDataQuery.get24hrChange?.toDec().gte(new Dec(0))
              ? "#6BDEC9"
              : "#E91F4F"
          }
        />

        <p
          className={
            tokenDataQuery.get24hrChange?.toDec().gte(new Dec(0))
              ? "text-bullish-400"
              : "text-error"
          }
        >
          {tokenDataQuery.get24hrChange
            ?.maxDecimals(2)
            .inequalitySymbol(false)
            .toString()}
        </p>
      </SkeletonLoader>
    );
  });

export default NavbarOsmoPrice;
