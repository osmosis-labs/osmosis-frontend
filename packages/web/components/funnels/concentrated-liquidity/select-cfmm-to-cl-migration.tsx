import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ButtonHTMLAttributes, FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Disableable } from "~/components/types";
import { ModalBase, ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

import { useCfmmToClMigration } from "./use-cfmm-to-cl-migration";

export const SelectCffmToClMigration: FunctionComponent<
  { cfmmPoolId: string; onSuccessfulMigrate: () => void } & ModalBaseProps
> = observer((props) => {
  const { cfmmPoolId } = props;
  const t = useTranslation();

  const { derivedDataStore } = useStore();

  const { poolDetail } = derivedDataStore.getForPool(cfmmPoolId);

  const { isLinked, migrate } = useCfmmToClMigration(cfmmPoolId);

  if (!isLinked) return null;

  return (
    <ModalBase
      title={t("addConcentratedLiquidityPoolCta.migration.title")}
      {...props}
    >
      <div className="flex flex-col gap-3 p-3">
        {!poolDetail.userAvailableShares.toDec().isZero() && (
          <OptionButton
            title={t(
              "addConcentratedLiquidityPoolCta.migration.availableSharesTitle"
            )}
            description={t(
              "addConcentratedLiquidityPoolCta.migration.availableSharesDescription"
            )}
            onClick={() => {
              migrate({ cfmmShares: poolDetail.userAvailableShares })
                .catch(console.error)
                .then(() => props.onSuccessfulMigrate())
                .finally(() => props.onRequestClose());
            }}
          >
            <span className="caption ml-auto text-osmoverse-100">
              {t("addConcentratedLiquidityPoolCta.migration.balance")}{" "}
              {poolDetail.userAvailableShares.trim(true).toString() ?? ""} (
              {poolDetail.userAvailableValue.toString() ?? ""})
            </span>
          </OptionButton>
        )}
        <OptionButton
          disabled={poolDetail.userBondedShares.toDec().isZero()}
          title={t(
            "addConcentratedLiquidityPoolCta.migration.bondedSharesTitle"
          )}
          description={t(
            "addConcentratedLiquidityPoolCta.migration.bondedSharesDescription"
          )}
          onClick={() => {
            migrate({
              lockIds: poolDetail.userLockedAssets
                .flatMap(({ lockIds }) => lockIds)
                .concat(
                  poolDetail.userUnlockingAssets.flatMap(
                    ({ lockIds }) => lockIds
                  )
                ),
            })
              .catch(console.error)
              .then(() => props.onSuccessfulMigrate())
              .finally(() => props.onRequestClose());
          }}
        >
          <span className="caption ml-auto text-osmoverse-100">
            {t("addConcentratedLiquidityPoolCta.migration.available")}{" "}
            {poolDetail.userBondedShares.trim(true).toString() ?? ""} (
            {poolDetail.userBondedValue.toString() ?? ""})
          </span>
        </OptionButton>
      </div>
    </ModalBase>
  );
});

export const OptionButton: FunctionComponent<
  { title: string; description: string } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className"
  > &
    Disableable
> = (props) => (
  <button
    className={classNames(
      "flex flex-col gap-1 rounded-3xl border-2 border-osmoverse-700 bg-osmoverse-700 p-4 text-left hover:border-osmoverse-400",
      "transition-all",
      {
        "cursor-not-allowed opacity-50": props.disabled,
      }
    )}
    disabled={props.disabled}
    {...props}
  >
    <span className="subtitle1">{props.title}</span>
    <span className="body2 text-osmoverse-100">{props.description}</span>
    {props.children}
  </button>
);
