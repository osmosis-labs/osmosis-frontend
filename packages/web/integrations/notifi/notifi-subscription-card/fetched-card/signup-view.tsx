import {
  AlertConfiguration,
  useNotifiClientContext,
  useNotifiSubscribe,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import { FunctionComponent, useCallback, useState } from "react";

import { Button } from "~/components/buttons";

import { useNotifiConfig } from "../../notifi-config-context";
import { useNotifiModalContext } from "../../notifi-modal-context";
import { LoadingCard } from "../loading-card";
import { DummyRow, EVENT_TYPE_ID, HistoryRow } from "./history-rows";

export const dummyRows: DummyRow[] = [
  {
    emoji: "💸",
    __typename: "DummyRow",
    title: "Buy tokens to get started",
    message: "Acquire OSMO to start trading",
    cta: "View",
    timestamp: "2:13pm",
    onCtaClick: () => false,
  },
  {
    emoji: "🚧",
    __typename: "DummyRow",
    title: "How to deposit assets",
    message: "Learn how to transfer funds onto Osmosis",
    cta: "View",
    timestamp: "12:54pm",
    onCtaClick: () => false,
  },
  {
    emoji: "🎉",
    __typename: "DummyRow",
    title: "How to start trading",
    message: "This quick tutorial will get you trading in minutes",
    cta: "View",
    timestamp: "6:30am",
    onCtaClick: () => false,
  },
];

export const SignupView: FunctionComponent = () => {
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
          // Position out of range is not supported for now
          if (fusionId === EVENT_TYPE_ID.POSITION_OUT_OF_RANGE) continue;
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

  return (
    <div className="mt-[4px] flex h-full flex-col md:p-6">
      <div className="relative overflow-hidden">
        <div
          className="absolute z-10 h-full w-full"
          // Does not support gradients, Use CSS instead
          style={{
            background:
              "linear-gradient(rgb(60, 53, 99,0.4), rgb(40, 39, 80, 1) ",
          }}
        ></div>
        <div className=" opacity-[0.6]">
          {dummyRows.map((row, key) => (
            <HistoryRow row={row} key={key} />
          ))}
        </div>
      </div>
      <p className="mx-[2rem] mt-[5px] text-center text-xs text-subtitle1 font-normal">
        Notifications are now available.
      </p>
      <p className="font-xs mx-[2rem] mt-[21px] mb-[40px] text-center text-subtitle1 text-[14px] font-light">
        Never miss an important update again, from new token listings to
        critical position statuses.
      </p>
      <div className="mx-[2rem]">
        <Button
          mode="primary"
          disabled={loading}
          onClick={() => onClickVerify()}
        >
          Enable Notifications
        </Button>
      </div>
    </div>
  );
};
