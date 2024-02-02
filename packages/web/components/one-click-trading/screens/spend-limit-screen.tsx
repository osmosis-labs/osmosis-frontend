import { useState } from "react";

import { MenuToggle } from "~/components/control";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { useTranslation } from "~/hooks";

type SpendLimitViews = "fixed-amount" | "share-of-balance";
interface SpendLimitScreenProps extends OneClickTradingBaseScreenProps {}

export const SpendLimitScreen = ({
  goBackButton,
  transaction1CTParams,
  setTransaction1CTParams,
}: SpendLimitScreenProps) => {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] =
    useState<SpendLimitViews>("fixed-amount");

  return (
    <>
      {goBackButton}
      <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
        {t("oneClickTrading.settings.spendLimitTitle")}
      </h1>
      <div className="flex h-full flex-col items-center">
        <MenuToggle
          options={
            [
              { id: "fixed-amount", display: "Fixed amount" },
              { id: "share-of-balance", display: "Share of balance" },
            ] as { id: SpendLimitViews; display: string }[]
          }
          selectedOptionId={selectedView}
          onSelect={(optionId) => setSelectedView(optionId as SpendLimitViews)}
          classes={{
            root: "max-w-xs w-full",
          }}
        />

        <ScreenManager currentScreen={selectedView}>
          <Screen screenName="fixed-amount">Fixed amount</Screen>
          <Screen screenName="share-of-balance">Share of balance</Screen>
        </ScreenManager>
      </div>
    </>
  );
};
