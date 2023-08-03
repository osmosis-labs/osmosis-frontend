import { resolveStringRef } from "@notifi-network/notifi-react-card";
import { FunctionComponent, useState } from "react";

import { Icon } from "~/components/assets";
import { Switch } from "~/components/control";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import { LabelWithAlerts } from "~/integrations/notifi/notifi-subscription-card/fetched-card/alert-list";
import { EVENT_TYPE_ID } from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-rows";

interface Props {
  // row: EventTypeItem;
  disabled: boolean;
  toggleStates: Record<string, boolean>;
  setToggleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  labelWithAlerts: LabelWithAlerts;
}

export const AlertRow: FunctionComponent<Props> = ({
  // row,
  disabled,
  toggleStates,
  setToggleStates,
  labelWithAlerts,
}) => {
  const { account } = useNotifiModalContext();

  const [isExpended, setIsExpended] = useState(false);

  const sortedRows = labelWithAlerts.alerts.filter((row) => {
    // "Transaction status" alert is not supported for now, so hide it from the list
    const inputs: Record<string, unknown> = {
      userWallet: account,
    };

    return !(
      row.type === "fusion" &&
      resolveStringRef(row.name, row.fusionEventId, inputs) ===
        EVENT_TYPE_ID.TRANSACTION_STATUSES
    );
  }, []);

  return (
    <>
      <li
        key={labelWithAlerts.label.name}
        className={`relative flex cursor-pointer flex-row flex-col gap-[0.75rem] py-[1.125rem]`}
      >
        <div
          className={`flex flex-col gap-3 ${isExpended ? "mb-[0.375rem]" : ""}`}
          onClick={() => setIsExpended((prev) => !prev)}
        >
          <p className="font-subtitle text-subtitle1">
            {labelWithAlerts.label.name}
          </p>
          <p className="text-caption font-caption text-osmoverse-200">
            {labelWithAlerts.label.tooltipContent}
          </p>
          <Icon
            id={isExpended ? "chevron-up" : "chevron-down"}
            className="absolute right-0 top-5 scale-75 text-wosmongton-200"
            height={18}
            width={18}
          />
        </div>

        {isExpended
          ? sortedRows.map((alert, key) => (
              <div key={key}>
                <Switch
                  labelPosition="right"
                  disabled={disabled}
                  isOn={toggleStates[alert.name] === true}
                  onToggle={(value) => {
                    setToggleStates((previous) => ({
                      ...previous,
                      [alert.name]: value,
                    }));
                  }}
                >
                  {alert.name}
                </Switch>
              </div>
            ))
          : null}
      </li>
    </>
  );
};
