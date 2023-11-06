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
import { COINGECKO_PUBLIC_URL, EventName, TWITTER_PUBLIC_URL } from "~/config";
import {
  useAmplitudeAnalytics,
  useCurrentLanguage,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import {
  useAssetInfoConfig,
  useFeatureFlags,
  useLocalStorageState,
  useNavBar,
  useWalletSelect,
} from "~/hooks";
import { useRoutablePools } from "~/hooks/data/use-routable-pools";
import { TradeTokens } from "~/modals";
import { CoingeckoCoin, queryCoingeckoCoin } from "~/queries/coingecko";
import {
  getTokenInfo,
  RichTweet,
  TokenCMSData,
  Twitter,
} from "~/queries/external";
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
  coingeckoCoin?: CoingeckoCoin;
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
  ({ tweets, tokenDetailsByLanguage, coingeckoCoin }) => {
    const [showTradeModal, setShowTradeModal] = useState(false);

    const { t } = useTranslation();
    const router = useRouter();
    const { queriesExternalStore, priceStore } = useStore();

    const assetInfoConfig = useAssetInfoConfig(
      router.query.denom as string,
      queriesExternalStore,
      priceStore
    );

    const { isLoading: isWalletLoading } = useWalletSelect();

    useAmplitudeAnalytics({
      onLoadEvent: [
        EventName.TokenInfo.pageViewed,
        { tokenName: router.query.denom as string },
      ],
    });

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
              outTokenDenom: assetInfoConfig.denom === "OSMO" ? "ATOM" : "OSMO",
              page: "Token Info Page",
            }}
          />
        )}

        <main className="flex flex-col gap-8 p-8 py-4">
          <Navigation
            tokenDetailsByLanguage={tokenDetailsByLanguage}
            coingeckoCoin={coingeckoCoin}
          />
          <div className="grid grid-cols-tokenpage gap-4 xl:flex xl:flex-col">
            <div className="flex flex-col gap-4">
              <TokenChartSection />

              <YourBalance denom={assetInfoConfig.denom} />

              <TokenDetails
                denom={router.query.denom as string}
                tokenDetailsByLanguage={tokenDetailsByLanguage}
                coingeckoCoin={coingeckoCoin}
              />

              <div className="hidden xl:block">
                <SwapTool
                  memoedPools={memoedPools}
                  isDataLoading={!Boolean(routablePools) || isWalletLoading}
                  isInModal
                  sendTokenDenom={assetInfoConfig.denom}
                  outTokenDenom={
                    assetInfoConfig.denom === "OSMO" ? "ATOM" : "OSMO"
                  }
                  page="Token Info Page"
                />
              </div>

              <TwitterSection tweets={tweets} />
            </div>

            <div className="flex flex-col gap-4">
              <div className="xl:hidden">
                <SwapTool
                  memoedPools={memoedPools}
                  isDataLoading={!Boolean(routablePools) || isWalletLoading}
                  isInModal
                  sendTokenDenom={assetInfoConfig.denom}
                  outTokenDenom={
                    assetInfoConfig.denom === "OSMO" ? "ATOM" : "OSMO"
                  }
                  page="Token Info Page"
                />
              </div>

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

interface NavigationProps {
  tokenDetailsByLanguage?: { [key: string]: TokenCMSData };
  coingeckoCoin?: CoingeckoCoin;
}

