import { UserConvertToStakeConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { AvailableConversions } from "~/components/funnels/convert-to-stake/available-conversions";
import { useConvertToStakeConfig } from "~/hooks/ui-config/use-convert-to-stake-config";

import { ModalBase, ModalBaseProps } from "./base";
import { SuperfluidValidatorModal } from "./superfluid-validator";

/** Modal for converting to stake the various pool assets of a lower APR than staking.
 *  If a user has selected a valsetpref, then that will be used for the conversion.
 *  Otherwise, users will be prompted to select a validator to stake a pool's assets to.
 *  A UI config can be optionally provided, and if not provided will be created. */
export const ConvertToStakeModal: FunctionComponent<
  ModalBaseProps & {
    convertToStakeConfig?: UserConvertToStakeConfig;
  }
> = observer((props) => {
  const t = useTranslation();

  const newConvertToStakeConfig = useConvertToStakeConfig();
  const convertToStakeConfig =
    props.convertToStakeConfig ?? newConvertToStakeConfig;

  const [isSelectingValidator, setIsSelectingValidator] = useState(false);

  const closeConvertToStakeModal = () => {
    setIsSelectingValidator(false);
    props.onRequestClose();
  };

  return (
    <>
      <SuperfluidValidatorModal
        isOpen={isSelectingValidator}
        onRequestClose={() => setIsSelectingValidator(false)}
        onSelectValidator={(address) => {
          convertToStakeConfig
            .sendConvertToStakeMsg(address)
            .then(closeConvertToStakeModal);
        }}
      />
      <ModalBase
        title={t("convertToStake.title")}
        {...props}
        isOpen={props.isOpen && !isSelectingValidator}
      >
        <AvailableConversions convertToStakeConfig={convertToStakeConfig} />
        <Button
          disabled={
            !convertToStakeConfig.isConvertToStakeFeatureRelevantToUser &&
            convertToStakeConfig.selectedConversionPoolIds.size > 0 &&
            convertToStakeConfig.canSelectMorePools
          }
          className="mx-auto w-2/3"
          mode="special-1"
          onClick={() => {
            if (!convertToStakeConfig.hasValidatorPreferences)
              setIsSelectingValidator(true);
            else
              convertToStakeConfig
                .sendConvertToStakeMsg()
                .then(closeConvertToStakeModal);
          }}
        >
          {t("convertToStake.convertAndStake")}
        </Button>
      </ModalBase>
    </>
  );
});
