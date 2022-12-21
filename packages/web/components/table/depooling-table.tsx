import { FunctionComponent } from "react";
import classNames from "classnames";
import moment from "dayjs";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useWindowSize } from "../../hooks";
import { Info } from "../alert";
import { Table } from ".";
import { UnPoolWhitelistedPoolIds } from "../../config";
import { CustomClasses } from "../types";
import { useTranslation } from "react-multi-lang";

export const DepoolingTable: FunctionComponent<
  { poolId?: string; tableClassName?: string } & CustomClasses
> = observer(({ poolId, tableClassName, className }) => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const t = useTranslation();
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
        <span className="subtitle2">{t("pool.depoolings.titleMobile")}</span>
      ) : (
        <h6>{t("pool.depoolings.title")}</h6>
      )}
      {poolId && <Info size="subtle" message={t("pool.depoolings.note")} />}
      <Table
        className={classNames("md:caption w-full", tableClassName)}
        headerTrClassName="md:h-11"
        columnDefs={[
          { display: t("pool.depoolings.amount"), className: "!pl-8" },
          { display: t("pool.depoolings.unlock") },
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
