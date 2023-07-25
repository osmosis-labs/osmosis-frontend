import { RatePretty } from "@keplr-wallet/unit";
import {
  SuccessfulUserCfmmToClUpgrade,
  UserCfmmToClUpgrade,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { PoolAssetsIcon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

export const UserUpgradesFunnel: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    const { userUpgrades } = useStore();
    const t = useTranslation();

    return (
      <ModalBase {...props} title={t("upgrades.title")}>
        <span className="body2 text-osmoverse-200">
          {t("upgrades.detected")}
        </span>
        {userUpgrades.cfmmToClUpgrade.map((upgrade) => (
          <CfmmToClUpgrade
            key={upgrade.cfmmPoolId + upgrade.clPoolId}
            {...upgrade}
          />
        ))}
      </ModalBase>
    );
  }
);

const CfmmToClUpgrade: FunctionComponent<
  UserCfmmToClUpgrade | SuccessfulUserCfmmToClUpgrade
> = observer((upgrade) => {
  const t = useTranslation();

  // this is an available upgrade
  return (
    <div className="flex w-full place-content-between items-center rounded-2xl bg-osmoverse-700 p-6">
      {"sendUpgradeMsg" in upgrade ? (
        <>
          <div className="flex flex-col gap-6">
            <span className="subtitle1 text-osmoverse-100">
              {t("upgrade.positionUpgrade")}
            </span>
            <PoolUpgrade
              fromPoolId={upgrade.cfmmPoolId}
              toPoolId={upgrade.clPoolId}
            />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="subtitle1 text-osmoverse-100">
                {t("upgrade.superchargedLiquidity")}
              </span>
              <span className="body2 text-osmoverse-200">
                {t("upgrade.newSuperchargedPool")}
              </span>
            </div>
            <Button
              onClick={() => (upgrade as UserCfmmToClUpgrade).sendUpgradeMsg()}
            >
              {t("upgrade.upgrade")}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-6">
            <PoolCard poolId={upgrade.clPoolId} isDesiredPool />
            <div className="flex flex-col gap-2">
              <span className="subtitle1 text-osmoverse-100">
                {t("upgrades.superchargedLiquidity")}
              </span>
              <span className="body2 text-osmoverse-200">
                {t("upgrades.newSuperchargedPool")}
              </span>
            </div>
          </div>
          <div className="subtitle1 flex flex-col gap-6">
            <span className="text-osmoverse-100">{t("upgrades.success")}</span>
            <Link href={`/pool/${upgrade.clPoolId}`} passHref>
              <a className="text-wosmongton-200">
                {t("upgrades.clickHereToView")}
              </a>
            </Link>
          </div>
        </>
      )}
    </div>
  );
});

const PoolUpgrade: FunctionComponent<{
  fromPoolId: string;
  toPoolId: string;
  fromApr?: RatePretty;
  toApr?: RatePretty;
}> = observer(({ fromPoolId, toPoolId, fromApr, toApr }) => {
  const t = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          <span className="caption text-osmoverse-300">
            {t("upgrade.current")}
          </span>
          {fromApr && (
            <div className="subtitle1 flex items-center rounded-full border-osmoverse-600">
              <span>{fromApr.maxDecimals(0).toString()}</span>
              <span className="text-osmoverse-300">{t("pool.APR")}</span>
            </div>
          )}
        </div>
        <PoolCard poolId={fromPoolId} />
      </div>
      <ArrowRight />
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          <span className="caption text-osmoverse-300">{t("upgrade.new")}</span>
          {toApr && (
            <div className="subtitle1 flex items-center rounded-full bg-supercharged text-osmoverse-1000">
              <span>{toApr.maxDecimals(0).toString()}</span>
              <span>{t("pool.APR")}</span>
            </div>
          )}
        </div>
        <PoolCard poolId={toPoolId} isDesiredPool />
      </div>
    </div>
  );
});

const PoolCard: FunctionComponent<{ poolId: string; isDesiredPool?: boolean }> =
  observer(({ poolId, isDesiredPool = false }) => {
    const { queriesStore, chainStore } = useStore();
    const t = useTranslation();

    const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId)
      .osmosis!;

    const pool = osmosisQueries.queryPools.getPool(poolId);

    const poolCurrencies =
      pool?.poolAssets.map(({ amount }) => amount.currency) ?? [];

    return (
      <div
        className={classNames(
          "rounded-2xl p-[2px]",
          isDesiredPool ? "bg-supercharged" : "bg-osmoverse-600"
        )}
      >
        <div className="flex gap-1 rounded-2xlinset p-4">
          <PoolAssetsIcon assets={poolCurrencies} />
          <span className="subtitle1 text-osmoverse-100">
            {poolCurrencies.map(({ coinDenom }) => coinDenom).join("/")}
          </span>
          <span className="caption text-osmoverse-300">
            {t("upgrades.pool")} #{poolId}
          </span>
        </div>
      </div>
    );
  });

const ArrowRight: FunctionComponent = () => (
  <svg
    width="48"
    height="70"
    viewBox="0 0 48 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 63C3.44772 63 3 63.4477 3 64C3 64.5523 3.44772 65 4 65L4 63ZM44 64L34 58.2265L34 69.7735L44 64ZM7.33333 65C7.88562 65 8.33333 64.5523 8.33333 64C8.33333 63.4477 7.88562 63 7.33333 63L7.33333 65ZM14 63C13.4477 63 13 63.4477 13 64C13 64.5523 13.4477 65 14 65L14 63ZM20.6667 65C21.219 65 21.6667 64.5523 21.6667 64C21.6667 63.4477 21.219 63 20.6667 63L20.6667 65ZM27.3333 63C26.781 63 26.3333 63.4477 26.3333 64C26.3333 64.5523 26.781 65 27.3333 65L27.3333 63ZM34 65C34.5523 65 35 64.5523 35 64C35 63.4477 34.5523 63 34 63L34 65ZM40.6667 63C40.1144 63 39.6667 63.4477 39.6667 64C39.6667 64.5523 40.1144 65 40.6667 65L40.6667 63ZM4 65L7.33333 65L7.33333 63L4 63L4 65ZM14 65L20.6667 65L20.6667 63L14 63L14 65ZM27.3333 65L34 65L34 63L27.3333 63L27.3333 65Z"
      fill="#736CA3"
    />
  </svg>
);
