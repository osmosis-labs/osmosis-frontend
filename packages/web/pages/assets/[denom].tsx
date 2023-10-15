import { Dec } from "@keplr-wallet/unit";
import { ObservableAssetInfoConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback } from "react";
import { useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-multi-lang";
import { useUnmount } from "react-use";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import LinkButton from "~/components/buttons/link-button";
import LinkIconButton from "~/components/buttons/link-icon-button";
import TokenPairHistoricalChart, {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/token-pair-historical";
import RelatedAssets from "~/components/related-assets/related-assets";
import SkeletonLoader from "~/components/skeleton-loader";
import Spinner from "~/components/spinner";
import { SwapTool } from "~/components/swap-tool";
import TokenDetails from "~/components/token-details/token-details";
import TwitterSection from "~/components/twitter-section/twitter-section";
import YourBalance from "~/components/your-balance/your-balance";
import {
  useAssetInfoConfig,
  useFeatureFlags,
  useLocalStorageState,
  useNavBar,
  useWalletSelect,
} from "~/hooks";
import { useRoutablePools } from "~/hooks/data/use-routable-pools";
import { TokenCMSData } from "~/hooks/use-token-cms";
import { TradeTokens } from "~/modals";
import { getTokenInfo } from "~/services";
import { Twitter } from "~/services/twitter";
import { RichTweet } from "~/services/twitter";
import { useStore } from "~/stores";
import { SUPPORTED_LANGUAGES } from "~/stores/user-settings";
import { getDecimalCount } from "~/utils/number";
import { createContext } from "~/utils/react-context";

interface AssetInfoPageProps {
  tweets: RichTweet[];
  tokenDenom?: string;
  tokenDetailsByLanguage?: {
    [key: string]: TokenCMSData;
  };
}

const AssetInfoPage: FunctionComponent<AssetInfoPageProps> = observer(
  ({ tokenDenom, ...rest }) => {
    const featureFlags = useFeatureFlags();
    const router = useRouter();

    useEffect(() => {
      if (
        typeof featureFlags.tokenInfo !== "undefined" &&
        !featureFlags.tokenInfo
      ) {
        router.push("/assets");
      }
    }, [featureFlags.tokenInfo, router]);

    if (!tokenDenom) {
      return null; // TODO: Add skeleton loader
    }

    return <AssetInfoView tokenDenom={tokenDenom} {...rest} />;
  }
);

const [AssetInfoViewProvider, useAssetInfoView] = createContext<{
  assetInfoConfig: ObservableAssetInfoConfig;
}>({
  name: "AssetInfoViewContext",
  strict: true,
});

const AssetInfoView: FunctionComponent<AssetInfoPageProps> = observer(
  ({ tweets, tokenDetailsByLanguage }) => {
    const [showTradeModal, setShowTradeModal] = useState(false);

    const t = useTranslation();
    const router = useRouter();
    const { queriesExternalStore, priceStore } = useStore();
    const assetInfoConfig = useAssetInfoConfig(
      router.query.denom as string,
      queriesExternalStore,
      priceStore
    );
    const { isLoading: isWalletLoading } = useWalletSelect();

    useNavBar({
      title: (
        <LinkButton
          className="mr-auto md:invisible"
          icon={
            <Image
              alt="left"
              src="/icons/arrow-left.svg"
              width={24}
              height={24}
              className="text-osmoverse-200"
            />
          }
          label={t("tokenInfos.backButton")}
          ariaLabel={t("tokenInfos.ariaBackButton")}
          href="/assets"
        />
      ),
      ctas: [
        {
          label: t("tokenInfos.trade"),
          onClick: () => setShowTradeModal(true),
          className: "mr-8 lg:mr-0",
        },
      ],
    });

    useUnmount(() => {
      assetInfoConfig.dispose();
    });

    const contextValue = useMemo(
      () => ({
        assetInfoConfig,
      }),
      [assetInfoConfig]
    );

    const routablePools = useRoutablePools();
    const memoedPools = routablePools ?? [];

    return (
      <AssetInfoViewProvider value={contextValue}>
        {showTradeModal && (
          <TradeTokens
            className="md:!p-0"
            isOpen={showTradeModal}
            onRequestClose={() => {
              setShowTradeModal(false);
            }}
            memoedPools={routablePools ?? []}
            swapOptions={{
              sendTokenDenom: assetInfoConfig.denom,
            }}
          />
        )}

        <main className="flex flex-col gap-8 p-8 py-4">
          <Navigation />
          <div className="grid grid-cols-tokenpage gap-4 xl:flex xl:flex-col">
            <div className="flex flex-col gap-4">
              <TokenChartSection />
              <YourBalance denom={assetInfoConfig.denom} />
              <TokenDetails
                denom={router.query.denom as string}
                tokenDetailsByLanguage={tokenDetailsByLanguage}
              />
              <TwitterSection tweets={tweets} />
            </div>
            <div className="flex flex-col gap-4">
              <SwapTool
                memoedPools={memoedPools}
                isDataLoading={!Boolean(routablePools) || isWalletLoading}
                isInModal
                sendTokenDenom={assetInfoConfig.denom}
                outTokenDenom={
                  assetInfoConfig.denom === "OSMO" ? "ATOM" : "OSMO"
                }
              />
              <RelatedAssets
                memoedPools={memoedPools}
                tokenDenom={assetInfoConfig.denom}
              />
            </div>
          </div>
        </main>
      </AssetInfoViewProvider>
    );
  }
);

const Navigation = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();
  const { chainStore } = useStore();
  const t = useTranslation();
  const [favoritesList, setFavoritesList] = useLocalStorageState(
    "favoritesList",
    ["OSMO", "ATOM"]
  );

  const isFavorite = useMemo(
    () => favoritesList.includes(assetInfoConfig.denom),
    [assetInfoConfig.denom, favoritesList]
  );

  const toggleFavoriteList = useCallback(() => {
    if (isFavorite) {
      setFavoritesList(
        favoritesList.filter((item) => item !== assetInfoConfig.denom)
      );
    } else {
      setFavoritesList([...favoritesList, assetInfoConfig.denom]);
    }
  }, [isFavorite, favoritesList, assetInfoConfig.denom, setFavoritesList]);

  const denom = assetInfoConfig.denom;

  const chain = useMemo(
    () => chainStore.getChainFromCurrency(assetInfoConfig.denom.toUpperCase()),
    [assetInfoConfig.denom, chainStore]
  );

  const chainName = chain?.chainName;

  return (
    <nav className="flex w-full flex-wrap justify-between gap-2">
      <div className="flex items-baseline gap-3">
        {chainName && <h1 className="text-h4 font-h4">{chainName}</h1>}
        <h2 className="text-h4 font-h4 text-osmoverse-300">
          {denom?.toUpperCase()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          mode="unstyled"
          className="group flex gap-2 rounded-xl bg-osmoverse-850 px-4 py-2 font-semibold text-osmoverse-300 hover:bg-osmoverse-700 active:bg-osmoverse-800"
          aria-label="Add to watchlist"
          onClick={toggleFavoriteList}
        >
          <Icon
            id="star"
            className={`text-wosmongton-300 ${
              isFavorite ? "" : "opacity-30 group-hover:opacity-100"
            } `}
          />
          {t("tokenInfos.watchlist")}
        </Button>
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label={t("tokenInfos.ariaViewOn", { name: "X" })}
          icon={<Icon className="h-4 w-4 text-osmoverse-400" id="X" />}
        />
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label={t("tokenInfos.ariaView", { name: "website" })}
          icon={<Icon className="w-h-6 h-6 text-osmoverse-400" id="web" />}
        />
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label={t("tokenInfos.ariaViewOn", { name: "CoinGecko" })}
          icon={
            <Icon className="h-10.5 w-10.5 text-osmoverse-300" id="coingecko" />
          }
        />
      </div>
    </nav>
  );
});

const TokenChartSection = () => {
  return (
    <section className="flex flex-col gap-3 rounded-5xl bg-osmoverse-850 p-8 md:p-6">
      <TokenChartHeader />
      <TokenChart />
    </section>
  );
};

const TokenChartHeader = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();

  const minimumDecimals = 2;
  const maxDecimals = Math.max(
    getDecimalCount(
      (assetInfoConfig.hoverPrice?.toDec() ?? new Dec(0)).toString()
    ),
    minimumDecimals
  );

  return (
    <header>
      <SkeletonLoader isLoaded={Boolean(assetInfoConfig?.hoverPrice)}>
        <PriceChartHeader
          decimal={maxDecimals}
          hoverPrice={Number(
            (assetInfoConfig.hoverPrice?.toDec() ?? new Dec(0)).toString()
          )}
          historicalRange={assetInfoConfig.historicalRange}
          setHistoricalRange={assetInfoConfig.setHistoricalRange}
          fiatSymbol={assetInfoConfig.hoverPrice?.fiatCurrency?.symbol}
          classes={{
            priceHeaderClass: "!text-h2 !font-h2",
            pricesHeaderRootContainer: "items-center",
          }}
        />
      </SkeletonLoader>
    </header>
  );
});

