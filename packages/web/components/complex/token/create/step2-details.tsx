import { FunctionComponent } from "react";

import { StepBase } from "~/components/complex/token/create/step-base";
import { CreateTokenStepProps } from "~/components/complex/token/create/types";
import { InputBox } from "~/components/input";
import { useTranslation } from "~/hooks";

export const Step2Details: FunctionComponent<CreateTokenStepProps> = (
  props
) => {
  const { config, setConfig } = props;
  const { t } = useTranslation();

  const uriError =
    config.uri.length > 0
      ? (() => {
          try {
            new URL(config.uri);
            return null;
          } catch {
            return t("tokenFactory.create.errors.uriInvalid");
          }
        })()
      : null;

  return (
    <StepBase step={2} {...props}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="body2 text-osmoverse-300">
            {t("tokenFactory.create.description")}
            <span className="ml-1 text-osmoverse-500">
              ({t("tokenFactory.create.optional")})
            </span>
          </label>
          <textarea
            className="body2 min-h-[80px] w-full resize-none rounded-lg border border-osmoverse-1000 bg-osmoverse-1000 p-3 text-white-high placeholder:text-osmoverse-500 focus:border-osmoverse-200 focus:outline-none"
            value={config.description}
            onChange={(e) => setConfig({ description: e.target.value })}
            placeholder={t("tokenFactory.create.descriptionPlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="body2 text-osmoverse-300">
            {t("tokenFactory.create.uri")}
            <span className="ml-1 text-osmoverse-500">
              ({t("tokenFactory.create.optional")})
            </span>
          </label>
          <InputBox
            currentValue={config.uri}
            onInput={(val) => setConfig({ uri: val })}
            placeholder="https://..."
            style={uriError ? "error" : "enabled"}
          />
          {uriError ? (
            <span className="caption text-missionError">{uriError}</span>
          ) : (
            <span className="caption text-osmoverse-500">
              {t("tokenFactory.create.uriHint")}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="body2 text-osmoverse-300">
            {t("tokenFactory.create.uriHash")}
            <span className="ml-1 text-osmoverse-500">
              ({t("tokenFactory.create.optional")})
            </span>
          </label>
          <InputBox
            currentValue={config.uriHash}
            onInput={(val) => setConfig({ uriHash: val })}
            placeholder={t("tokenFactory.create.uriHashPlaceholder")}
          />
          <span className="caption text-osmoverse-500">
            {t("tokenFactory.create.uriHashHint")}
          </span>
        </div>
      </div>
    </StepBase>
  );
};
