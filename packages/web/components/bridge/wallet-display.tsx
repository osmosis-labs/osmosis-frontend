import { isNil } from "@osmosis-labs/utils";
import { FunctionComponent, ReactNode } from "react";

export const WalletDisplay: FunctionComponent<{
  icon: string | ReactNode | undefined;
  name: string | undefined;
  suffix?: ReactNode;
}> = ({ icon, name, suffix }) => {
  return (
    <div className="subtitle1 md:body2 flex items-center gap-2 rounded-lg">
      {!isNil(icon) && (
        <>
          {typeof icon === "string" ? (
            <img src={icon} alt={name} className="h-6 w-6" />
          ) : (
            icon
          )}
        </>
      )}
      <span title={name}>{name}</span>
      {suffix}
    </div>
  );
};
