import type { NextPage } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { useEffect } from "react";

import { PortfolioPage } from "~/components/complex/portfolio-page";
import { useFeatureFlags, useTranslation } from "~/hooks";

const Portfolio: NextPage = () => {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();
  const router = useRouter();

  useEffect(() => {
    if (
      featureFlags._isInitialized &&
      !featureFlags.portfolioPageAndNewAssetsPage &&
      router.isReady
    ) {
      router.push("/assets");
    }
  }, [
    featureFlags._isInitialized,
    featureFlags.portfolioPageAndNewAssetsPage,
    router,
  ]);

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
      <PortfolioPage />
    </>
  );
};

export default Portfolio;
