import type { NextPage } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { useEffect } from "react";

import { DiscoverPage } from "~/components/complex/discover-page";
import { useFeatureFlags, useTranslation } from "~/hooks";

const Discover: NextPage = () => {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();
  const router = useRouter();

  useEffect(() => {
    if (
      featureFlags._isInitialized &&
      !featureFlags.portfolioAndDiscoverPages &&
      router.isReady
    ) {
      router.push("/assets");
    }
  }, [
    featureFlags._isInitialized,
    featureFlags.portfolioAndDiscoverPages,
    router,
  ]);

  if (!featureFlags._isInitialized) {
    return (
      <NextSeo
        title={t("seo.discover.title")}
        description={t("seo.discover.description")}
      />
    );
  }

  return (
    <>
      <NextSeo
        title={t("seo.discover.title")}
        description={t("seo.discover.description")}
      />
      <DiscoverPage />
    </>
  );
};

export default Discover;
