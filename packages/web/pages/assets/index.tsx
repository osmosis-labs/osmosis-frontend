import type { NextPage } from "next";

import { AssetsInfoTable } from "~/components/table/asset-info";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";

const Assets: NextPage = () => {
  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });

  return (
    <main className="mx-auto max-w-container p-8 pt-4 md:p-4">
      <AssetsInfoTable tableTopPadding={16} />
    </main>
  );
};

export default Assets;
