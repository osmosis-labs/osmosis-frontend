import type { NextPage } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { useEffect } from "react";

import { AssetsPageV1 } from "~/components/complex/assets-page-v1";
import { PortfolioPage } from "~/components/complex/portfolio-page";
import {  useTranslation } from "~/hooks";

// New assets and portfolio page launches are controlled by 2 separate flags:
// * New assets page: replace assets page with new assets page, move old assets page to new portfolio page
// * Portfolio and assets page: repeat above, but also replace old assets page (living in porfolio page) with new portfolio page

const Portfolio: NextPage = () => {
  const { t } = useTranslation();

  useRedirectToAssetsPage();

  if (!featureFlags._isInitialized) {
    return (
      <NextSeo
        title={t("seo.portfolio.title")}
        description={t("seo.portfolio.description")}
      />
    );
  }

  return (
    <>
      <NextSeo
        title={t("seo.portfolio.title")}
        description={t("seo.portfolio.description")}
      />
      {featureFlags.portfolioPageAndNewAssetsPage ? (
        <PortfolioPage />
      ) : (
        <AssetsPageV1 />
      )}
    </>
  );
};

/**  Redirect to assets page if neither new assets page (old page moves here)
     or new portfolio page is enabled */
function useRedirectToAssetsPage() {
  const router = useRouter();

  useEffect(() => {
    if (
      featureFlags._isInitialized &&
      !featureFlags.portfolioPageAndNewAssetsPage &&
      !featureFlags.newAssetsPage &&
      router.isReady
    ) {
      router.push("/assets");
    }
  }, [
    featureFlags._isInitialized,
    featureFlags.portfolioPageAndNewAssetsPage,
    featureFlags.newAssetsPage,
    router,
  ]);
}

export default Portfolio;