const Navigation = observer((props: NavigationProps) => {
  const { tokenDetailsByLanguage, coingeckoCoin } = props;
  const { assetInfoConfig } = useAssetInfoView();
  const { chainStore } = useStore();
  const { t } = useTranslation();
  const language = useCurrentLanguage();
  const [favoritesList, setFavoritesList] = useLocalStorageState(
    "favoritesList",
    ["OSMO", "ATOM"]
  );

  const details = useMemo(() => {
    return tokenDetailsByLanguage
      ? tokenDetailsByLanguage[language]
      : undefined;
  }, [language, tokenDetailsByLanguage]);

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

  const twitterUrl = useMemo(() => {
    if (details?.twitterURL) {
      return details.twitterURL;
    }

    if (coingeckoCoin?.links.twitter_screen_name) {
      return `${TWITTER_PUBLIC_URL}/${coingeckoCoin.links.twitter_screen_name}`;
    }
  }, [coingeckoCoin?.links.twitter_screen_name, details?.twitterURL]);

  const websiteURL = useMemo(() => {
    if (details?.websiteURL) {
      return details.websiteURL;
    }

    if (
      coingeckoCoin?.links.homepage &&
      coingeckoCoin.links.homepage.length > 0
    ) {
      return coingeckoCoin.links.homepage[0];
    }
  }, [coingeckoCoin?.links.homepage, details?.websiteURL]);

  const coingeckoURL = useMemo(() => {
    if (coingeckoCoin?.id) {
      return `${COINGECKO_PUBLIC_URL}/en/coins/${coingeckoCoin.id}`;
    }
  }, [coingeckoCoin?.id]);

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
        {twitterUrl && (
          <LinkIconButton
            href={twitterUrl}
            mode="icon-social"
            size="md-icon-social"
            target="_blank"
            rel="external"
            aria-label={t("tokenInfos.ariaViewOn", { name: "X" })}
            icon={<Icon className="h-4 w-4 text-osmoverse-400" id="X" />}
          />
        )}
        {websiteURL && (
          <LinkIconButton
            href={websiteURL}
            mode="icon-social"
            size="md-icon-social"
            target="_blank"
            rel="external"
            aria-label={t("tokenInfos.ariaView", { name: "website" })}
            icon={<Icon className="w-h-6 h-6 text-osmoverse-400" id="web" />}
          />
        )}
        {coingeckoURL && (
          <LinkIconButton
            href={coingeckoURL}
            mode="icon-social"
            size="md-icon-social"
            target="_blank"
            rel="external"
            aria-label={t("tokenInfos.ariaViewOn", { name: "CoinGecko" })}
            icon={
              <Icon
                className="h-10.5 w-10.5 text-osmoverse-300"
                id="coingecko"
              />
            }
          />
        )}
      </div>
    </nav>
  );
});

const TokenChartSection = () => {
  return (
    <section className="flex flex-col justify-between gap-3 overflow-hidden rounded-5xl bg-osmoverse-850 p-8 md:p-6">
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
          showAllRange
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

const useNumTicks = () => {
  const { assetInfoConfig } = useAssetInfoView();
  const { isMobile, isLargeDesktop } = useWindowSize();

  const numTicks = useMemo(() => {
    let ticks: number | undefined = isMobile ? 3 : 6;

    if (isLargeDesktop) {
      return 10;
    }

    switch (assetInfoConfig.historicalRange) {
      case "7d":
        ticks = isMobile ? 1 : 8;
        break;
      case "1mo":
        ticks = isMobile ? 2 : 6;
        break;
      case "1d":
        ticks = isMobile ? 3 : 10;
        break;
      case "1y":
      case "all":
        ticks = isMobile ? 4 : 6;
        break;
    }

    return ticks;
  }, [assetInfoConfig.historicalRange, isMobile, isLargeDesktop]);

  return numTicks;
};

const TokenChart = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();
  const xNumTicks = useNumTicks();

  return (
    <div className="h-[370px] w-full xl:h-[250px]">
      {assetInfoConfig.isHistoricalChartLoading ? (
        <div className="flex h-full flex-col items-center justify-center">
          <Spinner />
        </div>
      ) : !assetInfoConfig.isHistoricalChartUnavailable ? (
        <>
          <TokenPairHistoricalChart
            minimal
            showTooltip
            showGradient
            xNumTicks={xNumTicks}
            data={assetInfoConfig.historicalChartData}
            fiatSymbol={assetInfoConfig.hoverPrice?.fiatCurrency?.symbol}
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
  let coingeckoCoin: CoingeckoCoin | undefined = undefined;

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

      if (tokenDetails) {
        if (tokenDetails.coingeckoID) {
          coingeckoCoin = await queryCoingeckoCoin(tokenDetails.coingeckoID);
        }

        if (tokenDetails.twitterURL) {
          const userId = tokenDetails.twitterURL.split("/").pop();

          if (userId) {
            const twitter = new Twitter();

            tweets = await twitter.getUserTweets(userId);
          }
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
        coingeckoCoin,
        tweets: [],
      },
    };
  }

  return {
    props: {
      tokenDenom,
      tokenDetailsByLanguage,
      coingeckoCoin,
      tweets,
    },
  };
};
