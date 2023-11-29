import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { AppCurrency } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, useMemo } from "react";

import { Icon } from "~/components/assets";
import { EventName } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { CoinBalance, ObservableAssets } from "~/stores/assets";
import { QueriesExternalStore } from "~/stores/queries-external";

const numberOfAssetsToDisplay = 8;

const findRelatedAssets = (
  memoedPools: ObservableQueryPool[],
  assetsStore: ObservableAssets,
  queriesExternalStore: QueriesExternalStore,
  numberOfUniqueAssetDenoms: number,
  tokenDenom: string
) => {
  const balances = [
    ...assetsStore.nativeBalances,
    ...assetsStore.unverifiedIbcBalances,
    ...assetsStore.ibcBalances,
  ];

  const relatedDenoms = new Set<string>();

  for (const pool of memoedPools) {
    if (pool.poolAssets.some((asset) => asset.amount.denom === tokenDenom)) {
      const relatedDenom = pool.poolAssets.find(
        (asset) => asset.amount.denom !== tokenDenom
      );

      if (relatedDenom) {
        relatedDenoms.add(relatedDenom.amount.denom);
      }
    }
  }

  const relatedAssets = balances
    .filter(
      (balance) =>
        relatedDenoms.has(balance.balance.denom) &&
        balance.balance.denom !== tokenDenom &&
        !!queriesExternalStore.queryMarketCaps.get(balance.balance.denom)
    )
    .sort((balance1, balance2) => {
      const marketCap1 =
        queriesExternalStore.queryMarketCaps.get(balance1.balance.denom) || 0;
      const marketCap2 =
        queriesExternalStore.queryMarketCaps.get(balance2.balance.denom) || 0;

      return marketCap2 - marketCap1;
    });

  const unique = relatedAssets.filter((asset, index) => {
    return (
      index ===
      relatedAssets.findIndex(
        (inner) => asset.balance.denom === inner.balance.denom
      )
    );
  });

  return unique.slice(0, numberOfUniqueAssetDenoms);
};

interface RelatedAssetsProps {
  memoedPools: ObservableQueryPool[];
  tokenDenom: string;
  className?: string;
}

const RelatedAssets: FunctionComponent<RelatedAssetsProps> = observer(
  ({ memoedPools, tokenDenom, className }) => {
    const { t } = useTranslation();

    const { assetsStore, queriesExternalStore } = useStore();

    const relatedAssets = findRelatedAssets(
      memoedPools,
      assetsStore,
      queriesExternalStore,
      numberOfAssetsToDisplay,
      tokenDenom.toUpperCase()
    );

    return relatedAssets.length > 0 ? (
      <section
        className={`flex flex-col gap-8 rounded-5xl border border-osmoverse-800 bg-osmoverse-900 py-10 px-8 md:p-6 ${className}`}
      >
        <header>
          <h6 className="text-lg font-h6 leading-6">
            {t("tokenInfos.relatedAssets")}
          </h6>
        </header>
        <ul className="flex flex-col gap-8">
          {relatedAssets.map((relatedAsset) => (
            <RelatedAsset
              key={relatedAsset.balance.denom}
              coinBalance={relatedAsset}
            />
          ))}
        </ul>
      </section>
    ) : null;
  }
);

const RelatedAssetSkeleton: FunctionComponent<{
  coinDenom: string;
  denom: string;
  iconUrl?: string;
  price: string;
  priceChange?: string;
}> = ({ coinDenom, denom, iconUrl, price, priceChange }) => {
  const { logEvent } = useAmplitudeAnalytics();

  const onLinkClick = () => {
    logEvent([EventName.TokenInfo.assetClicked, { tokenName: denom }]);
  };

  const assetName = useMemo(() => {
    const currencies = ChainList.map(
      (info) => info.keplrChain.currencies
    ).reduce((a, b) => [...a, ...b]);

    const currency = currencies.find((el) => el.coinDenom === coinDenom);

    if (!currency) {
      return undefined;
    }

    const asset = getAssetFromAssetList({
      minimalDenom: currency?.coinMinimalDenom,
      assetLists: AssetLists,
    });

    return asset?.rawAsset.name;
  }, [coinDenom]);

  return (
    <Link
      href={`/assets/${denom}`}
      className="flex cursor-pointer flex-row items-center justify-between self-stretch"
      passHref
      onClick={onLinkClick}
    >
      <div className="flex flex-row items-center justify-center gap-3">
        {iconUrl ? (
          <Image src={iconUrl} alt="coin name" width={52} height={52} />
        ) : (
          <div className="h-12 w-12 rounded-full bg-osmoverse-800" />
        )}
        <div className="flex flex-col gap-1">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-100">
            {coinDenom}
          </p>
          <p className="text-sm font-body2 font-medium capitalize leading-5 text-osmoverse-300">
            {assetName}
          </p>
        </div>
      </div>
      <div className="flex flex-row items-center gap-5">
        <div className="flex flex-col items-end gap-1">
          <h6 className="text-lg font-h6 leading-6 text-osmoverse-100">
            {price}
          </h6>
          {priceChange && (
            <p className="text-sm font-subtitle2 font-medium leading-5 text-osmoverse-300">
              {priceChange}
            </p>
          )}
        </div>

        <Icon
          id="caret-down"
          className="-rotate-90 text-osmoverse-500"
          height={24}
          width={24}
        />
      </div>
    </Link>
  );
};

const RelatedAsset: FunctionComponent<{
  coinBalance: CoinBalance;
}> = observer(({ coinBalance }) => {
  const { priceStore, queriesExternalStore } = useStore();

  const assetData = queriesExternalStore.queryTokenHistoricalChart.get(
    coinBalance.balance.denom,
    10080
  );

  let priceChange;
  if (assetData.getRawChartPrices && assetData.getRawChartPrices.length > 1) {
    const priceNow =
      assetData.getRawChartPrices[assetData.getRawChartPrices.length - 1].close;
    const price7daysAgo =
      assetData.getRawChartPrices[assetData.getRawChartPrices.length - 2].close;
    priceChange = new RatePretty((priceNow - price7daysAgo) / price7daysAgo);
  }

  let prettyPrice: PricePretty | undefined = undefined;

  const currencyIbcDenom = (coinBalance.balance.currency as AppCurrency).base;
  if (currencyIbcDenom && coinBalance.fiatValue?.fiatCurrency) {
    const price = priceStore.getPrice(
      currencyIbcDenom,
      coinBalance.fiatValue.fiatCurrency.currency
    );

    prettyPrice = new PricePretty(
      coinBalance.fiatValue?.fiatCurrency,
      new Dec(price ?? 0)
    );
  }

  return (
    <li>
      <RelatedAssetSkeleton
        key={coinBalance.balance.denom}
        coinDenom={coinBalance.balance.currency.coinDenom}
        denom={coinBalance.balance.denom}
        iconUrl={coinBalance.balance.currency.coinImageUrl}
        price={prettyPrice?.maxDecimals(2).toString() ?? ""}
        priceChange={priceChange?.maxDecimals(2).toString()}
      />
    </li>
  );
});

export default RelatedAssets;
