import { FunctionComponent } from "react";

import { CreateTokenSuccessProps } from "~/components/complex/token/create/types";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { TOKENFACTORY_BURN_ADDRESS } from "~/utils/tokenfactory";

export const Step5Success: FunctionComponent<CreateTokenSuccessProps> = ({
  config,
  walletAddress,
  onClose,
}) => {
  const { t } = useTranslation();
  const fullDenom = `factory/${walletAddress}/${config.subdenom}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <span className="text-3xl">🎉</span>
        <h6 className="text-white-high">
          {t("tokenFactory.create.successTitle")}
        </h6>
        <p className="body2 text-osmoverse-300">
          {t("tokenFactory.create.successSubtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-osmoverse-900 p-5">
        <Row label={t("tokenFactory.create.confirmDenom")} value={fullDenom} />
        <Row label={t("tokenFactory.create.confirmName")} value={config.name} />
        <Row
          label={t("tokenFactory.create.confirmSymbol")}
          value={config.symbol}
        />
        <Row
          label={t("tokenFactory.create.confirmDecimals")}
          value={config.decimals.toString()}
        />
        {config.mintEnabled && config.mintAmount && (
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

      <p className="caption text-center text-osmoverse-400">
        {t("tokenFactory.create.successListHint")}
      </p>

      <Button onClick={onClose}>{t("tokenFactory.create.successClose")}</Button>
    </div>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="body2 shrink-0 text-osmoverse-400">{label}</span>
      <span className="body2 break-all text-right text-white-high">
        {value}
      </span>
    </div>
  );
}
