import classNames from "classnames";
import { FunctionComponent, useState } from "react";

import { StepBase } from "~/components/complex/token/create/step-base";
import { CreateTokenStepProps } from "~/components/complex/token/create/types";
import { InputBox } from "~/components/input";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";

export const Step3SupplyAdmin: FunctionComponent<CreateTokenStepProps> = (
  props
) => {
  const { config, setConfig, walletAddress } = props;
  const { t } = useTranslation();
  const [renounceConfirmed, setRenounceConfirmed] = useState(false);

  const isRenouncing = config.changeAdminEnabled && config.newAdmin === "";
  const adminAddressError =
    config.changeAdminEnabled &&
    config.newAdmin !== "" &&
    !/^osmo1[a-z0-9]{38}$/.test(config.newAdmin)
      ? t("tokenFactory.create.errors.invalidAddress")
      : null;

  const extraCanAdvance = isRenouncing ? renounceConfirmed : undefined;

  return (
    <StepBase step={3} {...props} extraCanAdvance={extraCanAdvance}>
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
                setConfig({ changeAdminEnabled: checked });
                if (!checked) setRenounceConfirmed(false);
              }}
            />
          </div>

          {config.changeAdminEnabled && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="body2 text-osmoverse-300">
                  {t("tokenFactory.create.newAdminAddress")}
                </label>
                <InputBox
                  currentValue={config.newAdmin}
                  onInput={(val) => {
                    setConfig({ newAdmin: val });
                    setRenounceConfirmed(false);
                  }}
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

              {isRenouncing && (
                <button
                  className={classNames(
                    "flex items-center gap-3 rounded-xl border p-3 text-left",
                    renounceConfirmed
                      ? "border-rust-500 bg-rust-500/10"
                      : "border-osmoverse-700"
                  )}
                  onClick={() => setRenounceConfirmed((v) => !v)}
                >
                  <div
                    className={classNames(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
                      renounceConfirmed
                        ? "border-rust-500 bg-rust-500"
                        : "border-osmoverse-500"
                    )}
                  >
                    {renounceConfirmed && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="caption text-rust-400">
                    {t("tokenFactory.create.renounceWarning")}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </StepBase>
  );
};
