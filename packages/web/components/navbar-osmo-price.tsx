import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useTransferConfig } from "../hooks";
import { FiatRampsModal } from "../modals";
import { useStore } from "../stores";
import { CoinsIcon } from "./assets/coins-icon";
import { Button } from "./buttons";
import { Sparkline } from "./chart/sparkline";
import Skeleton from "./skeleton";

/**
 * Get chart data.
 * @param prices - prices by hour
 */
function getChartData(prices: PricePretty[] = []) {
  // subtract length by 24 to get current day's data
  const chunkedPrices = [...prices]
    .splice(prices.length - 24)
    .map((price) => Number(price.toDec().toString()));

  return chunkedPrices;
}

const NavbarOsmoPrice = observer(() => {
  const { priceStore, chainStore, queriesExternalStore } = useStore();
  const transferConfig = useTransferConfig();

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
      <div className="flex items-center justify-between  px-2">
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

            <p className="mt-[3px]">
              {osmoPrice.fiatCurrency.symbol}
              {Number(osmoPrice.toDec().toString()).toFixed(2)}
            </p>
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
            width={25}
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

      <Skeleton isLoaded={osmoPrice.isReady}>
        <Button
          mode="tertiary"
          className={classNames(
            "button group relative !h-11 gap-2 overflow-hidden !rounded-full !border-osmoverse-700 !py-1 font-bold text-osmoverse-100 !transition-all !duration-300 !ease-in-out",
            "hover:border-none hover:bg-gradient-positive hover:text-osmoverse-1000"
          )}
          onClick={() => transferConfig.buyOsmo()}
        >
          <CreditCardIcon /> <span className="z-10">Buy tokens</span>{" "}
          <CoinsIcon
            className={classNames(
              "invisible absolute top-0 -translate-y-full transform transition-transform ease-linear",
              "group-hover:visible group-hover:translate-y-[30%] group-hover:duration-[3s]"
            )}
          />
        </Button>
      </Skeleton>

      {transferConfig?.fiatRampsModal && (
        <FiatRampsModal {...transferConfig.fiatRampsModal} />
      )}
    </div>
  );
});

const CreditCardIcon = () => {
  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="z-10"
    >
      <g clipPath="url(#clip0_558_4852)">
        <path
          d="M15.4018 1.25846L2.51708 5.28766C1.72641 5.53491 1.28589 6.37632 1.53314 7.16699L4.21927 15.7568C4.46652 16.5475 5.30792 16.988 6.09859 16.7407L18.9833 12.7115C19.774 12.4643 20.2145 11.6229 19.9672 10.8322L17.2811 2.24241C17.0339 1.45174 16.1925 1.01121 15.4018 1.25846Z"
          stroke="currentcolor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={classNames(
            "translate-x-[6px] -translate-y-[1px] rotate-[17.37deg] transform stroke-[1.5] transition-transform duration-300 ease-in-out",
            "group-hover:translate-x-0 group-hover:-translate-y-0 group-hover:rotate-0 group-hover:stroke-[2]"
          )}
        />
        <path
          d="M20.5 5H7C6.17157 5 5.5 5.67157 5.5 6.5V15.5C5.5 16.3284 6.17157 17 7 17H20.5C21.3284 17 22 16.3284 22 15.5V6.5C22 5.67157 21.3284 5 20.5 5Z"
          stroke="currentcolor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="fill-osmoverse-700 stroke-[1.5] group-hover:fill-[#71B5EB] group-hover:stroke-[2]"
        />
        <path
          d="M6.5 9.5H21"
          stroke="currentcolor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="14.75"
          y="12"
          width="5"
          height="3"
          rx="1"
          fill="currentcolor"
        />
      </g>
      <defs>
        <clipPath id="clip0_558_4852">
          <rect
            width="23"
            height="20"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default NavbarOsmoPrice;
