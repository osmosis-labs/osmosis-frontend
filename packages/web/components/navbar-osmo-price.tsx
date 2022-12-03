import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useStore } from "../stores";
import { Button } from "./buttons";
import { Sparkline } from "./chart/sparkline";
import Skeleton from "./skeleton";

/**
 * Get chart data.
 * @param prices - prices by hour
 */
function getChartData(prices: PricePretty[] = []) {
  // subtract length by 24 to get current day's data
  const chunkedPrices = prices
    .map((price) => Number(price.toDec().toString()))
    .splice(prices.length - 24);

  return chunkedPrices;
}

const NavbarOsmoPrice = observer(() => {
  const { priceStore, chainStore, queriesExternalStore } = useStore();

  const osmoCurrency = chainStore.osmosis.stakeCurrency;
  const osmoPrice = priceStore.calculatePrice(
    new CoinPretty(
      chainStore.osmosis.stakeCurrency,
      DecUtils.getTenExponentNInPrecisionRange(
        chainStore.osmosis.stakeCurrency.coinDecimals
      )
    )
  );
  const tokenChartQuery = queriesExternalStore.queryTokenHistoricalChart.get(
    chainStore.osmosis.stakeCurrency.coinDenom,
    60
  );
  const tokenDataQuery = queriesExternalStore.queryTokenData.get(
    chainStore.osmosis.stakeCurrency.coinDenom
  );

  if (!osmoPrice || !osmoCurrency) return null;

  return (
    <div className="flex flex-col gap-6 px-2">
      <div className="flex items-center justify-between">
        <Skeleton isLoaded={osmoPrice.isReady} className="min-w-[70px]">
          <div className="flex items-center gap-1">
            <div className="h-[20px] w-[20px]">
              <Image
                src={osmoCurrency.coinImageUrl!}
                alt="Osmo icon"
                width={20}
                height={20}
              />
            </div>

            <p>{osmoPrice.maxDecimals(2).toString()}</p>
          </div>
        </Skeleton>

        <Skeleton
          isLoaded={
            !tokenDataQuery.isFetching &&
            !tokenChartQuery.isFetching &&
            osmoPrice.isReady
          }
          className="flex min-h-[23px] min-w-[85px] items-center justify-end gap-1.5"
        >
          <Sparkline
            data={getChartData(tokenChartQuery?.getChartPrices())}
            width={30}
            height={24}
            lineWidth={2}
          />

          <p
            className={
              tokenDataQuery.get24hrChange()?.toDec().gte(new Dec(0))
                ? "text-bullish-400"
                : "text-error"
            }
          >
            {tokenDataQuery
              .get24hrChange()
              ?.maxDecimals(2)
              .inequalitySymbol(false)
              .toString()}
          </p>
        </Skeleton>
      </div>

      <Button
        mode="tertiary"
        className="!h-11 !rounded-full !border-osmoverse-700 !py-1 text-osmoverse-100 !transition-none hover:bg-gradient-positive hover:text-osmoverse-1000"
      >
        Buy tokens
      </Button>
    </div>
  );
});

export default NavbarOsmoPrice;
