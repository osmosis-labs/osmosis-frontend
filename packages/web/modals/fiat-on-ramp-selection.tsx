import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { MultiLanguageT, useFeatureFlags, useTranslation } from "~/hooks";
import { useBridgeStore } from "~/hooks/bridge";
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
    ...FiatRampDisplayInfos.swapped,
    initialAsset: "USDC",
    subtitle: t("components.fiatOnrampSelection.swappedSubtitle"),
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
  const flags = useFeatureFlags();
  const toggleFiatRamp = useBridgeStore((state) => state.toggleFiatRamp);
  const { t } = useTranslation();

  return (
    <ModalBase
      className="max-w-[30.625rem]"
      title={<h6>{t("components.fiatOnrampSelection.chooseOnramp")}</h6>}
      hideDefaultBackButton
      {...modalProps}
    >
      <div className="flex flex-col gap-5 pt-8">
        {Options(t).map(
          ({
            rampKey,
            displayName,
            initialAsset,
            logoId,
            iconUrl,
            subtitle,
          }) => {
            if (rampKey === "swapped" && !flags.swapped) return null;
            if (rampKey === "onrampmoney" && !flags.onrampmoney) return null;

            return (
              <Button
                key={rampKey}
                className="flex h-28 items-center !justify-start gap-2 !bg-osmoverse-900 px-5 py-5 transition-colors hover:!bg-osmoverse-700"
                onClick={() => {
                  onSelectRamp?.(rampKey);
                  toggleFiatRamp({
                    fiatRampKey: rampKey,
                    assetKey: initialAsset,
                  });
                  modalProps.onRequestClose();
                }}
              >
                {logoId ? (
                  <Icon id={logoId} className="h-16 w-16" />
                ) : (
                  <Image
                    src={iconUrl}
                    width={64}
                    height={64}
                    alt={displayName}
                  />
                )}
                <div className="ml-5 flex flex-col text-left">
                  <h6>{displayName}</h6>
                  <p className="body2 mt-1 text-osmoverse-400">{subtitle}</p>
                </div>
              </Button>
            );
          }
        )}
      </div>
    </ModalBase>
  );
});
