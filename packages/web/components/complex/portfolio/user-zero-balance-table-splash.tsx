import Image from "next/image";
import { FunctionComponent } from "react";
import { useShallow } from "zustand/react/shallow";

import { Icon } from "~/components/assets";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useBridgeStore } from "~/hooks/bridge";

export const UserZeroBalanceTableSplash: FunctionComponent = () => {
  const { t } = useTranslation();
  const { startBridge, fiatRampSelection } = useBridgeStore(
    useShallow((state) => ({
      startBridge: state.startBridge,
      fiatRampSelection: state.fiatRampSelection,
    }))
  );

  return (
    <div className="mx-auto flex w-fit flex-col gap-4 py-3 text-center">
      <Image
        alt="no balances"
        src="/images/coins-and-vial.svg"
        width={240}
        height={160}
      />
      <h6>{t("portfolio.noAssets", { osmosis: "Osmosis" })}</h6>
      <p className="body1 text-osmoverse-300">{t("portfolio.getStarted")}</p>
      <div className="flex items-center justify-center gap-2">
        <Button
          className="flex !w-fit items-center gap-2 !rounded-full"
          onClick={() => startBridge({ direction: "deposit" })}
        >
          <Icon id="deposit" height={16} width={16} />
          <span className="subtitle1">{t("assets.table.depositButton")}</span>
        </Button>
        <Button
          className="group flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200 hover:bg-gradient-positive hover:text-black hover:shadow-[0px_0px_30px_4px_rgba(57,255,219,0.2)]"
          onClick={fiatRampSelection}
        >
          <CreditCardIcon
            isAnimated
            classes={{
              backCard: "group-hover:stroke-[2]",
              frontCard: "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
            }}
          />
          <span className="subtitle1">{t("portfolio.buy")}</span>
        </Button>
      </div>
    </div>
  );
};
