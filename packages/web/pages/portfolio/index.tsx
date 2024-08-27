import type { NextPage } from "next";
import { NextSeo } from "next-seo";

import { AssetsPageV1 } from "~/components/complex/assets-page-v1";
import { PortfolioPage } from "~/components/complex/portfolio/portfolio-page";
import { useFeatureFlags, useTranslation } from "~/hooks";

// New assets and portfolio page launches are controlled by 2 separate flags:
// * New assets page: replace assets page with new assets page, move old assets page to new portfolio page
// * Portfolio and assets page: repeat above, but also replace old assets page (living in porfolio page) with new portfolio page

const Portfolio: NextPage = () => {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();

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
      {featureFlags.newPortfolioPage ? <PortfolioPage /> : <AssetsPageV1 />}
    </>
  );
};

export default Portfolio;
