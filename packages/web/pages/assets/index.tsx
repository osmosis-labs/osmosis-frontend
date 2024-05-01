import type { NextPage } from "next";
import { NextSeo } from "next-seo";

import { AssetsPageV1 } from "~/components/complex/assets-page-v1";
import { AssetsPageV2 } from "~/components/complex/assets-page-v2";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useFeatureFlags,
  useTranslation,
} from "~/hooks";

// New assets and portfolio page launches are controlled by 2 separate flags:
// * New assets page: replace assets page with new assets page, move old assets page to new portfolio page
// * Portfolio and assets page: repeat above, but also replace old assets page (living in porfolio page) with new portfolio page

const Assets: NextPage = () => {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();

  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });

  if (!featureFlags._isInitialized) {
    return (
      <NextSeo
        title={t("seo.assets.title")}
        description={t("seo.assets.description")}
      />
    );
  }

  const useNewAssetsPage =
    featureFlags.portfolioPageAndNewAssetsPage || featureFlags.newAssetsPage;

  return (
    <>
      <NextSeo
        title={t("seo.assets.title")}
        description={t("seo.assets.description")}
      />
      {useNewAssetsPage ? <AssetsPageV2 /> : <AssetsPageV1 />}
    </>
  );
};

export default Assets;
