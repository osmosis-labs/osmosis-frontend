import {
  Asset,
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
import { FunctionComponent, useEffect, useMemo } from "react";
import { useUnmount } from "react-use";

import { AlloyedAssetsSection } from "~/components/alloyed-assets";
import { Icon } from "~/components/assets";
import { LinkButton } from "~/components/buttons/link-button";
import { TokenChart } from "~/components/pages/asset-info-page/token-chart";
import { TokenDetails } from "~/components/pages/asset-info-page/token-details";
import { TwitterSection } from "~/components/pages/asset-info-page/twitter-section";
import { SwapTool } from "~/components/swap-tool";
import { LinkIconButton } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { YourBalance } from "~/components/your-balance";
import { COINGECKO_PUBLIC_URL, EventName, TWITTER_PUBLIC_URL } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import {
  useAmplitudeAnalytics,
  useCurrentLanguage,
  useTranslation,
  useUserWatchlist,
} from "~/hooks";
import { useAssetInfoConfig, useFeatureFlags, useNavBar } from "~/hooks";
import { AssetInfoViewProvider } from "~/hooks/use-asset-info-view";
import { SUPPORTED_LANGUAGES } from "~/stores/user-settings";

interface AssetInfoPageProps {
  tweets: RichTweet[];
  tokenDenom: string;
  tokenMinimalDenom?: string | null;
  tokenDetailsByLanguage?: {
    [key: string]: TokenCMSData;
  } | null;
  coingeckoCoin?: CoingeckoCoin | null;
}

const AssetInfoPage: FunctionComponent<AssetInfoPageProps> = observer(
  ({ tokenDenom, tokenMinimalDenom, ...rest }) => {
    const featureFlags = useFeatureFlags();
    const router = useRouter();

    useEffect(() => {
      if (
        (typeof featureFlags.tokenInfo !== "undefined" &&
          !featureFlags.tokenInfo) ||
        !tokenDenom ||
        !tokenMinimalDenom
      ) {
        router.push("/assets");
      }
    }, [featureFlags.tokenInfo, router, tokenDenom, tokenMinimalDenom]);

    if (!tokenDenom) {
      return null; // TODO: Add skeleton loader
    }

    return (
      <AssetInfoView
        tokenDenom={tokenDenom}
        tokenMinimalDenom={tokenMinimalDenom}
        {...rest}
      />
    );
  }
);

const currencies = ChainList.flatMap((info) => info.keplrChain.currencies);

interface UseAssetInfoProps {
  denom: string;
  coingeckoCoin?: CoingeckoCoin | null;
  tokenDetailsByLanguage?: { [key: string]: TokenCMSData } | null;
}

const useAssetInfo = (props: UseAssetInfoProps) => {
  const { denom, coingeckoCoin, tokenDetailsByLanguage } = props;

  const language = useCurrentLanguage();

  const details = useMemo(() => {
    return tokenDetailsByLanguage
      ? tokenDetailsByLanguage[language]
      : undefined;
  }, [language, tokenDetailsByLanguage]);

  const coinGeckoId = useMemo(
    () =>
      details?.coingeckoID
        ? details?.coingeckoID
        : currencies.find(
            (bal) => bal.coinDenom.toUpperCase() === denom.toUpperCase()
          )?.coinGeckoId,
    [details?.coingeckoID, denom]
  );

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

  const asset = useMemo(() => {
    const currency = currencies.find(
      (el) => el.coinDenom.toUpperCase() === denom.toUpperCase()
    );

    if (!currency) {
      return undefined;
    }

    const asset = getAssetFromAssetList({
      coinMinimalDenom: currency?.coinMinimalDenom,
      assetLists: AssetLists,
    });

    return asset;
  }, [denom]);

  const title = useMemo(() => {
    if (details) {
      return details.name;
    }

    return asset?.rawAsset.name;
  }, [details, asset]);

  return {
    asset,
    title,
    details,
    twitterUrl,
    websiteURL,
    coingeckoURL,
  };
};

const AssetInfoView: FunctionComponent<AssetInfoPageProps> = observer(
  ({
    tokenDenom,
    tokenMinimalDenom,
    tweets,
    tokenDetailsByLanguage,
    coingeckoCoin,
  }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const assetInfoConfig = useAssetInfoConfig(
      tokenDenom,
      tokenMinimalDenom!,
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

    const { asset, title, details } = useAssetInfo({
      denom,
      tokenDetailsByLanguage,
    });

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
              <TokenChart />
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

            <div className="flex flex-col gap-8">
              <div className="xl:hidden">{SwapTool_}</div>

              {asset?.rawAsset?.isAlloyed && asset?.rawAsset?.contract ? (
                <AlloyedAssetsSection
                  title={title ?? denom}
                  denom={denom}
                  contractAddress={asset.rawAsset.contract}
                />
              ) : null}
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
  const { t } = useTranslation();
  const { watchListDenoms, toggleWatchAssetDenom } = useUserWatchlist();

  const { twitterUrl, websiteURL, coingeckoURL, title } = useAssetInfo({
    denom,
    tokenDetailsByLanguage,
    coingeckoCoin,
  });

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
  let token: Asset | null = null;

  try {
    /**
     * Lookup for the current token
     */
    token = getAsset({ anyDenom: tokenDenom, assetLists: AssetLists });

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
  } catch (e) {
    console.error(e);
  }

  return {
    props: {
      tokenDenom: token?.coinDenom ?? tokenDenom ?? null,
      tokenMinimalDenom: token?.coinMinimalDenom ?? null,
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
