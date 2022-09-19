import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";
import { Formatted } from "../localization";
import { MobileProps } from "../types";

export const GoSuperfluidCard: FunctionComponent<
  {
    goSuperfluid: () => void;
  } & MobileProps
> = ({ goSuperfluid, isMobile = false }) => {
  const t = useTranslation();
  return (
    <div className="mt-5 bg-card p-5 rounded-2xl flex md:flex-col gap-2 items-center justify-between font-body">
      <div>
        <div className="text-base font-semibold text-white-high">
          {isMobile
            ? t("pool.goSuperfluid.titleMobile")
            : t("pool.goSuperfluid.title")}
        </div>
        <div className="mt-2 text-sm font-medium text-iconDefault">
          <Formatted
            translationKey="pool.goSuperfluid.info"
            components={{ "<br/>": <br /> }}
          />
        </div>
      </div>
      <button
        className="button bg-superfluid rounded-lg py-2 px-8 text-white-high font-semibold text-sm shadow-elevation-04dp"
        type="button"
        onClick={goSuperfluid}
      >
        {t("pool.goSuperfluid.button")}
      </button>
    </div>
  );
};
