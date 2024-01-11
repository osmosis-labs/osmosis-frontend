import { CoinPretty } from "@keplr-wallet/unit";
import { Dec } from "@keplr-wallet/unit";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Button } from "~/components/buttons";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";

interface ExtendedModalBaseProps extends ModalBaseProps {
  isWalletConnected: boolean;
  balance: CoinPretty;
  stakingApr: Dec;
  onOpenFiatOnrampSelection: () => void;
}

export const StakeIntroModal: FunctionComponent<ExtendedModalBaseProps> = ({
  onRequestClose,
  isOpen,
  balance,
  stakingApr,
  onOpenFiatOnrampSelection,
}) => {
  const { t } = useTranslation();

  const displayBalance = balance
    ?.trim(true)
    .maxDecimals(2)
    .shrink(true)
    .upperCase(true)
    .toString();

  const hasOsmo = balance.toDec().gt(new Dec(0));

  const hasOsmoText = (
    <>{t("stake.introModal.description.5", { displayBalance })} </>
  );
  const hasNoOsmoText = (
    <>
      {" "}
      <Button
        mode="unstyled"
        onClick={() => {
          onRequestClose();
          onOpenFiatOnrampSelection();
        }}
        className="!inline !w-max !p-0 text-wosmongton-300"
      >
        {t("stake.introModal.description.button")}
      </Button>{" "}
      {t("stake.introModal.description.4")}{" "}
    </>
  );

  const stakingAprText = (
    <span className="text-bullish-400">
      {stakingApr.truncate().toString()}% APR*
    </span>
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="!bg-osmoverse-850"
    >
      <div className="flex flex-col items-center p-8">
        <div className="mb-4 text-bullish-400">
          {t("stake.introModal.callout")}
        </div>
        <h1 className="colors-white-full mb-8 text-2xl leading-9">
          {t("stake.introModal.title")}
        </h1>
        <p className="mb-[2px] max-w-[512px] text-center text-sm text-osmoverse-200">
          {t("stake.introModal.description.1")}{" "}
          {hasOsmo ? hasOsmoText : hasNoOsmoText}{" "}
          {t("stake.introModal.description.2")} {stakingAprText}{" "}
          {t("stake.introModal.description.3")}
        </p>
        <Image
          width={592}
          height={413}
          src="/images/staking-release.webp"
          alt="Staking tool and dashboard view"
          quality={100}
        />
        <Button
          mode="special-1"
          onClick={onRequestClose}
          className="max-w-[400px]"
        >
          {t("stake.introModal.button")}
        </Button>
        <p className="mt-4 text-xs text-osmoverse-400">
          {t("stake.introModal.asterisk")}
        </p>
      </div>
    </ModalBase>
  );
};
