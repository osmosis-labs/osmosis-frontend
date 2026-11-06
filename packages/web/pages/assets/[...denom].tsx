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
import { FunctionComponent, memo, useEffect, useMemo } from "react";
import { useLocalStorage } from "react-use";

import { AlloyedAssetsSection } from "~/components/alloyed-assets";
import { Icon } from "~/components/assets";
import { LinkButton } from "~/components/buttons/link-button";
import { LinkifiedText } from "~/components/linkified-text";
import { AssetBalance } from "~/components/pages/asset-info-page/balance";
import { AssetPriceChart } from "~/components/pages/asset-info-page/chart";
import {
  AssetDetails,
  AssetStats,
} from "~/components/pages/asset-info-page/details";
import { AssetNavigation } from "~/components/pages/asset-info-page/navigation";
import { AssetOrderHistory } from "~/components/pages/asset-info-page/orders";
import { AssetPools } from "~/components/pages/asset-info-page/pools";
import {
  USDC_BASE_DENOM,
  USDT_BASE_DENOM,
} from "~/components/place-limit-tool/defaults";
import { SwapToolProps } from "~/components/swap-tool";
import { TradeTool } from "~/components/trade-tool";
import {
  useAssetInfoConfig,
  useFeatureFlags,
  useNavBar,
  useTranslation,
} from "~/hooks";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { AssetInfoViewProvider } from "~/hooks/use-asset-info-view";
import { PreviousTrade, SwapPreviousTradeKey } from "~/pages";
import { createTrpcHelpers } from "~/utils/helpers";

type AssetInfoPageStaticProps = InferGetStaticPropsType<typeof getStaticProps>;

const AssetInfoPage: FunctionComponent<AssetInfoPageStaticProps> = memo(
  (props) => {
    const featureFlags = useFeatureFlags();
    const router = useRouter();

    const { asset: token, denom, isAssetLoading } = useAssetInfo();

    useEffect(() => {
      if (
        (typeof featureFlags.tokenInfo !== "undefined" &&
          !featureFlags.tokenInfo) ||
        (!isAssetLoading && !token)
      ) {
        router.push("/assets");
      }
    }, [denom, featureFlags.tokenInfo, isAssetLoading, router, token]);

    if (!token) return;

    return <AssetInfoView {...props} />;
  }
);

