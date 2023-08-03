import {
  EventTypeItem,
  LabelEventTypeItem,
} from "@notifi-network/notifi-frontend-client";
import { FunctionComponent, useMemo } from "react";

import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";
import { AlertRow } from "~/integrations/notifi/notifi-subscription-card/fetched-card/alert-row";

export type LabelWithAlerts = {
  label: LabelEventTypeItem;
  alerts: EventTypeItem[];
};
interface Props {
  disabled: boolean;
  toggleStates: Record<string, boolean>;
  setToggleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export const AlertList: FunctionComponent<Props> = (props) => {
  const config = useNotifiConfig();

  const labelsWithAlerts = useMemo(() => {
    if (config.state === "fetched") {
      const labelsWithAlerts: LabelWithAlerts[] = [];
      let currentLabel: LabelWithAlerts | undefined = undefined;
      config.data.eventTypes.forEach((row) => {
        if (row.type === "label") {
          currentLabel = {
            label: row,
            alerts: [],
          };
          labelsWithAlerts.push(currentLabel);
        } else {
          currentLabel?.alerts.push(row);
        }
      });
      return labelsWithAlerts;
    }
    return [];
  }, [config.state]);

  if (config.state !== "fetched") {
    return null;
  }

  return (
    <ul className="block px-[2.5rem] pb-[1.125rem]">
      {labelsWithAlerts.map((labelWithAlerts) => (
        <AlertRow
          key={labelWithAlerts.label.name}
          labelWithAlerts={labelWithAlerts}
          {...props}
        />
      ))}
    </ul>
  );
};
