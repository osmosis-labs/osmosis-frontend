import { DecUtils, Int } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";

import { InactiveDelegationsList } from "~/components/stake/inactive-delegations-warning";
import { Button } from "~/components/ui/button";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { useInactiveDelegations } from "~/hooks/use-inactive-delegations";
import { ModalBase } from "~/modals/base";
import { useStore } from "~/stores";
import {
  getInactiveDelegationsToAlert,
  getInactiveValidatorAlertDismissalId,
  InactiveValidatorAlertDismissedKey,
} from "~/utils/inactive-delegations";

/** Delegations smaller than this (in whole OSMO) still show on /stake, but
 *  don't raise the app-wide alert. */
const MIN_ALERT_AMOUNT_OSMO = 1;

/** The stake page shows its own warnings, so the alert stays off it. */
const STAKE_PATHNAME = "/stake";

function readDismissedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(InactiveValidatorAlertDismissedKey) ?? "[]"
    );
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Tells a connected wallet, once per validator, that some of its stake sits
 * with validators outside the active set and earns nothing.
 */
export const InactiveValidatorsAlertModal = observer(() => {
  const router = useRouter();
  const { t } = useTranslation();
  const { chainStore, accountStore } = useStore();
  const { chainId, stakeCurrency } = chainStore.osmosis;
  const address = accountStore.getWallet(chainId)?.address ?? "";

  // the flag gates only this app-wide alert; the stake page always shows its
  // inactive-validator warnings
  const { inactiveValidatorAlerts } = useFeatureFlags();
  const { inactiveDelegations, isLoaded } = useInactiveDelegations({
    enabled: Boolean(inactiveValidatorAlerts),
  });

  // read synchronously so a dismissed alert can't flash open before an effect
  // restores the dismissals
  const [dismissedIds, setDismissedIds] = useState(readDismissedIds);

  const delegationsToAlert = useMemo(
    () =>
      getInactiveDelegationsToAlert(
        inactiveDelegations,
        address,
        dismissedIds,
        new Int(MIN_ALERT_AMOUNT_OSMO).mul(
          DecUtils.getTenExponentN(stakeCurrency.coinDecimals).truncate()
        )
      ),
    [inactiveDelegations, address, dismissedIds, stakeCurrency.coinDecimals]
  );

  const dismiss = useCallback(() => {
    const next = [
      ...new Set([
        ...dismissedIds,
        ...delegationsToAlert.map(({ operatorAddress }) =>
          getInactiveValidatorAlertDismissalId(address, operatorAddress)
        ),
      ]),
    ];
    setDismissedIds(next);
    try {
      window.localStorage.setItem(
        InactiveValidatorAlertDismissedKey,
        JSON.stringify(next)
      );
    } catch (e) {
      console.error(e);
    }
  }, [address, delegationsToAlert, dismissedIds]);

  const goToStake = useCallback(() => {
    dismiss();
    router.push(STAKE_PATHNAME);
  }, [dismiss, router]);

  const isOpen =
    isLoaded &&
    router.pathname !== STAKE_PATHNAME &&
    delegationsToAlert.length > 0;

  return (
    <ModalBase
      title={
        // padded so a long title wraps clear of the close button
        <h6 className="mx-auto px-12 text-center">
          {t("stake.inactiveValidators.title")}
        </h6>
      }
      isOpen={isOpen}
      onRequestClose={dismiss}
      className="flex max-w-[500px] flex-col gap-6"
    >
      <p className="body1 mt-4 text-osmoverse-300">
        {t("stake.inactiveValidators.alertDescription")}
      </p>
      <InactiveDelegationsList
        inactiveDelegations={delegationsToAlert}
        className="max-h-60 overflow-y-auto"
      />
      <div className="flex gap-3 md:flex-col">
        <Button variant="outline" className="flex-1" onClick={dismiss}>
          {t("stake.inactiveValidators.dismiss")}
        </Button>
        <Button variant="success" className="flex-1" onClick={goToStake}>
          {t("stake.inactiveValidators.goToStake")}
        </Button>
      </div>
    </ModalBase>
  );
});
