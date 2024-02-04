import { useState } from "react";

import { MenuToggle } from "~/components/control";
import { InputBox } from "~/components/input";
import { OneClickTradingBaseScreenProps } from "~/components/one-click-trading/screens/types";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { isNumeric } from "~/utils/assertion";
import { api } from "~/utils/trpc";

type SpendLimitViews = "fixed-amount" | "share-of-balance";
interface SpendLimitScreenProps extends OneClickTradingBaseScreenProps {}

export const SpendLimitScreen = ({
  goBackButton,
  transaction1CTParams,
  setTransaction1CTParams,
}: SpendLimitScreenProps) => {
  const { t } = useTranslation();
  const { accountStore, chainStore } = useStore();
  const [selectedView, setSelectedView] =
    useState<SpendLimitViews>("fixed-amount");

  const [fixedAmountValue, setFixedAmountValue] = useState("");

  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { data: userAssetsBreakdown } =
    api.edge.assets.getUserAssetsBreakdown.useQuery(
      {
        userOsmoAddress: account?.address as string,
      },
      {
        enabled: true || (Boolean(account) && Boolean(account?.address)),
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  console.log(userAssetsBreakdown);

  const parse = (value: string) => {
    return value.replace("$", "");
  };

  const format = (value: string) => {
    return `$${value}`;
  };

  return (
    <>
      {goBackButton}
      <div className="flex flex-col items-center gap-6 px-16 ">
        <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
          {t("oneClickTrading.settings.spendLimitTitle")}
        </h1>
        <p className="text-center text-body2 font-body2 text-osmoverse-200">
          Set the maximum amount that you can spend within a 1-Click Trading
          session period.
        </p>
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
          <Screen screenName="fixed-amount">
            <InputBox
              rightEntry
              currentValue={format(fixedAmountValue)}
              onInput={(nextValue) => {
                const parsedValue = parse(nextValue);
                if (!isNumeric(parsedValue) && parsedValue !== "") return;
                setFixedAmountValue(parse(nextValue));
              }}
              trailingSymbol={
                <span className="ml-2 text-body1 font-body1 text-osmoverse-300">
                  USD
                </span>
              }
            />
          </Screen>
          <Screen screenName="share-of-balance">
            {userAssetsBreakdown?.aggregatedValue.toString()}
          </Screen>
        </ScreenManager>

        <p className="text-center text-caption font-caption text-osmoverse-200">
          Be advised that the USD value of your spend limit is based on the
          value of your assets which may fluctuate.
        </p>
      </div>
    </>
  );
};
