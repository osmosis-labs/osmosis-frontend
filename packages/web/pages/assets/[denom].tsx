import {
  getActiveCoingeckoCoins,
  getAssetMarketActivity,
  RichTweet,
  Twitter,
} from "@osmosis-labs/server";
import { sort } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { useUnmount } from "react-use";

import { AlloyedAssetsSection } from "~/components/alloyed-assets";
import { LinkButton } from "~/components/buttons/link-button";
import { TokenChart } from "~/components/pages/asset-info-page/token-chart";
import { TokenDetails } from "~/components/pages/asset-info-page/token-details";
import { TokenNavigation } from "~/components/pages/asset-info-page/token-navigation";
import { TokenPools } from "~/components/pages/asset-info-page/token-pools";
import { TwitterSection } from "~/components/pages/asset-info-page/twitter-section";
import { YourBalance } from "~/components/pages/asset-info-page/your-balance";
import { SwapTool } from "~/components/swap-tool";
import { EventName } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useAssetInfoConfig, useFeatureFlags, useNavBar } from "~/hooks";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { AssetInfoViewProvider } from "~/hooks/use-asset-info-view";
import { SUPPORTED_LANGUAGES } from "~/stores/user-settings";
import { trpcHelpers } from "~/utils/helpers";

type AssetInfoPageProps = InferGetStaticPropsType<typeof getStaticProps>;

const AssetInfoPage = observer((props: AssetInfoPageProps) => {
  const featureFlags = useFeatureFlags();
  const router = useRouter();

  const { token } = useAssetInfo();

  useEffect(() => {
    if (
      (typeof featureFlags.tokenInfo !== "undefined" &&
        !featureFlags.tokenInfo) ||
      !token
    ) {
      router.push("/assets");
    }
  }, [featureFlags.tokenInfo, router, token]);

  return <AssetInfoView {...props} />;
});

const AssetInfoView = observer(({ tweets }: AssetInfoPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { title, details, coinGeckoId, token } = useAssetInfo();

  if (!token) {
    return null;
  }

  const assetInfoConfig = useAssetInfoConfig(
    token.coinDenom,
    token.coinMinimalDenom,
    coinGeckoId
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
        ariaLabel={ref === "portfolio" ? t("menu.portfolio") : t("menu.assets")}
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

  const SwapTool_ = (
    <SwapTool
      fixedWidth
      useQueryParams={false}
      useOtherCurrencies={true}
      initialSendTokenDenom={token.coinDenom === "USDC" ? "OSMO" : "USDC"}
      initialOutTokenDenom={token.coinDenom}
      page="Token Info Page"
    />
  );

  return (
    <AssetInfoViewProvider value={contextValue}>
      <NextSeo
        title={`${
          title ? `${title} (${token.coinDenom})` : token.coinDenom
        } | Osmosis`}
        description={details?.description}
      />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-10 xs:px-2">
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
        <div className="grid grid-cols-tokenpage gap-4 xl:flex xl:flex-col">
          <div className="flex flex-col gap-12 sm:gap-4">
            <div className="flex flex-col gap-5">
              <TokenNavigation />
              <TokenChart />
            </div>
            <TokenPools denom={token.coinDenom} />
            <div className="w-full xl:flex xl:gap-4 1.5lg:flex-col">
              <div className="hidden w-[26.875rem] shrink-0 xl:order-1 xl:block 1.5lg:order-none 1.5lg:w-full">
                {SwapTool_}
              </div>
            </div>
            <TokenDetails token={token} />
            <TwitterSection tweets={tweets} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="xl:hidden">{SwapTool_}</div>
            <YourBalance />
            {token.isAlloyed && token.contract ? (
              <AlloyedAssetsSection
                title={title ?? token.coinDenom}
                denom={token.coinDenom}
                contractAddress={token.contract}
              />
            ) : null}
          </div>
        </div>
      </main>
    </AssetInfoViewProvider>
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

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  let tweets: RichTweet[] = [];
  const tokenDenom = params?.denom as string;

  try {
    /**
     * Lookup for the current token
     */

    await trpcHelpers.edge.assets.getUserAsset.prefetch({
      findMinDenomOrSymbol: tokenDenom,
    });

    if (tokenDenom) {
      try {
        const tokenDetailsByLanguage =
          await trpcHelpers.local.cms.getTokenInfos.fetch({
            coinDenom: tokenDenom,
            langs: SUPPORTED_LANGUAGES.map((lang) => lang.value),
          });

        const tokenDetails = tokenDetailsByLanguage
          ? tokenDetailsByLanguage["en"]
          : undefined;

        if (tokenDetails) {
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
      tweets,
      trpcState: trpcHelpers.dehydrate(),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 7200 seconds (2 hours)
    revalidate: 7200, // In seconds
  };
};
