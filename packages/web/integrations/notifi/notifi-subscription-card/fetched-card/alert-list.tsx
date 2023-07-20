import { resolveStringRef } from "@notifi-network/notifi-react-card";
import { FunctionComponent, useMemo } from "react";

import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";
import { useNotifiModalContext } from "~/integrations/notifi/notifi-modal-context";
import { AlertRow } from "~/integrations/notifi/notifi-subscription-card/fetched-card/alert-row";
import { EVENT_TYPE_ID } from "~/integrations/notifi/notifi-subscription-card/fetched-card/history-rows";

interface Props {
  disabled: boolean;
  toggleStates: Record<string, boolean>;
  setToggleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export const AlertList: FunctionComponent<Props> = (props) => {
  const config = useNotifiConfig();
  const { account } = useNotifiModalContext();

  const sortedRows = useMemo(() => {
    if (config.state !== "fetched") {
      return [];
    }
    const inputs: Record<string, unknown> = {
      userWallet: account,
    };
    return config.data.eventTypes.filter(
      (row) =>
        // "Transaction status" alert is not supported for now, so hide it from the list
        !(
          row.type === "fusion" &&
          resolveStringRef(row.name, row.fusionEventId, inputs) ===
            EVENT_TYPE_ID.TRANSACTION_STATUSES
        )
    );
  }, [config, account]);

  if (config.state !== "fetched") {
    return null;
  }

  return (
    <ul className="mt-[-1.125rem] block px-[2.5rem] pb-[1.125rem]">
      {sortedRows.map((row) => {
        if (row.type === "label") {
          return (
            <li
              key={row.name}
              className="mb-[1.5rem] mt-[2.25rem] flex flex-col gap-[0.5rem]"
            >
              <p className="text-subtitle1">{row.name}</p>
              <p className="text-caption text-osmoverse-200">
                {row.tooltipContent}
              </p>
            </li>
          );
        }
        return (
          <li key={row.name} className="mt-[0.75rem]">
            <AlertRow row={row} {...props} />
          </li>
        );
      })}
    </ul>
  );
};
