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

  const {
    derivedDataStore,
    accountStore,
    chainStore: {
      osmosis: { chainId },
    },
  } = useStore();

  const account = accountStore.getAccount(chainId);

  const { sharePoolDetail } = derivedDataStore.getForPool(cfmmPoolId);

  const { isLinked, migrate } = useCfmmToClMigration(cfmmPoolId);

  if (!isLinked) return null;

  return (
    <ModalBase
      title={t("addConcentratedLiquidityPoolCta.migration.title")}
      {...props}
    >
      <div className="flex flex-col gap-3 p-3">
        {!sharePoolDetail.userAvailableShares.toDec().isZero() && (
          <OptionButton
            disabled={Boolean(account.txTypeInProgress)}
            title={t(
              "addConcentratedLiquidityPoolCta.migration.availableSharesTitle"
            )}
            description={t(
              "addConcentratedLiquidityPoolCta.migration.availableSharesDescription"
            )}
            onClick={() => {
              migrate({ cfmmShares: sharePoolDetail.userAvailableShares })
                .catch((e) => {
                  console.log("reject");
                  console.error(e);
                })
                .then((t) => {
                  console.log("then", t);
                  props.onSuccessfulMigrate();
                })
                .finally(() => props.onRequestClose());
            }}
          >
            <span className="caption ml-auto text-osmoverse-100">
              {t("addConcentratedLiquidityPoolCta.migration.balance")}{" "}
              {sharePoolDetail.userAvailableShares.trim(true).toString() ?? ""}{" "}
              ({sharePoolDetail.userAvailableValue.toString() ?? ""})
            </span>
          </OptionButton>
        )}
        <OptionButton
          disabled={
            sharePoolDetail.userBondedShares.toDec().isZero() ||
            Boolean(account.txTypeInProgress)
          }
          title={t(
            "addConcentratedLiquidityPoolCta.migration.bondedSharesTitle"
          )}
          description={t(
            "addConcentratedLiquidityPoolCta.migration.bondedSharesDescription"
          )}
          onClick={() => {
            migrate({
              lockIds: sharePoolDetail.userLockedAssets
                .flatMap(({ lockIds }) => lockIds)
                .concat(
                  sharePoolDetail.userUnlockingAssets.flatMap(
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
            {t("addConcentratedLiquidityPoolCta.migration.balance")}{" "}
            {sharePoolDetail.userBondedShares.trim(true).toString() ?? ""} (
            {sharePoolDetail.userBondedValue.toString() ?? ""})
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
