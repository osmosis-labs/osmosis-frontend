import { CoinPretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { InactiveDelegation } from "~/utils/inactive-delegations";

export const inactiveStatusTranslationKey = (
  status: InactiveDelegation["status"]
) =>
  status === "jailed"
    ? "stake.inactiveValidators.statusJailed"
    : "stake.inactiveValidators.statusInactive";

/** Lists delegations to validators outside the active set, one row each. */
export const InactiveDelegationsList: FunctionComponent<{
  inactiveDelegations: InactiveDelegation[];
  className?: string;
}> = observer(({ inactiveDelegations, className }) => {
  const { t } = useTranslation();
  const { chainStore } = useStore();
  const osmo = chainStore.osmosis.stakeCurrency;

  return (
    <ul className={classNames("flex flex-col gap-2", className)}>
      {inactiveDelegations.map(
        ({ operatorAddress, moniker, status, amount }) => (
          <li
            key={operatorAddress}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex min-w-0 flex-col">
              <span className="body2 truncate text-osmoverse-100">
                {moniker}
              </span>
              <span className="caption text-rust-300">
                {t(inactiveStatusTranslationKey(status))}
              </span>
            </div>
            <span className="body2 shrink-0 text-osmoverse-200">
              {new CoinPretty(osmo, amount).maxDecimals(2).toString()}
            </span>
          </li>
        )
      )}
    </ul>
  );
});

/** Stake page callout for delegations that have stopped earning rewards. */
export const InactiveDelegationsWarning: FunctionComponent<{
  inactiveDelegations: InactiveDelegation[];
  onRedelegate: () => void;
}> = ({ inactiveDelegations, onRedelegate }) => {
  const { t } = useTranslation();

  if (!inactiveDelegations.length) return null;

  return (
    <div className="flex gap-3 rounded-[20px] border-2 border-rust-600 p-5 py-3">
      <Icon id="alert-triangle" className="h-6 w-6 shrink-0 text-rust-600" />
      <div className="flex min-w-0 flex-grow flex-col gap-3">
        <div className="flex flex-col">
          <h6 className="body2 font-semibold">
            {t("stake.inactiveValidators.title")}
          </h6>
          <p className="body2 text-osmoverse-300">
            {t("stake.inactiveValidators.squadDescription")}
          </p>
        </div>
        <InactiveDelegationsList inactiveDelegations={inactiveDelegations} />
        <Button
          variant="outline"
          size="md"
          className="self-start"
          onClick={onRedelegate}
        >
          {t("stake.inactiveValidators.redelegate")}
        </Button>
      </div>
    </div>
  );
};

/** One-line warning on the stake card when new stake would reach a validator
 *  that earns nothing. */
export const StakeToInactiveValidatorsWarning: FunctionComponent<{
  onRedelegate: () => void;
}> = ({ onRedelegate }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 rounded-[20px] border-2 border-rust-600 p-4 py-3">
      <Icon id="alert-triangle" className="h-5 w-5 shrink-0 text-rust-600" />
      <div className="flex flex-col items-start gap-1">
        <p className="body2 text-osmoverse-200">
          {t("stake.inactiveValidators.stakeWarning")}
        </p>
        <button
          className="body2 text-wosmongton-300 hover:text-wosmongton-200"
          onClick={onRedelegate}
        >
          {t("stake.inactiveValidators.editSquad")}
        </button>
      </div>
    </div>
  );
};
