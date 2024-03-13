import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDimension,
  useNavBar,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { AssetsInfoTable } from "../table/asset-info";

export const AssetsPageV2: FunctionComponent = observer(() => {
  const { accountStore, chainStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { t } = useTranslation();
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { startBridge, bridgeAsset } = useBridge();
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

  const { data: value } = api.edge.assets.getUserAssetsBreakdown.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
    },
    {
      enabled: !!account && !isWalletLoading,

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  const [valuesRef, { height: valuesHeight }] = useDimension<HTMLDivElement>();

  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <div ref={valuesRef}>
        <h2>Total Value {value?.aggregatedValue.toString()}</h2>
        <span>{value?.aggregated.map((c) => c.toString()).join("______")}</span>

        <h2>Pooled Value {value?.pooledValue.toString()}</h2>
        <span>{value?.pooled.map((c) => c.toString()).join("______")}</span>

        <h2>Available Value {value?.availableValue.toString()}</h2>
        <span>{value?.available.map((c) => c.toString()).join("______")}</span>

        <h2>Delegated Value {value?.delegatedValue.toString()}</h2>
        <span>{value?.delegated.toString()}</span>
      </div>

      <AssetsInfoTable
        tableTopPadding={valuesHeight}
        onDeposit={(coinMinimalDenom) => {
          bridgeAsset(coinMinimalDenom, "deposit");
        }}
        onWithdraw={(coinMinimalDenom) => {
          bridgeAsset(coinMinimalDenom, "withdraw");
        }}
      />
    </main>
  );
});
