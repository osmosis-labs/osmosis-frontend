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

import { Icon, PoolAssetsIcon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";

export const UserUpgradesModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => {
    const { userUpgrades } = useStore();
    const t = useTranslation();

    return (
      <ModalBase {...props} className="!max-w-5xl" title={t("upgrades.title")}>
        <span className="body2 mx-auto my-4 text-osmoverse-200">
          {t("upgrades.detected")}
        </span>
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-auto p-4">
          {userUpgrades.cfmmToClUpgrades.map((upgrade) => (
            <CfmmToClUpgrade
              key={upgrade.cfmmPoolId + upgrade.clPoolId}
              {...upgrade}
              onViewSuccess={props.onRequestClose}
            />
          ))}
        </div>
        {/* NOTE: to add new types of upgrades, add additional members with the new type to UserUpgrades store, then map them here depending on priority. */}
      </ModalBase>
    );
  }
);

const CfmmToClUpgrade: FunctionComponent<
  | UserCfmmToClUpgrade
  | (SuccessfulUserCfmmToClUpgrade & { onViewSuccess: () => void })
> = observer((upgrade) => {
  const t = useTranslation();

  // this is an available upgrade
  return (
    <div className="flex w-full place-content-between items-center gap-8 rounded-2xl bg-osmoverse-700 p-6">
      {"sendUpgradeMsg" in upgrade ? (
        <>
          <div className="flex flex-col gap-6">
            <span className="subtitle1 text-osmoverse-100">
              {t("upgrades.positionUpgrade")}
            </span>
            <PoolUpgrade
              fromPoolId={upgrade.cfmmPoolId}
              toPoolId={upgrade.clPoolId}
            />
          </div>
          <div className="flex max-w-xs flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="subtitle1 text-osmoverse-100">
                {t("upgrades.superchargedLiquidity")}
              </span>
              <span className="body2 text-osmoverse-200">
                {t("upgrades.newSuperchargedPool")}
              </span>
            </div>
            <Button
              onClick={() =>
                (upgrade as UserCfmmToClUpgrade)
                  .sendUpgradeMsg()
                  .catch(console.error)
              }
            >
              {t("upgrades.upgrade")}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-6">
            <PoolCard poolId={upgrade.clPoolId} isDesiredPool />
            <div className="flex max-w-sm flex-col gap-2">
              <span className="subtitle1 text-osmoverse-100">
                {t("upgrades.superchargedLiquidity")}
              </span>
              <span className="body2 text-osmoverse-200">
                {t("upgrades.newSuperchargedPool")}
              </span>
            </div>
          </div>
          <div className="subtitle1 flex  max-w-sm flex-col gap-6">
            <span className="text-osmoverse-100">{t("upgrades.success")}</span>
            <div className="flex items-center gap-1">
              <Link href={`/pool/${upgrade.clPoolId}`} passHref>
                <a
                  onClick={() => upgrade.onViewSuccess()}
                  className="text-wosmongton-200 underline"
                >
                  {t("upgrades.clickHereToView")}
                </a>
              </Link>
              <Icon
                id="arrow-right"
                color={theme.colors.wosmongton[200]}
                height={20}
                width={20}
              />
            </div>
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
            {t("upgrades.current")}
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
          <span className="caption text-osmoverse-300">
            {t("upgrades.new")}
          </span>
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
        <div className="flex gap-4 rounded-2xlinset bg-osmoverse-700 p-4">
          <PoolAssetsIcon size="sm" assets={poolCurrencies} />
          <div className="flex flex-col">
            <span className="subtitle1 text-osmoverse-100">
              {poolCurrencies.map(({ coinDenom }) => coinDenom).join("/")}
            </span>
            <span className="caption text-osmoverse-300">
              {t("upgrades.pool")} #{poolId}
            </span>
          </div>
        </div>
      </div>
    );
  });

const ArrowRight: FunctionComponent = () => (
  <svg
    width="50"
    height="38"
    viewBox="0 0 50 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 27C3.44772 27 3 27.4477 3 28C3 28.5523 3.44772 29 4 29L4 27ZM46 28L36 22.2265L36 33.7735L46 28ZM7.5 29C8.05228 29 8.5 28.5523 8.5 28C8.5 27.4477 8.05228 27 7.5 27L7.5 29ZM14.5 27C13.9477 27 13.5 27.4477 13.5 28C13.5 28.5523 13.9477 29 14.5 29L14.5 27ZM21.5 29C22.0523 29 22.5 28.5523 22.5 28C22.5 27.4477 22.0523 27 21.5 27L21.5 29ZM28.5 27C27.9477 27 27.5 27.4477 27.5 28C27.5 28.5523 27.9477 29 28.5 29L28.5 27ZM35.5 29C36.0523 29 36.5 28.5523 36.5 28C36.5 27.4477 36.0523 27 35.5 27L35.5 29ZM42.5 27C41.9477 27 41.5 27.4477 41.5 28C41.5 28.5523 41.9477 29 42.5 29L42.5 27ZM4 29L7.5 29L7.5 27L4 27L4 29ZM14.5 29L21.5 29L21.5 27L14.5 27L14.5 29ZM28.5 29L35.5 29L35.5 27L28.5 27L28.5 29Z"
      fill="#736CA3"
    />
  </svg>
);
