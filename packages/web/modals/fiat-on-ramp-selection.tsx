import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { MultiLanguageT, useTranslation } from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { FiatRampDisplayInfos, FiatRampKey } from "~/integrations";
import { ModalBase, ModalBaseProps } from "~/modals/base";

const Options = (
  t: MultiLanguageT
): Array<
  (typeof FiatRampDisplayInfos)[keyof typeof FiatRampDisplayInfos] & {
    initialAsset: "OSMO" | "USDC";
    subtitle: string;
  }
> => [
  {
    ...FiatRampDisplayInfos.kado,
    initialAsset: "USDC",
    subtitle: t("components.fiatOnrampSelection.kadoSubtitle"),
  },
  {
    ...FiatRampDisplayInfos.transak,
    initialAsset: "OSMO",
    subtitle: t("components.fiatOnrampSelection.transakSubtitle"),
  },
  {
    ...FiatRampDisplayInfos.onrampmoney,
    initialAsset: "OSMO",
    subtitle: t("components.fiatOnrampSelection.onrampMoneySubtitle"),
  },
];

/** Selection of fiat on/off ramp to use. */
export const FiatOnrampSelectionModal: FunctionComponent<
  { onSelectRamp?: (ramp: FiatRampKey) => void } & ModalBaseProps
> = observer(({ onSelectRamp, ...modalProps }) => {
  const { fiatRamp } = useBridge();
  const { t } = useTranslation();

  return (
    <ModalBase
      className="max-w-[30.625rem]"
      title={
        <h6 className="mb-4">
          {t("components.fiatOnrampSelection.chooseOnramp")}
        </h6>
      }
      {...modalProps}
    >
      <div className="flex flex-col gap-5">
        {Options(t).map(
          ({ rampKey, displayName, initialAsset, logoId, subtitle }) => (
            <Button
              key={rampKey}
              className="flex h-28 items-center !justify-start gap-2 !bg-osmoverse-900 py-5 px-5 transition-colors hover:!bg-osmoverse-700"
              onClick={() => {
                onSelectRamp?.(rampKey);
                fiatRamp(rampKey, initialAsset);
                modalProps.onRequestClose();
              }}
            >
              <Icon id={logoId!} className="h-16 w-16" />
              <div className="ml-5 flex flex-col text-left">
                <h6>{displayName}</h6>
                <p className="body2 mt-1 text-osmoverse-400">{subtitle}</p>
              </div>
            </Button>
          )
        )}
      </div>
    </ModalBase>
  );
});
