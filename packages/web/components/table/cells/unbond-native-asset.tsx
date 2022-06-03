import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import moment from "dayjs";
import { CoinPretty } from "@keplr-wallet/unit";
import { useStore } from "../../../stores";
import { Button } from "../../buttons";
import { InfoTooltip } from "../../tooltip";

/** Table cell that fully handles querying and unbonding of native assets: OSMO, ION. */
export const UnbondNativeAssetCell: FunctionComponent<{
  lockedNativeBalance?: CoinPretty;
}> = observer(({ lockedNativeBalance }) => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    queriesStore,
  } = useStore();

  if (!lockedNativeBalance || lockedNativeBalance.toDec().isZero()) {
    return null;
  }

  const account = accountStore.getAccount(chainId);

  const queriesOsmosis = queriesStore.get(chainId).osmosis!;
  const lockableDurations =
    queriesOsmosis.queryLockableDurations.lockableDurations;
  const accountLocked = queriesOsmosis.queryAccountLocked.get(
    account.bech32Address
  );

  let lockIds: string[] = [];
  let unlockingAmounts: { amount: CoinPretty; endTime: Date }[] = [];

  // get all locks and unbonding amounts for this currency
  for (const duration of lockableDurations) {
    const lock = accountLocked.getLockedCoinWithDuration(
      lockedNativeBalance.currency,
      duration
    );
    const unlocks = accountLocked.getUnlockingCoinWithDuration(
      lockedNativeBalance.currency,
      duration
    );
    lockIds = lockIds.concat(lock.lockIds);
    unlockingAmounts = unlockingAmounts.concat(unlocks);
  }

  // allow unbond
  return (
    <div className="flex items-center">
      {unlockingAmounts.length > 0 && (
        <InfoTooltip
          content={`Unbonding: ${unlockingAmounts
            .map(
              (lock) =>
                `${lock.amount.toString()} ${moment(lock.endTime).fromNow()}`
            )
            .join(", ")}`}
        />
      )}
      {lockIds.length > 0 && (
        <Button
          size="xs"
          type="arrow-sm"
          onClick={async () => {
            console.log("click unbond");
            try {
              await account.osmosis.sendBeginUnlockingMsg(lockIds);
            } catch {}
          }}
        >
          Unbond
        </Button>
      )}
    </div>
  );
});
