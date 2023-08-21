import {
  AlertConfiguration,
  useNotifiClientContext,
  useNotifiSubscribe,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { TeamUpdateIcon } from "~/components/assets/notifi-alerts/team-update";
import { Button } from "~/components/buttons";
import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import {
  DummyRow,
  EVENT_TYPE_ID,
  HistoryRow,
} from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-rows";
import { LoadingCard } from "~/integrations/notifi/notifi-subscription-card/loading-card";

export const SignupView: FunctionComponent = () => {
  const t = useTranslation();
  const { client } = useNotifiClientContext();
  const [loading, setLoading] = useState(false);
  const { params } = useNotifiSubscriptionContext();
  const { renderView, account } = useNotifiModalContext();
  const { subscribe } = useNotifiSubscribe({
    targetGroupName: "Default",
  });
  const config = useNotifiConfig();
  const subscribeAlerts = async () => {
    const resolveStringRef = (await import("@notifi-network/notifi-react-card"))
      .resolveStringRef;
    const fusionToggleConfiguration = (
      await import("@notifi-network/notifi-react-card")
    ).fusionToggleConfiguration;
    const broadcastMessageConfiguration = (
      await import("@notifi-network/notifi-react-card")
    ).broadcastMessageConfiguration;
    const inputs: Record<string, unknown> = {
      userWallet: account,
    };
    if (config.state === "fetched") {
      const alertConfigurations: Record<string, AlertConfiguration | null> = {};
      for (let i = 0; i < config.data.eventTypes.length; ++i) {
        const row = config.data.eventTypes[i];
        let alertConfiguration = null;
        if (row.type === "broadcast") {
          const topicName = resolveStringRef(row.name, row.broadcastId, inputs);
          alertConfiguration = broadcastMessageConfiguration({
            topicName,
          });
        } else if (row.type === "fusionToggle") {
          const fusionId = resolveStringRef(
            row.name,
            row.fusionEventId,
            inputs
          );
          const fusionSourceAddress = resolveStringRef(
            row.name,
            row.sourceAddress,
            inputs
          ).toLowerCase();
          alertConfiguration = fusionToggleConfiguration({
            fusionId,
            fusionSourceAddress,
            alertFrequency: row.alertFrequency,
          });
        } else if (row.type === "fusion") {
          const fusionId = resolveStringRef(
            row.name,
            row.fusionEventId,
            inputs
          );
          // "Transaction status" are not supported for now
          if (fusionId === EVENT_TYPE_ID.TRANSACTION_STATUSES) continue;
          const fusionSourceAddress = resolveStringRef(
            row.name,
            row.sourceAddress,
            inputs
          ).toLowerCase();
          alertConfiguration = fusionToggleConfiguration({
            fusionId,
            fusionSourceAddress,
            alertFrequency: row.alertFrequency,
          });
        }
        alertConfigurations[row.name] = alertConfiguration;
      }

      await subscribe(
        alertConfigurations as Record<string, AlertConfiguration>
      );
    }
  };

  const onClickVerify = useCallback(async () => {
    setLoading(true);
    try {
      if (params.walletBlockchain === "OSMOSIS") {
        await subscribeAlerts();

        const data = await client.fetchData();

        const defaultTargetGroup = data.targetGroups?.find(
          (it) => it?.name === "Default"
        );
        if (defaultTargetGroup !== undefined) {
          renderView("history");
        } else {
          renderView("edit");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [client, params.signMessage, params.walletBlockchain, renderView]);

  if (loading) {
    return <LoadingCard />;
  }

  const dummyRows: DummyRow[] = [
    {
      emoji: <TeamUpdateIcon />,
      __typename: "DummyRow",
      title: t("notifi.signupDummyHistoryTitle1"),
      message: t("notifi.signupDummyHistoryMessage1"),
      cta: "View",
      timestamp: "2:13pm",
      onCtaClick: () => false,
    },
    {
      emoji: <TeamUpdateIcon />,
      __typename: "DummyRow",
      title: t("notifi.signupDummyHistoryTitle2"),
      message: t("notifi.signupDummyHistoryMessage2"),
      cta: "View",
      timestamp: "12:54pm",
      onCtaClick: () => false,
    },
    {
      emoji: <TeamUpdateIcon />,
      __typename: "DummyRow",
      title: t("notifi.signupDummyHistoryTitle3"),
      message: t("notifi.signupDummyHistoryMessage3"),
      cta: "View",
      timestamp: "6:30am",
      onCtaClick: () => false,
    },
  ];

  return (
    <div className="mt-[0.25rem] flex flex-col md:p-6">
      <div className="relative overflow-hidden">
        <div className="absolute z-10 h-full w-full bg-gradient-dummy-notifications"></div>
        <div className="w-full opacity-[0.6]">
          {dummyRows.map((row, key) => (
            <HistoryRow row={row} key={key} />
          ))}
        </div>
      </div>
      <p className="mx-[2rem] mt-[0.3125rem] text-center text-subtitle1">
        {t("notifi.signupPageTitle")}
      </p>
      <p className="mx-[2rem] mt-[1.3125rem] mb-[2.5rem] text-center text-body2">
        {t("notifi.signupPageMessage")}
      </p>
      <div className="mx-[2rem]">
        <Button
          mode="primary"
          disabled={loading}
          onClick={() => onClickVerify()}
        >
          {t("notifi.signupPageButton")}
        </Button>
      </div>
    </div>
  );
};
