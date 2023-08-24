import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { AvailableConversions } from "~/components/funnels/convert-to-stake/available-conversions";
import { useConvertToStakeConfig } from "~/hooks/ui-config/use-convert-to-stake-config";

import { ModalBase, ModalBaseProps } from "./base";

export const ConvertToStakeModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    const t = useTranslation();

    const convertToStakeConfig = useConvertToStakeConfig();

    // TODO: use valsetpref query to determine if we show the modal

    // TODO: only suggest positoins that are low APR
    // TODO: for CL positions, compute APR based on the current tick liquidity and user's range
    // TODO: for out of range positions, encourage staking

    return (
      <ModalBase title={t("convertToStake.title")} {...props}>
        <AvailableConversions convertToStakeConfig={convertToStakeConfig} />
        <Button className="mx-auto w-2/3" mode="special-1">
          {t("convertToStake.convertAndStake")}
        </Button>
      </ModalBase>
    );
  }
);
