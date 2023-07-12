import {
  AlertConfiguration,
  broadcastMessageConfiguration,
  fusionToggleConfiguration,
  resolveStringRef,
  useNotifiClientContext,
  useNotifiSubscribe,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import { FunctionComponent, useCallback, useState } from "react";

import { Button } from "~/components/buttons";

import { useNotifiConfig } from "../../notifi-config-context";
import { useNotifiModalContext } from "../../notifi-modal-context";
import { DummyRow, EVENT_TYPE_ID } from "./history-rows";

export const dummyRows: DummyRow[] = [
  {
    emoji: "💸",
    __typename: "DummyRow",
    title: "Deposit complete",
    message: "1,129.39 OSMO received",
    cta: "View",
    timestamp: "2:13pm",
    onCtaClick: () => {},
  },
  {
    emoji: "🚧",
    __typename: "DummyRow",
    title: "Deposit",
    message:
      "OSMO/ATOM Pool is almost out of range. Rebalance this immediately",
    cta: "View",
    timestamp: "12:54pm",
    onCtaClick: () => {},
  },
  {
    emoji: "🎉",
    __typename: "DummyRow",
    title: "etc",
    message: (
      <div>
        Supercharged liquidity is live! <br /> Learn more
      </div>
    ),
    cta: "View",
    timestamp: "",
    onCtaClick: () => {},
  },
];

export const SignupView: FunctionComponent = () => {
  const { client } = useNotifiClientContext();
  const [loading, setLoading] = useState(false);
  const { params } = useNotifiSubscriptionContext();
  const { setLocation, account } = useNotifiModalContext();
  const { subscribe } = useNotifiSubscribe({
    targetGroupName: "Default",
  });
  const config = useNotifiConfig();
  const subscribeAlerts = async () => {
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
          setLocation("history");
        } else {
          setLocation("edit");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [client, params.signMessage, params.walletBlockchain, setLocation]);

  return (
    <div className="flex h-full flex-col md:p-6">
      <p className="font-xs mx-[2rem] mt-[1rem] mb-[2rem] text-center text-subtitle1 font-light">
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
