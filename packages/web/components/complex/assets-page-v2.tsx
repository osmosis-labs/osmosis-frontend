import { FunctionComponent } from "react";

import { EventName } from "~/config";
import { useAmplitudeAnalytics, useNavBar, useTranslation } from "~/hooks";
import { useBridge } from "~/hooks/bridge";

import { AssetsInfoTable } from "../table/asset-info";

export const AssetsPageV2: FunctionComponent = () => {
  const { t } = useTranslation();
  const { startBridge } = useBridge();
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });

  // set nav bar ctas
  useNavBar({
    ctas: [
      {
        label: t("assets.table.depositButton"),
        onClick: () => {
          startBridge("deposit");
          logEvent([EventName.Assets.depositClicked]);
        },
      },
      {
        label: t("assets.table.withdrawButton"),
        onClick: () => {
          startBridge("withdraw");
          logEvent([EventName.Assets.withdrawClicked]);
        },
      },
    ],
  });

  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <AssetsInfoTable tableTopPadding={0} />
    </main>
  );
};
