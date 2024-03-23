import type { NextPage } from "next";
import { NextSeo } from "next-seo";

import { AssetsPageV1 } from "~/components/complex/assets-page-v1";
import { AssetsPageV2 } from "~/components/complex/assets-page-v2";
import { useFeatureFlags, useTranslation } from "~/hooks";

const Assets: NextPage = () => {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();

  if (!featureFlags._isInitialized) {
    return (
      <NextSeo
        title={t("seo.assets.title")}
        description={t("seo.assets.description")}
      />
    );
  }

  return (
    <>
      <NextSeo
        title={t("seo.assets.title")}
        description={t("seo.assets.description")}
      />
      {featureFlags.portfolioPageAndNewAssetsPage ? (
        <AssetsPageV2 />
      ) : (
        <AssetsPageV1 />
      )}
    </>
  );
};

export default Assets;
