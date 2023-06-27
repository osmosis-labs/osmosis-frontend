import {
  useNotifiClientContext,
  useNotifiSubscriptionContext,
} from "@notifi-network/notifi-react-card";
import { FunctionComponent, useCallback, useState } from "react";

import { Button } from "~/components/buttons";

import { useNotifiModalContext } from "../../notifi-modal-context";
import { HistoryRowData, HistoryRows } from "./history-rows";

const dummyHistoryRows: HistoryRowData[] = [
  {
    id: "1",
    createdDate: new Date().toLocaleDateString(),
    eventId: "1",
    read: false,
    sourceAddress: "0x1234567890",
    targets: [],
    detail: {
      __typename: "GenericEventDetails",
      sourceName: "Deposit complete",
      notificationTypeName: "1,129.39 OSMO received",
      icon: "INFO",
      genericMessage: "string",
    },
  },
  {
    id: "2",
    createdDate: new Date().toLocaleDateString(),
    eventId: "2",
    read: false,
    sourceAddress: "0x1234567890",
    targets: [],
    detail: {
      __typename: "GenericEventDetails",
      sourceName: "Position near bounds",
      notificationTypeName: "OSMO/ATOM Pool is within 10% of your set range",
      icon: "MEGAPHONE",
      genericMessage: "string",
    },
  },
  {
    id: "3",
    createdDate: new Date().toLocaleDateString(),
    eventId: "3",
    read: false,
    sourceAddress: "0x1234567890",
    targets: [],
    detail: {
      __typename: "GenericEventDetails",
      sourceName: "Update from the team",
      notificationTypeName: "string;",
      icon: "STAR",
      genericMessage: "string",
    },
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
      <div
        className="relative h-[200px] overflow-hidden rounded-3xl" /*style={{ borderRadius: "30px", overflow: "hidden" }}*/
      >
        <div
          className="absolute z-10 h-full w-full"
          // TODO: Project Tailwind does not support gradients for now. Use CSS instead
          style={{
            background:
              "linear-gradient(rgb(90, 83, 99,0.3), rgb(40, 39, 80, 1) ",
          }}
        ></div>
        <div className="m-[-10px]">
          <HistoryRows rows={[...dummyHistoryRows]} setAlertEntry={() => {}} />
        </div>
      </div>

      <Button mode="primary" disabled={loading} onClick={() => onClickVerify()}>
        Enable Notifications
      </Button>
    </div>
  );
};
