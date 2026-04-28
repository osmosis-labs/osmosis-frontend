import { PropsWithChildren } from "react";

import { CreateTokenStepProps } from "~/components/complex/token/create/types";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

export function StepBase({
  step,
  config,
  isSendingMsg,
  advanceStep,
  children,
}: PropsWithChildren<{ step: 1 | 2 | 3 | 4 } & CreateTokenStepProps>) {
  const { t } = useTranslation();

  const canAdvance = (() => {
    if (step === 1) {
      return (
        config.subdenom.length > 0 &&
        config.subdenom.length <= 44 &&
        /^[a-zA-Z0-9._/-]+$/.test(config.subdenom) &&
        config.name.length > 0 &&
        config.symbol.length > 0
      );
    }
    if (step === 2) {
      if (config.uri.length > 0) {
        try {
          new URL(config.uri);
        } catch {
          return false;
        }
      }
      return true;
    }
    if (step === 3) {
      if (config.mintEnabled && config.mintAmount === "") return false;
      if (config.changeAdminEnabled) {
        if (config.newAdmin === "") return false;
        if (!/^osmo1[a-z0-9]{38}$/.test(config.newAdmin)) return false;
      }
      return true;
    }
    if (step === 4) return config.acknowledgeFee;
    return false;
  })();

  const stepLabel = t("tokenFactory.create.stepOf", {
    step: step.toString(),
    total: "4",
  });

  const isLastStep = step === 4;
  const finalCanAdvance = canAdvance;

  return (
    <div className="flex flex-col gap-5">
      <span className="body2 text-center text-osmoverse-300">{stepLabel}</span>
      <div>{children}</div>
      <Button
        onClick={() => advanceStep()}
        disabled={!finalCanAdvance || isSendingMsg}
      >
        {isLastStep
          ? t("tokenFactory.create.buttonCreate")
          : t("tokenFactory.create.buttonNext")}
      </Button>
    </div>
  );
}