const TokenChart = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();
  return (
    <div className="h-[400px] w-full xl:h-[250px]">
      {assetInfoConfig.isHistoricalChartLoading ? (
        <div className="flex h-full flex-col items-center justify-center">
          <Spinner />
        </div>
      ) : !assetInfoConfig.isHistoricalChartUnavailable ? (
        <>
          <TokenPairHistoricalChart
            showGradient
            data={assetInfoConfig.historicalChartData}
            annotations={[]}
            domain={assetInfoConfig.yRange}
            onPointerHover={assetInfoConfig.setHoverPrice}
            onPointerOut={() => {
              if (assetInfoConfig.lastChartPrice) {
                assetInfoConfig.setHoverPrice(
                  assetInfoConfig.lastChartPrice.close
                );
              }
            }}
          />
        </>
      ) : (
        <ChartUnavailable />
      )}
    </div>
  );
});

export default AssetInfoPage;

export const getServerSideProps: GetServerSideProps<
  AssetInfoPageProps
> = async ({ res, params }) => {
  res.setHeader(
    "Cache-Control",
    "public, max-age=604800, stale-while-revalidate=86400"
  );

  let tweets: RichTweet[] = [];
  let tokenDenom = params?.denom as string;
  let tokenDetailsByLanguage: { [key: string]: TokenCMSData } | undefined =
    undefined;

  if (tokenDenom) {
    try {
      tokenDetailsByLanguage = Object.fromEntries(
        await Promise.all(
          SUPPORTED_LANGUAGES.map(async (lang) => {
            try {
              const res = await getTokenInfo(tokenDenom, lang.value);

              return [lang.value, res];
            } catch (error) {
              console.error(error);
            }

            return [lang.value, null];
          })
        )
      );

      const tokenDetails = tokenDetailsByLanguage
        ? tokenDetailsByLanguage["en"]
        : undefined;

      if (tokenDetails && tokenDetails.twitterURL) {
        const userId = tokenDetails.twitterURL.split("/").pop();

        if (userId) {
          tweets = await Twitter.getUserTweets(userId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    return {
      props: {
        tokenDenom,
        tokenDetailsByLanguage,
        tweets: [],
      },
    };
  }

  return {
    props: {
      tokenDenom,
      tokenDetailsByLanguage,
      tweets,
    },
  };
};
