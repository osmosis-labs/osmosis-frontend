import { Dec } from "@keplr-wallet/unit";
import {
  CoingeckoCoin,
  getActiveCoingeckoCoins,
  getAsset,
  getAssetMarketActivity,
  getTokenInfo,
  queryCoingeckoCoin,
  RichTweet,
  TokenCMSData,
  Twitter,
} from "@osmosis-labs/server";
import { getAssetFromAssetList, sort } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { GetStaticPathsResult, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { useQueryState } from "nuqs";
import { FunctionComponent } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { useUnmount } from "react-use";

import { Icon } from "~/components/assets";
import LinkButton from "~/components/buttons/link-button";
import {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/price-historical";
import HistoricalPriceChartV2 from "~/components/chart/price-historical-v2";
import Spinner from "~/components/loaders/spinner";
import { SwapTool } from "~/components/swap-tool";
import TokenDetails from "~/components/token-details/token-details";
import TwitterSection from "~/components/twitter-section/twitter-section";
import { LinkIconButton } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import YourBalance from "~/components/your-balance/your-balance";
import { COINGECKO_PUBLIC_URL, EventName, TWITTER_PUBLIC_URL } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import {
  ObservableAssetInfoConfig,
  useAmplitudeAnalytics,
  useCurrentLanguage,
  useTranslation,
  useUserWatchlist,
} from "~/hooks";
import { useAssetInfoConfig, useFeatureFlags, useNavBar } from "~/hooks";
import { useStore } from "~/stores";
import { SUPPORTED_LANGUAGES } from "~/stores/user-settings";
import { getPriceExtendedFormatOptions } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";
import { createContext } from "~/utils/react-context";
import { api } from "~/utils/trpc";

interface AssetInfoPageProps {
  tweets: RichTweet[];
  tokenDenom: string;
  tokenMinimalDenom?: string;
  tokenDetailsByLanguage?: {
    [key: string]: TokenCMSData;
  } | null;
  coingeckoCoin?: CoingeckoCoin | null;
}

const AssetInfoPage: FunctionComponent<AssetInfoPageProps> = observer(
  ({ tokenDenom, ...rest }) => {
    const featureFlags = useFeatureFlags();
    const router = useRouter();

    useEffect(() => {
      if (
        (typeof featureFlags.tokenInfo !== "undefined" &&
          !featureFlags.tokenInfo) ||
        !tokenDenom
      ) {
        router.push("/assets");
      }
    }, [featureFlags.tokenInfo, router, tokenDenom]);

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
  ({
    tokenDenom,
    tokenMinimalDenom,
    tweets,
    tokenDetailsByLanguage,
    coingeckoCoin,
  }) => {
    const { t } = useTranslation();
    const language = useCurrentLanguage();
    const router = useRouter();

    const assetInfoConfig = useAssetInfoConfig(
      tokenDenom,
      tokenMinimalDenom,
      coingeckoCoin?.id
    );

    useAmplitudeAnalytics({
      onLoadEvent: [
        EventName.TokenInfo.pageViewed,
        { tokenName: router.query.denom as string },
      ],
    });

    const [ref] = useQueryState("ref");

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
          label={ref === "portfolio" ? t("menu.portfolio") : t("menu.assets")}
          ariaLabel={
            ref === "portfolio" ? t("menu.portfolio") : t("menu.assets")
          }
          href={ref === "portfolio" ? "/portfolio" : "/assets"}
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

    // const routablePools = useRoutablePools();

    const denom = useMemo(() => {
      return tokenDenom as string;
    }, [tokenDenom]);

    const details = useMemo(() => {
      return tokenDetailsByLanguage
        ? tokenDetailsByLanguage[language]
        : undefined;
    }, [language, tokenDetailsByLanguage]);

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

    const SwapTool_ = (
      <SwapTool
        fixedWidth
        useQueryParams={false}
        useOtherCurrencies={true}
        initialSendTokenDenom={denom === "USDC" ? "OSMO" : "USDC"}
        initialOutTokenDenom={denom}
        page="Token Info Page"
      />
    );

    return (
      <AssetInfoViewProvider value={contextValue}>
        <NextSeo
          title={`${title ? `${title} (${denom})` : denom} | Osmosis`}
          description={details?.description}
        />
        <main className="flex flex-col gap-8 p-8 py-4 xs:px-2">
          <LinkButton
            className="mr-auto hidden md:flex"
            icon={
              <Image
                alt="left"
                src="/icons/arrow-left.svg"
                width={24}
                height={24}
                className="text-osmoverse-200"
              />
            }
            label={t("menu.assets")}
            ariaLabel={t("menu.assets")}
            href="/assets"
          />
          <Navigation
            denom={denom}
            tokenDetailsByLanguage={tokenDetailsByLanguage}
            coingeckoCoin={coingeckoCoin}
          />
          <div className="grid grid-cols-tokenpage gap-4 xl:flex xl:flex-col">
            <div className="flex flex-col gap-4">
              <TokenChartSection />
              <div className="w-full xl:flex xl:gap-4 1.5lg:flex-col">
                <div className="hidden w-[26.875rem] shrink-0 xl:order-1 xl:block 1.5lg:order-none 1.5lg:w-full">
                  {SwapTool_}
                </div>
                <YourBalance
                  className="xl:flex-grow"
                  denom={denom}
                  tokenDetailsByLanguage={tokenDetailsByLanguage}
                />
              </div>
              <TokenDetails
                denom={denom}
                tokenDetailsByLanguage={tokenDetailsByLanguage}
                coingeckoCoin={coingeckoCoin}
              />
              <TwitterSection tweets={tweets} />
            </div>

            <div className="flex flex-col gap-4">
              <div className="xl:hidden">{SwapTool_}</div>

              {/* {routablePools && (
                <RelatedAssets memoedPools={routablePools} tokenDenom={denom} />
              )} */}
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
  const { watchListDenoms, toggleWatchAssetDenom } = useUserWatchlist();

  const details = useMemo(() => {
    return tokenDetailsByLanguage
      ? tokenDetailsByLanguage[language]
      : undefined;
  }, [language, tokenDetailsByLanguage]);

  const chain = useMemo(
    () => chainStore.getChainFromCurrency(denom),
    [denom, chainStore]
  );

  const currencies = useMemo(
    () => chain?.currencies ?? [],
    [chain?.currencies]
  );

  const coinGeckoId = useMemo(
    () =>
      details?.coingeckoID
        ? details?.coingeckoID
        : currencies.find(
            (bal) => bal.coinDenom.toUpperCase() === denom.toUpperCase()
          )?.coinGeckoId,
    [currencies, details?.coingeckoID, denom]
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

      <div className="flex items-center justify-center gap-2">
        <Button
          size="md"
          variant="ghost"
          className="group flex gap-2 rounded-xl bg-osmoverse-850 px-4 py-2 font-semibold text-osmoverse-300 hover:bg-osmoverse-700 active:bg-osmoverse-800"
          aria-label="Add to watchlist"
          onClick={() => toggleWatchAssetDenom(denom)}
        >
          <Icon
            id="star"
            className={`text-wosmongton-300 ${
              watchListDenoms.includes(denom)
                ? ""
                : "opacity-30 group-hover:opacity-100"
            } `}
          />
          {t("tokenInfos.watchlist")}
        </Button>
        {twitterUrl && (
          <LinkIconButton
            href={twitterUrl}
            target="_blank"
            rel="external"
            aria-label={t("tokenInfos.ariaViewOn", { name: "X" })}
            icon={<Icon className="h-4 w-4 text-osmoverse-400" id="X" />}
          />
        )}
        {websiteURL && (
          <LinkIconButton
            href={websiteURL}
            target="_blank"
            rel="external"
            aria-label={t("tokenInfos.ariaView", { name: "website" })}
            icon={<Icon className="h-6 w-6 text-osmoverse-400" id="web" />}
          />
        )}
        {coingeckoURL && (
          <LinkIconButton
            href={coingeckoURL}
            target="_blank"
            rel="external"
            aria-label={t("tokenInfos.ariaViewOn", { name: "CoinGecko" })}
            icon={
              <Icon className="h-9 w-9 text-osmoverse-300" id="coingecko" />
            }
          />
        )}
      </div>
    </nav>
  );
});

const TokenChartSection = () => {
  return (
    <section className="flex flex-col justify-between gap-3 overflow-hidden rounded-5xl bg-osmoverse-850 pb-8 md:pb-6">
      <div className="p-8 pb-0 md:p-6">
        <TokenChartHeader />
      </div>
      <TokenChart />
    </section>
  );
};

const TokenChartHeader = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();

  const { data: assetPrice, isLoading } =
    api.edge.assets.getAssetPrice.useQuery(
      {
        coinMinimalDenom: assetInfoConfig.coinMinimalDenom!,
      },
      {
        enabled: assetInfoConfig.coinMinimalDenom !== undefined,
      }
    );

  const hoverPrice = useMemo(() => {
    let price = new Dec(0);
    const decHoverPrice = assetInfoConfig.hoverPrice?.toDec();

    if (decHoverPrice && !decHoverPrice.isZero()) {
      price = decHoverPrice;
    } else if (assetPrice) {
      price = assetPrice.toDec();
    }

    return Number(price.toString());
  }, [assetInfoConfig.hoverPrice, assetPrice]);

  const fiatSymbol =
    assetInfoConfig.hoverPrice?.fiatCurrency?.symbol ??
    assetPrice?.fiatCurrency.symbol;

  const minimumDecimals = 2;
  const maxDecimals = Math.max(getDecimalCount(hoverPrice), minimumDecimals);

  const formatOpts = useMemo(
    () => getPriceExtendedFormatOptions(new Dec(hoverPrice)),
    [hoverPrice]
  );

  return (
    <header>
      <PriceChartHeader
        isLoading={isLoading}
        formatOpts={formatOpts}
        decimal={maxDecimals}
        showAllRange
        hoverPrice={hoverPrice}
        hoverDate={assetInfoConfig.hoverDate}
        historicalRange={assetInfoConfig.historicalRange}
        setHistoricalRange={assetInfoConfig.setHistoricalRange}
        fiatSymbol={fiatSymbol}
        classes={{
          priceHeaderClass: "!text-h2 !font-h2 sm:!text-h4",
        }}
        compactZeros
      />
    </header>
  );
});

const TokenChart = observer(() => {
  const { assetInfoConfig } = useAssetInfoView();

  return (
    <div className="h-[370px] w-full xl:h-[250px]">
      {assetInfoConfig.isHistoricalDataLoading ? (
        <div className="flex h-full flex-col items-center justify-center">
          <Spinner />
        </div>
      ) : !assetInfoConfig.historicalChartUnavailable ? (
        <>
          <HistoricalPriceChartV2
            data={assetInfoConfig.historicalChartData}
            onPointerHover={assetInfoConfig.setHoverPrice}
            onPointerOut={() => {
              assetInfoConfig.setHoverPrice(0, undefined);
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

/** Number of assets, sorted by volume, to generate static paths for. */
const TOP_VOLUME_ASSETS_COUNT = 50;

/**
 * Prerender important denoms. See function body for what we consider "important".
 */
export const getStaticPaths = async (): Promise<GetStaticPathsResult> => {
  let paths: { params: { denom: string } }[] = [];

  const assets = AssetLists.flatMap((list) => list.assets);
  const activeCoinGeckoIds = await getActiveCoingeckoCoins();

  const importantAssets = assets.filter(
    (asset) =>
      asset.verified &&
      !asset.unstable &&
      !asset.preview &&
      // Prevent repeated "coin not found" errors from CoinGecko coin query downsteram
      asset.coingeckoId &&
      activeCoinGeckoIds.has(asset.coingeckoId)
  );

  const marketAssets = (
    await Promise.all(
      importantAssets.map((asset) =>
        getAssetMarketActivity(asset).then((activity) => ({
          ...activity,
          ...asset,
        }))
      )
    )
  ).filter((asset): asset is NonNullable<typeof asset> => asset !== undefined);

  const topVolumeAssets = sort(marketAssets, "volume7d").slice(
    0,
    TOP_VOLUME_ASSETS_COUNT
  );
  /**
   * Add cache for all available currencies
   */
  paths = topVolumeAssets.map((asset) => ({
    params: {
      denom: asset.symbol,
    },
  }));

  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<AssetInfoPageProps> = async ({
  params,
}) => {
  let tweets: RichTweet[] = [];
  let tokenDenom = params?.denom as string;
  let tokenDetailsByLanguage: { [key: string]: TokenCMSData } | null = null;
  let coingeckoCoin: CoingeckoCoin | null = null;

  /**
   * Lookup for the current token
   */
  const token = getAsset({ anyDenom: tokenDenom, assetLists: AssetLists });

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
          coingeckoCoin =
            (await queryCoingeckoCoin(tokenDetails.coingeckoID)) ?? null;
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
      tokenDenom: token?.coinDenom ?? tokenDenom,
      tokenMinimalDenom: token.coinMinimalDenom,
      tokenDetailsByLanguage,
      coingeckoCoin,
      tweets,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 7200 seconds (2 hours)
    revalidate: 7200, // In seconds
  };
};
