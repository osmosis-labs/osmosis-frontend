import { Dec, RatePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";
import {
  type DuplicatePoolCheckResult,
  type ExistingPoolSummary,
} from "~/hooks/use-duplicate-pool-check";
import { formatPretty } from "~/utils/formatter";

interface DuplicatePoolCalloutProps
  extends Pick<
    DuplicatePoolCheckResult,
    "status" | "exactMatches" | "similarMatches"
  > {
  acknowledged: boolean;
  onToggleAcknowledged: () => void;
  onUseExistingPool?: (poolId: string) => void;
}

export const DuplicatePoolCallout: FunctionComponent<
  DuplicatePoolCalloutProps
> = ({
  status,
  exactMatches,
  similarMatches,
  acknowledged,
  onToggleAcknowledged,
  onUseExistingPool,
}) => {
  const { t } = useTranslation();

  if (
    status === "ready" &&
    exactMatches.length === 0 &&
    similarMatches.length === 0
  ) {
    return null;
  }

  if (status === "loading") {
    return (
      <div className="rounded-xl bg-osmoverse-900 px-4 py-3 text-osmoverse-300">
        <span className="caption">
          {t("pools.createPool.duplicateCheck.checking")}
        </span>
      </div>
    );
  }

  if (status === "error" && exactMatches.length === 0) {
    return (
      <div className="rounded-xl border border-rust-500 bg-osmoverse-900 px-4 py-3 text-osmoverse-300">
        <span className="caption">
          {t("pools.createPool.duplicateCheck.errorCaption")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {exactMatches.length > 0 && (
        <div className="rounded-xl border border-rust-500 bg-osmoverse-900 px-4 py-3">
          <div className="mb-2 flex flex-col gap-1">
            <span className="subtitle1 text-rust-300">
              {t("pools.createPool.duplicateCheck.exactTitle")}
            </span>
            <span className="caption text-osmoverse-300">
              {t("pools.createPool.duplicateCheck.exactCaption")}
            </span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {exactMatches.map((m) => (
              <PoolRow
                key={m.id}
                pool={m}
                onUseExistingPool={onUseExistingPool}
              />
            ))}
          </ul>
          <div className="mt-3 flex items-start gap-2">
            <Checkbox
              variant="destructive"
              checked={acknowledged}
              onClick={onToggleAcknowledged}
            />
            <label
              className="caption cursor-pointer text-osmoverse-200"
              onClick={onToggleAcknowledged}
            >
              {t("pools.createPool.duplicateCheck.acknowledge")}
            </label>
          </div>
        </div>
      )}
      {exactMatches.length === 0 && similarMatches.length > 0 && (
        <div className="rounded-xl border border-osmoverse-700 bg-osmoverse-900 px-4 py-3">
          <div className="mb-2 flex flex-col gap-1">
            <span className="subtitle1 text-osmoverse-100">
              {t("pools.createPool.duplicateCheck.similarTitle")}
            </span>
            <span className="caption text-osmoverse-300">
              {t("pools.createPool.duplicateCheck.similarCaption")}
            </span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {similarMatches.map((m) => (
              <PoolRow
                key={m.id}
                pool={m}
                onUseExistingPool={onUseExistingPool}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PoolRow: FunctionComponent<{
  pool: ExistingPoolSummary;
  onUseExistingPool?: (poolId: string) => void;
}> = ({ pool, onUseExistingPool }) => {
  const { t } = useTranslation();
  const fee = pool.feeRaw
    ? formatPretty(new RatePretty(new Dec(pool.feeRaw)))
    : "—";
  const symbolLabel = pool.symbols.filter(Boolean).join(" / ");
  const header = symbolLabel
    ? t("pools.createPool.duplicateCheck.poolRowWithSymbols", {
        poolId: pool.id,
        symbols: symbolLabel,
      })
    : t("pools.createPool.duplicateCheck.poolRow", { poolId: pool.id });

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-osmoverse-825 px-3 py-2">
      <div className="flex flex-col">
        <span className="body2 flex items-center gap-1.5">
          <PoolTypeIcon type={pool.type} />
          {header}
        </span>
        <span className="caption text-osmoverse-300">
          {t("pools.createPool.duplicateCheck.tvlLabel")}:{" "}
          {pool.totalFiatValueLocked.toString()}
          {" · "}
          {t("pools.createPool.duplicateCheck.feeLabel")}: {fee}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={pool.detailUrl}
          target="_blank"
          rel="noreferrer"
          className={classNames(
            "caption rounded-md bg-osmoverse-800 px-3 py-1.5 text-wosmongton-200 hover:bg-osmoverse-700"
          )}
        >
          {t("pools.createPool.duplicateCheck.viewPool")}
        </Link>
        {onUseExistingPool && (
          <button
            type="button"
            onClick={() => onUseExistingPool(pool.id)}
            className="caption rounded-md bg-wosmongton-700 px-3 py-1.5 text-white-full hover:bg-wosmongton-700/80"
          >
            {t("pools.createPool.duplicateCheck.useExistingPool")}
          </button>
        )}
      </div>
    </li>
  );
};

/** Renders the same pool-type glyph used in the pools table. Keeps the
 *  visual vocabulary consistent across the app so a Concentrated match
 *  reads the same whether you see it in this callout or on the pool list. */
const PoolTypeIcon: FunctionComponent<{
  type: ExistingPoolSummary["type"];
}> = ({ type }) => {
  if (type === "weighted") {
    return <Icon id="weighted-pool" width={16} height={16} />;
  }
  if (type === "stable") {
    return <Icon id="stable-pool" width={16} height={16} />;
  }
  if (type === "concentrated") {
    return <Icon id="concentrated-pool" width={16} height={16} />;
  }
  if (type === "cosmwasm-astroport-pcl") {
    return (
      <Image
        alt="astroport icon"
        src="/images/astroport-icon.png"
        height={16}
        width={16}
      />
    );
  }
  if (type === "cosmwasm-whitewhale") {
    return (
      <Image
        alt="white whale icon"
        src="/images/whitewhale-icon.png"
        height={16}
        width={16}
      />
    );
  }
  if (type === "cosmwasm-orderbook") {
    return <Icon id="open-book" width={16} height={16} />;
  }
  if (type === "cosmwasm-transmuter" || type === "cosmwasm-alloyed") {
    return <Icon id="custom-pool" width={16} height={16} />;
  }
  return null;
};
