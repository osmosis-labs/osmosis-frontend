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
import Script from "next/script";
import { NextSeo } from "next-seo";
import { useQueryState } from "nuqs";
import { FunctionComponent, useEffect, useMemo } from "react";
import { useUnmount } from "react-use";

import { AlloyedAssetsSection } from "~/components/alloyed-assets";
import { LinkButton } from "~/components/buttons/link-button";
import { AssetBalance } from "~/components/pages/asset-info-page/balance";
import { AssetPriceChart } from "~/components/pages/asset-info-page/chart";
import {
  AssetDetails,
  AssetStats,
} from "~/components/pages/asset-info-page/details";
import { AssetNavigation } from "~/components/pages/asset-info-page/navigation";
import { AssetPools } from "~/components/pages/asset-info-page/pools";
import { TwitterSection } from "~/components/pages/asset-info-page/twitter";
import { SwapToolProps } from "~/components/swap-tool/alt";
import { TradeTool } from "~/components/trade-tool";
import { EventName } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import {
  useAmplitudeAnalytics,
  useAssetInfoConfig,
  useFeatureFlags,
  useNavBar,
  useTranslation,
} from "~/hooks";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { AssetInfoViewProvider } from "~/hooks/use-asset-info-view";
import { SUPPORTED_LANGUAGES } from "~/stores/user-settings";
import { trpcHelpers } from "~/utils/helpers";

type AssetInfoPageStaticProps = InferGetStaticPropsType<typeof getStaticProps>;

const AssetInfoPage: FunctionComponent<AssetInfoPageStaticProps> = observer(
  (props) => {
    const featureFlags = useFeatureFlags();
    const router = useRouter();

    const { asset: token } = useAssetInfo();

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
  }
);

const AssetInfoView: FunctionComponent<AssetInfoPageStaticProps> = observer(
  ({ tweets }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const { title, details, coinGeckoId, asset: asset } = useAssetInfo();

    if (!asset) {
      return null;
    }

    const assetInfoConfig = useAssetInfoConfig(
      asset.coinDenom,
      asset.coinMinimalDenom,
      coinGeckoId
    );

    const swapToolProps: SwapToolProps = useMemo(
      () => ({
        fixedWidth: true,
        useQueryParams: false,
        useOtherCurrencies: true,
        initialSendTokenDenom: asset.coinDenom === "USDC" ? "OSMO" : "USDC",
        initialOutTokenDenom: asset.coinDenom,
        page: "Token Info Page",
      }),
      [asset.coinDenom]
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

    const SwapTool_ = (
      <TradeTool page="Token Info Page" swapToolProps={swapToolProps} />
    );

    return (
      <AssetInfoViewProvider value={contextValue}>
        <Script
          src="/tradingview/charting_library.standalone.js"
          strategy="afterInteractive"
        />
        <NextSeo
          title={`${
            title ? `${title} (${asset.coinDenom})` : asset.coinDenom
          } | Osmosis`}
          description={details?.description}
        />
        <main className="mx-auto flex max-w-7xl flex-col gap-8 px-10 pb-11 xs:px-2">
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
          <div className="grid grid-cols-tokenpage gap-11 xl:flex xl:flex-col sm:gap-10">
            <div className="flex flex-col gap-12 sm:gap-10">
              <div className="flex flex-col gap-5">
                <AssetNavigation />
                <AssetPriceChart />
              </div>
              <AssetBalance className="hidden xl:block" />
              <AssetDetails />
              <AssetStats className="hidden xl:flex" />
              <AssetPools denom={asset.coinDenom} />
              <div className="w-full xl:flex xl:gap-4 1.5lg:flex-col">
                <div className="hidden w-[26.875rem] shrink-0 xl:order-1 xl:block 1.5lg:order-none 1.5lg:w-full">
                  {SwapTool_}
                </div>
              </div>
              {!asset.areTransfersDisabled && asset.contract ? (
                <AlloyedAssetsSection
                  className="hidden xl:block"
                  title={title ?? asset.coinDenom}
                  denom={asset.coinDenom}
                  contractAddress={asset.contract}
                />
              ) : null}
              <TwitterSection tweets={tweets} />
            </div>

            <div className="flex flex-col gap-11 sm:gap-10">
              <div className="xl:hidden">{SwapTool_}</div>
              <AssetBalance className="xl:hidden" />
              <AssetStats className="xl:hidden" />
              {!asset.areTransfersDisabled && asset.contract ? (
                <AlloyedAssetsSection
                  className="xl:hidden"
                  title={title ?? asset.coinDenom}
                  denom={asset.coinDenom}
                  contractAddress={asset.contract}
                />
              ) : null}
            </div>
          </div>
        </main>
      </AssetInfoViewProvider>
    );
  }
);

export default AssetInfoPage;

/** Number of assets, sorted by volume, to generate static paths for. */
const TOP_VOLUME_ASSETS_COUNT = 50;

/**
 * Prerender important denoms. See function body for what we consider "important".
 */
export const getStaticPaths = async (): Promise<GetStaticPathsResult> => {
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
  const paths = topVolumeAssets.map((asset) => ({
    params: {
      denom: asset.symbol,
    },
  })) as { params: { denom: string } }[];

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
