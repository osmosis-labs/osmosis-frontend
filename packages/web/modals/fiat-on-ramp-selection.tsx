import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTransferConfig } from "~/hooks";
import { FiatRampDisplayInfos, FiatRampKey } from "~/integrations";

import { ModalBase, ModalBaseProps } from "./base";
import { FiatRampsModal } from "./fiat-ramps";

const Options = (
  t: ReturnType<typeof useTranslation>
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
];

export const FiatOnrampSelectionModal: FunctionComponent<
  { onSelectRamp?: (ramp: FiatRampKey) => void } & ModalBaseProps
> = observer(({ onSelectRamp, ...modalProps }) => {
  const transferConfig = useTransferConfig();
  const { logEvent } = useAmplitudeAnalytics();
  const t = useTranslation();

  return (
    <>
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
                mode="unstyled"
                size="unstyled"
                className="flex items-center justify-start gap-[10px] rounded-2xl bg-osmoverse-900 px-5 py-5 transition-colors hover:bg-osmoverse-700"
                onClick={() => {
                  onSelectRamp?.(rampKey);
                  transferConfig.launchFiatRampsModal(rampKey, initialAsset);
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
      {transferConfig?.fiatRampsModal && (
        <FiatRampsModal
          transakModalProps={{
            onCreateOrder: (data) => {
              logEvent([
                EventName.Sidebar.buyOsmoStarted,
                {
                  tokenName: data.status.cryptoCurrency,
                  tokenAmount: Number(
                    data.status?.fiatAmountInUsd ?? data.status.cryptoAmount
                  ),
                },
              ]);
            },
            onSuccessfulOrder: (data) => {
              logEvent([
                EventName.Sidebar.buyOsmoCompleted,
                {
                  tokenName: data.status.cryptoCurrency,
                  tokenAmount: Number(
                    data.status?.fiatAmountInUsd ?? data.status.cryptoAmount
                  ),
                },
              ]);
            },
          }}
          {...transferConfig.fiatRampsModal}
        />
      )}
    </>
  );
});
