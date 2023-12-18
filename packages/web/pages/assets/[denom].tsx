import { Dec } from "@keplr-wallet/unit";
import { ObservableAssetInfoConfig } from "@osmosis-labs/stores";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { GetStaticPathsResult, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback, useEffect } from "react";
import { useMemo } from "react";
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
  COINGECKO_PUBLIC_URL,
  ENABLE_FEATURES,
  EventName,
  TWITTER_PUBLIC_URL,
  URBIT_DEPLOYMENT,
} from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
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
} from "~/hooks";
import { useRoutablePools } from "~/hooks/data/use-routable-pools";
import {
  CoingeckoCoin,
  queryCoingeckoCoin,
} from "~/server/queries/coingecko/detail";
import {
  getTokenInfo,
  RichTweet,
  TokenCMSData,
  Twitter,
} from "~/server/queries/external";
import { ImperatorToken, queryAllTokens } from "~/server/queries/indexer";
import { useStore } from "~/stores";
import { SUPPORTED_LANGUAGES } from "~/stores/user-settings";
import { getDecimalCount } from "~/utils/number";
import { createContext } from "~/utils/react-context";

interface AssetInfoPageProps {
  tweets: RichTweet[];
  tokenDenom?: string;
  tokenDetailsByLanguage?: {
    [key: string]: TokenCMSData;
  } | null;
  coingeckoCoin?: CoingeckoCoin | null;
  imperatorDenom: string | null;
}

