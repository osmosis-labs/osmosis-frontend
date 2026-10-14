import { CoinPretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useStakeToEnterActiveSet } from "~/hooks/use-inactive-delegations";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { InactiveDelegation } from "~/utils/inactive-delegations";

export const inactiveStatusTranslationKey = (
  status: InactiveDelegation["status"]
) =>
  status === "jailed"
    ? "stake.inactiveValidators.statusJailed"
    : "stake.inactiveValidators.statusInactive";

/**
 * The status line for a delegation. A validator outside the active set (not
 * jailed) shows how much more stake it needs to rejoin, since it can return
 * at any time; otherwise, or until the data loads, the plain status.
 * Call from an observer component.
 */
export function useInactiveStatusLabel() {
  const { t } = useTranslation();
  const { chainStore } = useStore();
  const osmo = chainStore.osmosis.stakeCurrency;
  const stakeToEnter = useStakeToEnterActiveSet();

  return useCallback(
    ({ status, validatorTokens }: InactiveDelegation) => {
      if (status === "inactive" && validatorTokens) {
        const needed = stakeToEnter(validatorTokens);
        if (needed?.isPositive()) {
          return t("stake.inactiveValidators.statusInactiveShortfall", {
            amount: formatPretty(new CoinPretty(osmo, needed), {
              maximumSignificantDigits: 3,
              maxDecimals: osmo.coinDecimals,
            }),
          });
        }
      }
      return t(inactiveStatusTranslationKey(status));
    },
    [t, osmo, stakeToEnter]
  );
}

/** Jailed validators read as a problem; ones merely outside the active set
 *  may still be working their way back in, so they get a neutral label. */
export const inactiveStatusTextClass = (
  status: InactiveDelegation["status"]
) => (status === "jailed" ? "text-rust-300" : "text-osmoverse-300");

/** Red when any delegation is jailed, the softer rust-400 tone otherwise. */
export const inactiveWarningToneClasses = (hasJailed: boolean) =>
  hasJailed
    ? { border: "border-rust-600", icon: "text-rust-600" }
    : { border: "border-rust-400", icon: "text-rust-400" };

/** Lists delegations to validators outside the active set, one row each. */
export const InactiveDelegationsList: FunctionComponent<{
  inactiveDelegations: InactiveDelegation[];
  className?: string;
}> = observer(({ inactiveDelegations, className }) => {
  const { chainStore } = useStore();
  const osmo = chainStore.osmosis.stakeCurrency;
  const statusLabel = useInactiveStatusLabel();

  return (
    <ul className={classNames("flex flex-col gap-2", className)}>
      {inactiveDelegations.map((delegation) => {
        const { operatorAddress, moniker, status, amount } = delegation;
        return (
          <li
            key={operatorAddress}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex min-w-0 flex-col">
              <span className="body2 truncate text-osmoverse-100">
                {moniker}
              </span>
              <span
                className={classNames(
                  "caption",
                  inactiveStatusTextClass(status)
                )}
              >
                {statusLabel(delegation)}
              </span>
            </div>
            <span className="body2 shrink-0 text-osmoverse-200">
              {new CoinPretty(osmo, amount).maxDecimals(2).toString()}
            </span>
          </li>
        );
      })}
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

  const tone = inactiveWarningToneClasses(
    inactiveDelegations.some(({ status }) => status === "jailed")
  );

  return (
    <div
      className={classNames(
        "flex gap-3 rounded-[20px] border-2 p-5 py-3",
        tone.border
      )}
    >
      <Icon
        id="alert-triangle"
        className={classNames("h-6 w-6 shrink-0", tone.icon)}
      />
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
  /** Whether any of the user's inactive validators is jailed. */
  hasJailed: boolean;
}> = ({ onRedelegate, hasJailed }) => {
  const { t } = useTranslation();
  const tone = inactiveWarningToneClasses(hasJailed);

  return (
    <div
      className={classNames(
        "flex gap-3 rounded-[20px] border-2 p-4 py-3",
        tone.border
      )}
    >
      <Icon
        id="alert-triangle"
        className={classNames("h-5 w-5 shrink-0", tone.icon)}
      />
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
