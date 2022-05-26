import { FunctionComponent } from "react";
import classNames from "classnames";
import moment from "dayjs";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useWindowSize } from "../../hooks";
import { Table } from ".";
import { UnPoolWhitelistedPoolIds } from "../../config";
import { CustomClasses } from "../types";

export const DepoolingTable: FunctionComponent<
  { poolId?: string; tableClassName?: string } & CustomClasses
> = observer(({ poolId, tableClassName, className }) => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const { isMobile } = useWindowSize();

  const queriesOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainId);
  const accountLockedResponse = queriesOsmosis.queryAccountLocked.get(
    account.bech32Address
  ).response;

  const showDepoolingTable =
    (poolId &&
      UnPoolWhitelistedPoolIds[poolId] &&
      accountLockedResponse &&
      accountLockedResponse.data.locks.find((lock) =>
        lock.coins.some((coin) => coin.denom.startsWith("gamm/pool/"))
      ) !== undefined) ||
    (!poolId &&
      accountLockedResponse &&
      accountLockedResponse.data.locks.find((lock) =>
        lock.coins.some((coin) => coin.denom.startsWith("gamm/pool/"))
      ) !== undefined);

  if (!showDepoolingTable) {
    return null;
  }

  const unlockingTokensExceptLPShares = queriesOsmosis.queryAccountLocked
    .get(account.bech32Address)
    .unlockingCoins.filter(
      (unlocking) =>
        !unlocking.amount.currency.coinMinimalDenom.startsWith("gamm/pool/")
    );

  if (unlockingTokensExceptLPShares.length === 0) {
    return null;
  }

  return (
    <div className={classNames("flex flex-col gap-4", className)}>
      {isMobile ? (
        <span className="subtitle2">Depoolings</span>
      ) : (
        <h6>Depoolings</h6>
      )}
      {poolId && (
        <div className="w-full p-2 rounded-lg border border-secondary-200">
          <span className="subtitle1 text-white-mid md:caption">
            Note: Depooling asset balance shown is a total across all pools, not
            on a per-pool basis
          </span>
        </div>
      )}
      <Table
        className={classNames("w-full md:caption", tableClassName)}
        headerTrClassName="md:h-11"
        columnDefs={[
          { display: "Amount", className: "!pl-8" },
          { display: "Unlock Complete" },
        ]}
        data={unlockingTokensExceptLPShares.map((share) => [
          {
            value: share.amount.maxDecimals(6).trim(true).toString(),
          },
          {
            value: moment(share.endTime).fromNow(),
          },
        ])}
      />
    </div>
  );
});
