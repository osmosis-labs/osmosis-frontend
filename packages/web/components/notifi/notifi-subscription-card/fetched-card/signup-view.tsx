import {
  useNotifiClientContext,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import { FunctionComponent, useCallback, useState } from "react";

import { Button } from "~/components/buttons";

import { useNotifiModalContext } from "../../notifi-modal-context";
import { DummyRow, HistoryRow } from "./history-rows";

export const dummyRows: DummyRow[] = [
  {
    emoji: "💸",
    __typename: "DummyRow",
    title: "Deposit complete",
    message: "1,129.39 OSMO received",
    cta: "View",
    timestamp: "12:36 PM",
    onCtaClick: () => {},
  },
  {
    emoji: "🚧",
    __typename: "DummyRow",
    title: "Position near bounds",
    message: "OSMO/ATOM Pool is within 10% of your set range",
    cta: "View",
    timestamp: "yesterday",
    onCtaClick: () => {},
  },
  {
    emoji: "🎉",
    __typename: "DummyRow",
    title: "Update from the team",
    message: "Learn how to deposit funds on Osmosis ",
    cta: "View",
    timestamp: "",
    onCtaClick: () => {},
  },
];

export const SignupView: FunctionComponent = () => {
  const { client } = useNotifiClientContext();
  const [loading, setLoading] = useState(false);
  const { params } = useNotifiSubscriptionContext();
  const { setLocation } = useNotifiModalContext();

  const onClickVerify = useCallback(async () => {
    setLoading(true);
    try {
      if (params.walletBlockchain === "OSMOSIS") {
        await client.logIn({
          walletBlockchain: "OSMOSIS",
          signMessage: params.signMessage,
        });

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
    <div className="flex h-full h-[35rem] flex-col justify-between p-4 md:p-6">
      <p className="mt-[1rem] text-subtitle1 font-subtitle1">
        Never miss an important update again, from new token listings to
        critical position statuses.
      </p>
      <div className="relative h-[200px] overflow-hidden rounded-3xl">
        <div
          className="absolute z-10 h-full w-full"
          // TODO: Project Tailwind does not support gradients for now. Use CSS instead
          style={{
            background:
              "linear-gradient(rgb(90, 83, 99,0.3), rgb(40, 39, 80, 1) ",
          }}
        ></div>
        {dummyRows.map((row, key) => (
          <HistoryRow
            onCtaClick={row.onCtaClick}
            row={row}
            key={key}
            isModalCloseAfterClick={true}
          />
        ))}
      </div>

      <Button mode="primary" disabled={loading} onClick={() => onClickVerify()}>
        Enable Notifications
      </Button>
    </div>
  );
};
