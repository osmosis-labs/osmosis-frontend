import { observer } from "mobx-react-lite";
import { ButtonHTMLAttributes, FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { ModalBase, ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";

import { useCfmmToClMigration } from "./use-cfmm-to-cl-migration";

export const SelectCffmToClMigration: FunctionComponent<
  { cfmmPoolId: string } & ModalBaseProps
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
                .finally(() => props.onRequestClose());
            }}
          />
        )}
        {poolDetail.userLockedAssets.length > 0 && (
          <OptionButton
            title={t(
              "addConcentratedLiquidityPoolCta.migration.bondedSharesTitle"
            )}
            description={t(
              "addConcentratedLiquidityPoolCta.migration.bondedSharesDescription"
            )}
            onClick={() => {
              migrate({
                lockIds: poolDetail.userLockedAssets.flatMap(
                  (asset) => asset.lockIds
                ),
              })
                .catch(console.error)
                .finally(() => props.onRequestClose());
            }}
          />
        )}
      </div>
    </ModalBase>
  );
});

export const OptionButton: FunctionComponent<
  { title: string; description: string } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className"
  >
> = (props) => (
  <button
    className="flex flex-col gap-1 rounded-3xl border-2 border-osmoverse-700 bg-osmoverse-700 p-3 text-left hover:border-osmoverse-400"
    {...props}
  >
    <span className="subtitle1">{props.title}</span>
    <span className="body2 text-osmoverse-100">{props.description}</span>
  </button>
);
