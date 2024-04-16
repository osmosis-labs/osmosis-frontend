import { makeMinimalAsset } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { CoinsIcon } from "~/components/assets/coins-icon";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import { Sparkline } from "~/components/chart/sparkline";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { Button } from "~/components/ui/button";
import { AssetLists } from "~/config/generated/asset-lists";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

const osmoAsset = AssetLists.flatMap(({ assets }) => assets).find(
  (asset) => asset.symbol === "OSMO"
);
const osmoCurrency = makeMinimalAsset(osmoAsset!);

const NavbarOsmoPrice = observer(() => {
  const { accountStore, chainStore } = useStore();
  const { t } = useTranslation();
  const flags = useFeatureFlags();
  const { fiatRampSelection } = useBridge();

  const { chainId } = chainStore.osmosis;
  const wallet = accountStore.getWallet(chainId);

  const { data: osmoPrice } = api.edge.assets.getAssetPrice.useQuery(
    { coinMinimalDenom: osmoCurrency?.coinMinimalDenom ?? "" },
    { enabled: Boolean(osmoCurrency) }
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

        {flags.sidebarOsmoChangeAndChart && <OsmoPriceAndChart />}
      </div>

      {wallet?.isWalletConnected && (
        <SkeletonLoader isLoaded={osmoPrice.isReady}>
          <Button
            variant="outline"
            className="button group relative flex w-full items-center justify-center gap-2 overflow-hidden !rounded-full border-osmoverse-700 font-bold text-osmoverse-100 transition-all duration-300 ease-in-out hover:border-none hover:bg-gradient-positive hover:text-osmoverse-1000"
            onClick={() => fiatRampSelection()}
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
    </div>
  );
});

const OsmoPriceAndChart: FunctionComponent = () => {
  const { data: assetMarketInfo, isLoading: isLoadingAssetInfo } =
    api.edge.assets.getUserMarketAsset.useQuery({
      findMinDenomOrSymbol: "OSMO",
    });

  const { data: recentPrices = [], isLoading: isLoadingHistoricalPrices } =
    api.edge.assets.getAssetHistoricalPrice.useQuery({
      coinDenom: "OSMO",
      timeFrame: "1D",
    });

  const isNumberGoUp = assetMarketInfo?.priceChange24h?.toDec().isPositive();

  return (
    <SkeletonLoader
      isLoaded={!isLoadingAssetInfo && !isLoadingHistoricalPrices}
      className="flex min-h-[23px] min-w-[85px] items-center justify-end gap-1.5"
    >
      <Sparkline
        data={recentPrices.map((price) => price.close)}
        width={25}
        height={24}
        lineWidth={2}
        color={
          isNumberGoUp ? theme.colors.bullish[400] : theme.colors.osmoverse[500]
        }
      />

      <p className={isNumberGoUp ? "text-bullish-400" : "text-osmoverse-500"}>
        {assetMarketInfo?.priceChange24h
          ?.maxDecimals(2)
          .inequalitySymbol(false)
          .toString() ?? ""}
      </p>
    </SkeletonLoader>
  );
};

export default NavbarOsmoPrice;
