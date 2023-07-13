import { CardConfigItemV1 } from "@notifi-network/notifi-frontend-client";
import { useNotifiSubscriptionContext } from "@notifi-network/notifi-react-card";
import { FunctionComponent, useEffect, useState } from "react";

import { useNotifiModalContext } from "../../notifi-modal-context";
import { EditView } from "./edit-view";
import { HistoryDetailView } from "./history-detail-view";
import { HistoryRowData } from "./history-rows";
import { HistoryView } from "./history-view";
import { SignupView } from "./signup-view";
export const FetchedCard: FunctionComponent<{
  data: CardConfigItemV1;
}> = () => {
  const { cardView } = useNotifiSubscriptionContext();
  const [selectedAlertEntry, setAlertEntry] = useState<HistoryRowData>();
  const { location } = useNotifiModalContext();

  useEffect(() => {
    if (location === "history") {
      setAlertEntry(undefined);
    }
  }, [location]);

  if (cardView.state === "history") {
    if (selectedAlertEntry) {
      return <HistoryDetailView historyRowData={selectedAlertEntry} />;
    }

    return <HistoryView setAlertEntry={setAlertEntry} />;
  } else if (cardView.state === "signup") {
    return <SignupView />;
  } else if (cardView.state === "edit") {
    return <EditView />;
  } else {
    return null;
  }
};
