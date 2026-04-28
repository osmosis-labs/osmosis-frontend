import { FunctionComponent } from "react";

import { StepBase } from "~/components/complex/token/create/step-base";
import { CreateTokenStepProps } from "~/components/complex/token/create/types";
import { InputBox } from "~/components/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";

const BURN_ADDRESS = "osmo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmcn030";

export const Step3SupplyAdmin: FunctionComponent<CreateTokenStepProps> = (
  props
) => {
  const { config, setConfig, walletAddress } = props;
  const { t } = useTranslation();

  const isRenouncing = config.newAdmin === BURN_ADDRESS;

  const adminAddressError =
    config.changeAdminEnabled &&
    config.newAdmin !== "" &&
    !/^osmo1[a-z0-9]{38}$/.test(config.newAdmin)
      ? t("tokenFactory.create.errors.invalidAddress")
      : null;

  return (
    <StepBase step={3} {...props}>
      <div className="flex flex-col gap-5">
        {/* Mint section */}
        <div className="rounded-2xl border border-osmoverse-700 p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="body1">
                {t("tokenFactory.create.mintTokens")}
              </span>
              <span className="caption text-osmoverse-400">
                {t("tokenFactory.create.mintTokensHint")}
              </span>
            </div>
            <Switch
              checked={config.mintEnabled}
              onCheckedChange={(checked) => {
                setConfig({
                  mintEnabled: checked,
                  mintRecipient:
                    checked && config.mintRecipient === ""
                      ? walletAddress
                      : config.mintRecipient,
                });
              }}
            />
          </div>

          {config.mintEnabled && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="body2 text-osmoverse-300">
                  {t("tokenFactory.create.mintAmount")}
                </label>
                <InputBox
                  currentValue={config.mintAmount}
                  onInput={(val) => setConfig({ mintAmount: val })}
                  inputMode="decimal"
                  placeholder="1000000"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="body2 text-osmoverse-300">
                  {t("tokenFactory.create.mintRecipient")}
                </label>
                <InputBox
                  currentValue={config.mintRecipient}
                  onInput={(val) => setConfig({ mintRecipient: val })}
                  placeholder={
                    walletAddress || t("tokenFactory.create.mintRecipientHint")
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Admin section */}
        <div className="rounded-2xl border border-osmoverse-700 p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="body1">
                {t("tokenFactory.create.changeAdmin")}
              </span>
              <span className="caption text-osmoverse-400">
                {t("tokenFactory.create.changeAdminHint")}
              </span>
            </div>
            <Switch
              checked={config.changeAdminEnabled}
              onCheckedChange={(checked) => {
                setConfig({
                  changeAdminEnabled: checked,
                  newAdmin: checked ? config.newAdmin : "",
                });
              }}
            />
          </div>

          {config.changeAdminEnabled && (
            <div className="mt-4 flex flex-col gap-3">
              {!isRenouncing && (
                <div className="flex flex-col gap-1.5">
                  <label className="body2 text-osmoverse-300">
                    {t("tokenFactory.create.newAdminAddress")}
                  </label>
                  <InputBox
                    currentValue={config.newAdmin}
                    onInput={(val) => setConfig({ newAdmin: val })}
                    placeholder={t("tokenFactory.create.newAdminPlaceholder")}
                    style={adminAddressError ? "error" : "enabled"}
                  />
                  {adminAddressError && (
                    <span className="caption text-missionError">
                      {adminAddressError}
                    </span>
                  )}
                  <span className="caption text-osmoverse-500">
                    {t("tokenFactory.create.newAdminHint")}
                  </span>
                </div>
              )}
              {isRenouncing ? (
                <div className="flex flex-col gap-2 rounded-xl border border-missionError/40 bg-missionError/10 p-3">
                  <span className="caption text-missionError">
                    {t("tokenFactory.create.renounceWarning")}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfig({ newAdmin: "" })}
                  >
                    {t("tokenFactory.create.renounceCancel")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig({ newAdmin: BURN_ADDRESS })}
                >
                  {t("tokenFactory.create.renounceAdmin")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </StepBase>
  );
};
