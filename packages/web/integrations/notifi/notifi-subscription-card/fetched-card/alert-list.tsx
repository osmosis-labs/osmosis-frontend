import { FunctionComponent } from "react";

import { useNotifiConfig } from "../../notifi-config-context";
import { AlertRow } from "./alert-row";

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
    <ul className="mt-[-18px] block px-[40px] pb-[18px] text-[12px] font-[500]">
      {config.data.eventTypes.map((row) => {
        if (row.type === "label") {
          return (
            <li
              key={row.name}
              className="mb-[24px] mt-[36px] flex flex-col gap-[8px]"
            >
              <p className="text-subtitle1 text-[16px] font-[600]">
                {row.name}
              </p>
              <p className="text-[12px] font-[500] text-osmoverse-200">
                {row.tooltipContent}
              </p>
            </li>
          );
        }
        return (
          <li key={row.name} className="mt-[12px]">
            <AlertRow row={row} {...props} />
          </li>
        );
      })}
    </ul>
  );
};
