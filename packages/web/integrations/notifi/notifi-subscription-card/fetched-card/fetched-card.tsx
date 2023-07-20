import { CardConfigItemV1 } from "@notifi-network/notifi-frontend-client";
import { useNotifiSubscriptionContext } from "@notifi-network/notifi-react-card";
import { FunctionComponent } from "react";

import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import { EditView } from "~/integrations/notifi/notifi-subscription-card/fetched-card/edit-view";
import { HistoryDetailView } from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-detail-view";
import { HistoryView } from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-view";
import { SignupView } from "~/integrations/notifi/notifi-subscription-card/fetched-card/signup-view";
export const FetchedCard: FunctionComponent<{
  data: CardConfigItemV1;
}> = () => {
  const { cardView } = useNotifiSubscriptionContext();
  const { selectedHistoryEntry, location } = useNotifiModalContext();

  if (cardView.state === "history") {
    if (location === "historyDetail" && selectedHistoryEntry) {
      return <HistoryDetailView historyRowData={selectedHistoryEntry} />;
    }

    return <HistoryView />;
  } else if (cardView.state === "signup") {
    return <SignupView />;
  } else if (cardView.state === "edit") {
    return <EditView />;
  } else {
    return null;
  }
};
