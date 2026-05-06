import { FunctionComponent } from "react";

import { StepBase } from "~/components/complex/token/create/step-base";
import { CreateTokenStepProps } from "~/components/complex/token/create/types";
import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";
import { TOKENFACTORY_BURN_ADDRESS } from "~/utils/tokenfactory";

export const Step4Confirm: FunctionComponent<CreateTokenStepProps> = (
  props
) => {
  const { config, setConfig } = props;
  const { t } = useTranslation();

  return (
    <StepBase step={4} {...props}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-2xl bg-osmoverse-900 p-5">
          <Row
            label={t("tokenFactory.create.confirmDenom")}
            value={`factory/…/${config.subdenom}`}
          />
          <Row
            label={t("tokenFactory.create.confirmName")}
            value={config.name}
          />
          <Row
            label={t("tokenFactory.create.confirmSymbol")}
            value={config.symbol}
          />
          <Row
            label={t("tokenFactory.create.confirmDecimals")}
            value={config.decimals.toString()}
          />
          {config.description.length > 0 && (
            <Row
              label={t("tokenFactory.create.confirmDescription")}
              value={config.description}
            />
          )}
          {config.mintEnabled && (
            <Row
              label={t("tokenFactory.create.confirmMint")}
              value={`${config.mintAmount} ${config.symbol}`}
            />
          )}
          {config.changeAdminEnabled && (
            <Row
              label={t("tokenFactory.create.confirmAdmin")}
              value={
                config.newAdmin === TOKENFACTORY_BURN_ADDRESS
                  ? t("tokenFactory.create.confirmAdminRenounced")
                  : config.newAdmin
              }
            />
          )}
        </div>

        <div className="rounded-xl border border-osmoverse-700 p-3.5">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={config.acknowledgeFee}
              onCheckedChange={(checked) =>
                setConfig({ acknowledgeFee: checked === true })
              }
            />
            <label
              className="body2 cursor-pointer text-osmoverse-300"
              onClick={() =>
                setConfig({ acknowledgeFee: !config.acknowledgeFee })
              }
            >
              {t("tokenFactory.create.acknowledgeFee")}
            </label>
          </div>
        </div>
      </div>
    </StepBase>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="body2 shrink-0 text-osmoverse-400">{label}</span>
      <span className="body2 text-right text-white-high">{value}</span>
    </div>
  );
}
