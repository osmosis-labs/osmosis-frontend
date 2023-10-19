import {
  EventTypeItem,
  LabelEventTypeItem,
} from "@notifi-network/notifi-frontend-client";
import { FunctionComponent, useMemo } from "react";

import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";
import { AlertSettingRow } from "~/integrations/notifi/notifi-subscription-card/fetched-card/alert-setting-row";

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

export const AlertSettingsList: FunctionComponent<Props> = (props) => {
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
    <ul className="block px-[2.5rem] pb-[1.125rem] sm:px-5">
      {labelsWithAlerts.map((labelWithAlerts) => (
        <AlertSettingRow
          key={labelWithAlerts.label.name}
          labelWithAlerts={labelWithAlerts}
          {...props}
        />
      ))}
    </ul>
  );
};
