import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { useFeatureFlags } from "~/hooks";

const AssetInfoPage: NextPage = () => {
  const featureFlags = useFeatureFlags();
  const router = useRouter();
  const denom = router.query.denom as string;

  useEffect(() => {
    if (
      typeof featureFlags.tokenInfo !== "undefined" &&
      !featureFlags.tokenInfo
    ) {
      router.push("/assets");
    }
  }, [featureFlags.tokenInfo, router]);

  return <div className="flex">{denom}</div>;
};

export default AssetInfoPage;