const AssetInfoView: FunctionComponent<AssetInfoPageStaticProps> = memo(() => {
  const { t } = useTranslation();
  const router = useRouter();
  const [previousTrade, setPreviousTrade] =
    useLocalStorage<PreviousTrade>(SwapPreviousTradeKey);

  const {
    title,
    coinGeckoId,
    asset,
    description,
    denom: routerDenom,
  } = useAssetInfo();

  useEffect(() => {
    if (asset?.coinMinimalDenom && routerDenom !== asset.coinMinimalDenom) {
      router.push(`/assets/${encodeURIComponent(asset.coinMinimalDenom)}`);
    }
  }, [asset, router, routerDenom]);

  const assetInfoConfig = useAssetInfoConfig(
    asset.coinDenom,
    asset.coinMinimalDenom,
    coinGeckoId,
    true
  );

  const swapToolProps: SwapToolProps = useMemo(
    () => ({
      fixedWidth: true,
      useQueryParams: false,
      useOtherCurrencies: true,
      initialSendTokenDenom:
        asset.coinMinimalDenom === USDC_BASE_DENOM ? "uosmo" : USDC_BASE_DENOM,
      initialOutTokenDenom: asset.coinMinimalDenom,
    }),
    [asset.coinMinimalDenom]
  );
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

  const contextValue = useMemo(
    () => ({
      assetInfoConfig,
    }),
    [assetInfoConfig]
  );

  if (!asset) {
    return null;
  }

  /**
   * Give the Buy/Sell tools a valid quote from the first render. An empty
   * or same-as-asset quote would only be fixed by an effect after the
   * Buy/Sell click, which is the pattern that froze this page.
   */
  const quoteDenom =
    previousTrade?.quoteDenom &&
    previousTrade.quoteDenom !== asset.coinMinimalDenom
      ? previousTrade.quoteDenom
      : asset.coinMinimalDenom === USDC_BASE_DENOM
        ? USDT_BASE_DENOM
        : USDC_BASE_DENOM;

  const tradeToolProps = {
    swapToolProps,
    setPreviousTrade,
    previousTrade: {
      baseDenom: asset.coinMinimalDenom,
      sendTokenDenom: swapToolProps.initialSendTokenDenom ?? "",
      outTokenDenom: swapToolProps.initialOutTokenDenom ?? "",
      quoteDenom,
    },
  };

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
        description={description}
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
            {asset.tooltipMessage && (
              <div className="flex items-start gap-3 rounded-2xl border border-osmoverse-700 bg-osmoverse-825 p-4">
                <Icon
                  id="info"
                  className="mt-0.5 h-5 w-5 shrink-0 text-osmoverse-300"
                />
                <LinkifiedText
                  text={asset.tooltipMessage}
                  className="body2 text-osmoverse-200"
                />
              </div>
            )}
            <AssetDetails />
            <AssetStats className="hidden xl:flex" />
            <AssetPools
              coinMinimalDenom={asset.coinMinimalDenom}
              coinDenom={asset.coinDenom}
            />
            <div className="w-full xl:flex xl:gap-4 1.5lg:flex-col">
              <div className="hidden w-[26.875rem] shrink-0 xl:order-1 xl:block 1.5lg:order-none 1.5lg:w-full">
                <TradeTool {...tradeToolProps}>
                  <AssetOrderHistory />
                </TradeTool>
              </div>
            </div>
            {!asset.areTransfersDisabled && asset.contract ? (
              <AlloyedAssetsSection
                className="hidden xl:block"
                title={title ?? asset.coinDenom}
                denom={asset.coinDenom}
                coinMinimalDenom={asset.coinMinimalDenom}
                contractAddress={asset.contract}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-11 sm:gap-10">
            <div className="xl:hidden">
              <TradeTool {...tradeToolProps}>
                <AssetOrderHistory />
              </TradeTool>
            </div>
            <AssetBalance className="xl:hidden" />
            <AssetStats className="xl:hidden" />
            {!asset.areTransfersDisabled && asset.contract ? (
              <AlloyedAssetsSection
                className="xl:hidden"
                title={title ?? asset.coinDenom}
                denom={asset.coinDenom}
                coinMinimalDenom={asset.coinMinimalDenom}
                contractAddress={asset.contract}
              />
            ) : null}
          </div>
        </div>
      </main>
    </AssetInfoViewProvider>
  );
});

export default AssetInfoPage;

/**
 * Asset page paths prerendered at build: those with 200+ weekly views on
 * app.osmosis.zone (Cloudflare analytics, 7 days to 2026-11-02). Pages are cached by path, so a
 * symbol and its denom (`OSMO`, `uosmo`) are separate entries.
 *
 * The list is fixed so the build makes no network calls and renders the same
 * pages every time. Rendering them also fails the build if this page breaks.
 * Every other path renders on its first request (`fallback: "blocking"`). An
 * entry that leaves the asset list still renders; it just has no prefetched asset.
 */
const BUILD_TIME_ASSET_PATHS = [
  "ibc/BC26A7A805ECD6822719472BCB7842A48EF09DF206182F8F259B2593EB5D23FB", // ATONE
  "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228", // HUAHUA
  "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2", // HASH
  "uosmo",
  "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4", // L1
  "ATONE",
  "BTC",
  "HASH",
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
  "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC",
  "OSMO",
  // ETH, below the cutoff (48-82 weekly views) but kept alongside BTC.
  "ETH",
  "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH",
  "WETH",
];

export const getStaticPaths = async (): Promise<GetStaticPathsResult> => ({
  paths: BUILD_TIME_ASSET_PATHS.map((path) => ({
    params: { denom: path.split("/") },
  })),
  fallback: "blocking",
});

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const denom = params?.denom as string[];
  const tokenDenom = denom.join("/");
  const trpcHelpers = createTrpcHelpers();

  try {
    /**
     * Lookup for the current token
     */

    await trpcHelpers.edge.assets.getUserAsset.fetch({
      findMinDenomOrSymbol: tokenDenom,
    });
  } catch (e) {
    console.error(e);
  }

  return {
    props: {
      trpcState: trpcHelpers.dehydrate(),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 7200 seconds (2 hours)
    revalidate: 7200, // In seconds
  };
};
