import { FunctionComponent } from "react";

import { useNotifiConfig } from "~/integrations/notifi/notifi-config-context";
import { AlertRow } from "~/integrations/notifi/notifi-subscription-card/fetched-card/alert-row";

interface Props {
  disabled: boolean;
  toggleStates: Record<string, boolean>;
  setToggleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export const AlertList: FunctionComponent<Props> = (props) => {
  const config = useNotifiConfig();

  if (config.state !== "fetched") {
    return null;
  }

  return (
    <ul className="mt-[-1.125rem] block px-[2.5rem] pb-[1.125rem]">
      {config.data.eventTypes.map((row) => {
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
