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
    ...FiatRampDisplayInfos.moonpay,
    initialAsset: "OSMO",
    subtitle: t("components.fiatOnrampSelection.moonpaySubtitle"),
  },
  {
    ...FiatRampDisplayInfos.swapped,
    initialAsset: "USDC",
    subtitle: t("components.fiatOnrampSelection.swappedSubtitle"),
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
            if (rampKey === "layerswapcoinbase" && !flags.layerswapcoinbase)
              return null;
            if (rampKey === "moonpay" && !flags.moonpay) return null;
            if (rampKey === "swapped" && !flags.swapped) return null;
            if (rampKey === "transak" && !flags.transak) return null;
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
                {rampKey === "moonpay" ? (
                  <div className="ml-5 flex flex-col text-left gap-1">
                    <div className="flex items-center gap-2">
                      <h6>{displayName}</h6>
                      <span className="text-xs text-white-mid">
                        🌎{" "}
                        {t(
                          "components.fiatOnrampSelection.moonpayCountrySupport"
                        )}
                      </span>
                    </div>
                    <div className="flex w-full relative">
                      {MOONPAY_SUPPORTED_PROVIDERS.map(({ icon, id }, i) => (
                        <Image
                          key={id}
                          src={icon}
                          alt={id}
                          width={32}
                          height={20}
                          style={{
                            transform: `translateX(-${i * 4}px)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ml-5 flex flex-col text-left">
                    <h6>{displayName}</h6>
                    <p className="body2 mt-1 text-osmoverse-400">{subtitle}</p>
                  </div>
                )}
              </Button>
            );
          }
        )}
      </div>
    </ModalBase>
  );
});

const MOONPAY_SUPPORTED_PROVIDERS = [
  {
    id: "apple-pay",
    icon: "/payment-methods/apple-pay.svg",
  },
  {
    id: "mastercard",
    icon: "/payment-methods/mastercard.svg",
  },
  {
    id: "visa",
    icon: "/payment-methods/visa.svg",
  },
];
