import { FunctionComponent } from "react";

import { StepBase } from "~/components/complex/token/create/step-base";
import { CreateTokenStepProps } from "~/components/complex/token/create/types";
import { InputBox } from "~/components/input";
import { InfoTooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";

export const Step1Identity: FunctionComponent<CreateTokenStepProps> = (
  props
) => {
  const { config, setConfig } = props;
  const { t } = useTranslation();

  const subdenomError =
    config.subdenom.length > 44
      ? t("tokenFactory.create.errors.subdenomTooLong")
      : config.subdenom.length > 0 &&
        !/^[a-zA-Z0-9./_-]+$/.test(config.subdenom)
      ? t("tokenFactory.create.errors.subdenomInvalidChars")
      : null;

  return (
    <StepBase step={1} {...props}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="body2 text-osmoverse-300">
            {t("tokenFactory.create.subdenom")}
          </label>
          <InputBox
            currentValue={config.subdenom}
            onInput={(val) => setConfig({ subdenom: val })}
            placeholder="mytoken"
            style={subdenomError ? "error" : "enabled"}
          />
          {subdenomError ? (
            <span className="caption text-missionError">{subdenomError}</span>
          ) : (
            <span className="caption text-osmoverse-500">
              {t("tokenFactory.create.subdenomHint")}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="body2 text-osmoverse-300">
            {t("tokenFactory.create.name")}
          </label>
          <InputBox
            currentValue={config.name}
            onInput={(val) => setConfig({ name: val })}
            placeholder={t("tokenFactory.create.namePlaceholder")}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="body2 text-osmoverse-300">
              {t("tokenFactory.create.symbol")}
            </label>
            <InputBox
              currentValue={config.symbol}
              onInput={(val) => setConfig({ symbol: val.toUpperCase() })}
              placeholder="MYTKN"
            />
          </div>

          <div className="flex flex-col gap-1.5" style={{ width: "120px" }}>
            <div className="flex items-center gap-1">
              <label className="body2 text-osmoverse-300">
                {t("tokenFactory.create.decimals")}
              </label>
              <InfoTooltip content={t("tokenFactory.create.decimalsTooltip")} />
            </div>
            <InputBox
              currentValue={config.decimals.toString()}
              onInput={(val) => {
                const n = parseInt(val, 10);
                if (!isNaN(n) && n >= 0 && n <= 18) setConfig({ decimals: n });
              }}
              inputMode="numeric"
              placeholder="6"
            />
          </div>
        </div>
      </div>
    </StepBase>
  );
};
