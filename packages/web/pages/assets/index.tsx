import type { NextPage } from "next";

import { AssetsPageV1 } from "~/components/complex/assets-page-v1";
import { AssetsPageV2 } from "~/components/complex/assets-page-v2";
import { useFeatureFlags } from "~/hooks/use-feature-flags";

const Assets: NextPage = () => {
  const flags = useFeatureFlags();

  // will lose SSR until we delete the old assets page and FF
  if (!flags._isInitialized) return null;

  return flags.newAssetsTable ? <AssetsPageV2 /> : <AssetsPageV1 />;
};

export default Assets;