const AssetInfoPage: FunctionComponent<AssetInfoPageProps> = observer(
  ({ tokenDenom, ...rest }) => {
    const featureFlags = useFeatureFlags();
    const router = useRouter();

    useEffect(() => {
      if (
        typeof featureFlags.tokenInfo !== "undefined" &&
        !(ENABLE_FEATURES || featureFlags.tokenInfo)
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
  ({ tweets, tokenDetailsByLanguage, imperatorDenom, coingeckoCoin }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { queriesExternalStore, priceStore } = useStore();

    const assetInfoConfig = useAssetInfoConfig(
      (router.query.denom as string).toUpperCase(),
      queriesExternalStore,
      priceStore,
      imperatorDenom,
      coingeckoCoin?.id
    );

    useAmplitudeAnalytics({
      onLoadEvent: [
        EventName.TokenInfo.pageViewed,
        { tokenName: (router.query.denom as string).toUpperCase() },
      ],
    });

    useNavBar({
      title: (
        <LinkButton
          className="mr-auto md:invisible"
          icon={
            <Image
              alt="left"
              src={`${process.env.NEXT_PUBLIC_BASEPATH}/icons/arrow-left.svg`}
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
      ctas: [],
    });

    useUnmount(() => {
      if (process.env.NODE_ENV === "production") {
        assetInfoConfig.dispose();
      }
    });

    const contextValue = useMemo(
      () => ({
        assetInfoConfig,
      }),
      [assetInfoConfig]
    );

    const routablePools = useRoutablePools();
    const memoedPools = routablePools ?? [];

    const denom = useMemo(() => {
      return (router.query.denom as string).toUpperCase();
    }, [router.query.denom]);

    return (
      <AssetInfoViewProvider value={contextValue}>
        <main className="flex flex-col gap-8 p-8 py-4 xs:px-2">
          <Navigation
            denom={denom}
            tokenDetailsByLanguage={tokenDetailsByLanguage}
            coingeckoCoin={coingeckoCoin}
          />
          <div className="grid grid-cols-tokenpage gap-4 xl:flex xl:flex-col">
            <div className="flex flex-col gap-4">
              <TokenChartSection />

              <YourBalance
                denom={denom}
                tokenDetailsByLanguage={tokenDetailsByLanguage}
              />

              <TokenDetails
                denom={denom}
                tokenDetailsByLanguage={tokenDetailsByLanguage}
                coingeckoCoin={coingeckoCoin}
              />

              <TwitterSection tweets={tweets} />
            </div>

            <div className="flex flex-col gap-4">
              <div className="xl:hidden">
                <SwapTool
                  isInModal
                  sendTokenDenom={denom === "USDC" ? "OSMO" : "USDC"}
                  outTokenDenom={denom}
                  page="Token Info Page"
                />
              </div>

              <RelatedAssets memoedPools={memoedPools} tokenDenom={denom} />
            </div>
          </div>
        </main>
      </AssetInfoViewProvider>
    );
  }
);

interface NavigationProps {
  tokenDetailsByLanguage?: { [key: string]: TokenCMSData } | null;
  coingeckoCoin?: CoingeckoCoin | null;
  denom: string;
}

const Navigation = observer((props: NavigationProps) => {
  const { tokenDetailsByLanguage, coingeckoCoin, denom } = props;
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
    () => favoritesList.includes(denom),
    [denom, favoritesList]
  );

  const toggleFavoriteList = useCallback(() => {
    if (isFavorite) {
      setFavoritesList(favoritesList.filter((item) => item !== denom));
    } else {
      setFavoritesList([...favoritesList, denom]);
    }
  }, [isFavorite, favoritesList, denom, setFavoritesList]);

  const chain = useMemo(
    () => chainStore.getChainFromCurrency(denom),
    [denom, chainStore]
  );

  const balances = useMemo(() => chain?.currencies ?? [], [chain?.currencies]);

  const coinGeckoId = useMemo(
    () =>
      details?.coingeckoID
        ? details?.coingeckoID
        : balances.find(
            (bal) => bal.coinDenom.toUpperCase() === denom.toUpperCase()
          )?.coinGeckoId,
    [balances, details?.coingeckoID, denom]
  );

  const title = useMemo(() => {
    if (details) {
      return details.name;
    }

    const currencies = ChainList.map(
      (info) => info.keplrChain.currencies
    ).reduce((a, b) => [...a, ...b]);

    const currency = currencies.find(
      (el) => el.coinDenom === denom.toUpperCase()
    );

    if (!currency) {
      return undefined;
    }

    const asset = getAssetFromAssetList({
      coinMinimalDenom: currency?.coinMinimalDenom,
      assetLists: AssetLists,
    });

    return asset?.rawAsset.name;
  }, [denom, details]);

  const twitterUrl = useMemo(() => {
    if (details?.twitterURL) {
      return details.twitterURL;
    }

    if (coingeckoCoin?.links?.twitter_screen_name) {
      return `${TWITTER_PUBLIC_URL}/${coingeckoCoin.links.twitter_screen_name}`;
    }
  }, [coingeckoCoin?.links?.twitter_screen_name, details?.twitterURL]);

  const websiteURL = useMemo(() => {
    if (details?.websiteURL) {
      return details.websiteURL;
    }

    if (
      coingeckoCoin?.links?.homepage &&
      coingeckoCoin.links.homepage.length > 0
    ) {
      return coingeckoCoin.links.homepage.filter((link) => link.length > 0)[0];
    }
  }, [coingeckoCoin?.links?.homepage, details?.websiteURL]);

  const coingeckoURL = useMemo(() => {
    if (coinGeckoId) {
      return `${COINGECKO_PUBLIC_URL}/en/coins/${coinGeckoId}`;
    }
  }, [coinGeckoId]);

  return (
    <nav className="flex w-full flex-wrap justify-between gap-2">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-h4 font-h4">{denom}</h1>
        {title ? (
          <h2 className="text-h4 font-h4 text-osmoverse-300">{title}</h2>
        ) : (
          false
        )}
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
            priceHeaderClass: "!text-h2 !font-h2 sm:!text-h4",
          }}
        />
      </SkeletonLoader>
    </header>
  );
});

const useNumTicks = () => {
  const { assetInfoConfig } = useAssetInfoView();
  const { isMobile, isLargeDesktop, isExtraLargeDesktop } = useWindowSize();

  const numTicks = useMemo(() => {
    let ticks: number | undefined = isMobile ? 3 : 6;

    if (isExtraLargeDesktop) {
      return 10;
    }

    if (isLargeDesktop) {
      return 8;
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
  }, [
    assetInfoConfig.historicalRange,
    isMobile,
    isLargeDesktop,
    isExtraLargeDesktop,
  ]);

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

const findIBCToken = (imperatorToken: ImperatorToken) => {
  const ibcAsset = AssetLists.flatMap(({ assets }) => assets).find(
    (asset) => asset.base === imperatorToken.denom
  );

  return ibcAsset;
};

/* const findTokenDenom = (imperatorToken: ImperatorToken): string | undefined => {
  const native = !imperatorToken.denom.includes("ibc/");

  if (native) {
    return imperatorToken.symbol;
  } else {
    const token = findIBCToken(imperatorToken);

    if (token) {
      return token.coinDenom;
    }
  }
}; */

let cachedTokens: ImperatorToken[] = [];

/**
 * Prerender all the denoms, we can also filter this value to reduce
 * build time
 */
export const getStaticPaths = async (): Promise<GetStaticPathsResult> => {
  let paths: { params: { denom: string } }[] = [];

  const currencies = ChainList.map((info) => info.keplrChain.currencies).reduce(
    (a, b) => [...a, ...b]
  );

  /**
   * Add cache for all available currencies
   */
  paths = currencies.map((currency) => ({
    params: {
      denom: URBIT_DEPLOYMENT
        ? currency.coinDenom.toLowerCase()
        : currency.coinDenom,
    },
  }));

  return {
    paths,
    // Set fallback false when static export is enabled
    fallback: process.env.STATIC_EXPORT === "true" ? false : "blocking",
  };
};

export const getStaticProps: GetStaticProps<AssetInfoPageProps> = async ({
  params,
}) => {
  let tweets: RichTweet[] = [];
  let tokenDenom = (params?.denom as string).toUpperCase();
  let tokenDetailsByLanguage: { [key: string]: TokenCMSData } | null = null;
  let coingeckoCoin: CoingeckoCoin | null = null;
  let imperatorDenom: string | null = null;

  if (cachedTokens.length === 0) {
    try {
      cachedTokens = await queryAllTokens();
    } catch (e) {
      console.error("Failed to retrieved tokens from imperator api: ", e);
    }
  }

  /**
   * Get all the availables currencies
   */
  const currencies = ChainList.map((info) => info.keplrChain.currencies).reduce(
    (a, b) => [...a, ...b]
  );

  /**
   * Lookup for the current token
   */
  const token = currencies.find(
    (currency) =>
      currency.coinDenom.toUpperCase() === tokenDenom.toLocaleUpperCase()
  );

  /**
   * Lookup token denom on imperator registry
   *
   * We'll use it for query such as chart timeframe ecc.
   */
  imperatorDenom =
    cachedTokens.find((cachedToken) => {
      const ibcToken = findIBCToken(cachedToken);

      return ibcToken?.symbol.toUpperCase() === token?.coinDenom.toUpperCase();
    })?.symbol ?? null;

  /**
   * If not found lookup for native asset
   */
  if (!imperatorDenom) {
    imperatorDenom =
      cachedTokens.find(
        (el) => el.display.toUpperCase() === tokenDenom.toUpperCase()
      )?.symbol ?? null;
  }

  if (tokenDenom) {
    try {
      tokenDetailsByLanguage = Object.fromEntries(
        await Promise.all(
          SUPPORTED_LANGUAGES.map(async (lang) => {
            try {
              const res = await getTokenInfo(tokenDenom, lang.value);

              return [lang.value, res];
            } catch (error) {}

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
  }

  return {
    props: {
      tokenDenom,
      tokenDetailsByLanguage,
      coingeckoCoin,
      tweets,
      imperatorDenom,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 7200 seconds (2 hours)
    // Set revalidate to false when static export is enabled
    revalidate: process.env.STATIC_EXPORT === "true" ? false : 7200, // In seconds
  };
};
