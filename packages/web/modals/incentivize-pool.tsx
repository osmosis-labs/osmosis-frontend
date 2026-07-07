import { Dec, RatePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import { TokenSelect } from "~/components/control/token-select";
import { InputBox } from "~/components/input";
import { tError } from "~/components/localization";
import { useConnectWalletModalRedirect, useTranslation } from "~/hooks";
import { useIncentivizePoolConfig } from "~/hooks/ui-config/use-incentivize-pool-config";
import { useDailyEpochCountdown } from "~/hooks/use-daily-epoch-countdown";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

const DEFAULT_NUM_EPOCHS = "30";

/** The chain's x/incentives `min_value_for_distribution` param: per-recipient
 *  payouts worth less than this per epoch are silently skipped (spam/dust
 *  defense), and a reward denom with no OSMO pool route is never valued, so
 *  it never distributes. Surfaced as copy; update if governance changes it. */
const MIN_DISTR_VALUE_LABEL = "0.01 OSMO";

/** Guided flow for funding external incentives on a pool: create a new
 *  gauge (MsgCreateGauge) or top up an existing one (MsgAddToGauge).
 *  Share pools target a lockable duration; concentrated pools target the
 *  chain's no-lock gauge for in-range liquidity. */
export const IncentivizePoolModal: FunctionComponent<
  { poolId: string } & ModalBaseProps
> = observer((props) => {
  const { poolId } = props;
  const { t } = useTranslation();
  const {
    chainStore,
    accountStore,
    queriesStore,
    queriesExternalStore,
    priceStore,
  } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const address = account?.address ?? "";

  const { data: pool } = api.local.pools.getPool.useQuery({ poolId });
  const isConcentrated = pool?.type === "concentrated";

  const {
    selectedCurrency,
    setSelectedCurrency,
    config,
    createGauge,
    addToGauge,
  } = useIncentivizePoolConfig();

  // Reward token choices: the full registered asset list with the wallet's
  // balances attached, holdings sorted first. The amount input errors on
  // insufficient balance, so unheld assets stay selectable but unusable.
  const balances = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(address).balances;
  const selectableTokens = useMemo(
    () => balances.map((balance) => balance.balance),
    [balances]
  );
  // Default the reward token to OSMO when available.
  useEffect(() => {
    if (selectedCurrency !== undefined || selectableTokens.length === 0) return;
    const osmo = selectableTokens.find(
      (coin) => coin.currency.coinMinimalDenom === "uosmo"
    );
    setSelectedCurrency((osmo ?? selectableTokens[0]).currency);
  }, [selectedCurrency, selectableTokens, setSelectedCurrency]);

  // Existing external gauges on this pool, offered for top-up.
  const externalGauges =
    queriesExternalStore.queryActiveGauges.getExternalGaugesForPool(poolId);
  const [topUpGaugeId, setTopUpGaugeId] = useState<string | null>(null);

  // Lock-duration choices for share pools; concentrated pools use the
  // chain's no-lock gauge instead.
  const lockableDurationsRaw =
    queriesStore.get(chainId).osmosis?.queryLockableDurations.lockableDurations;
  // Only the longest lockup (14 days) is promoted for external incentives —
  // shorter gauges fragment rewards across durations for no benefit.
  const fixedDuration = useMemo(
    () =>
      lockableDurationsRaw && lockableDurationsRaw.length > 0
        ? lockableDurationsRaw[lockableDurationsRaw.length - 1]
        : undefined,
    [lockableDurationsRaw]
  );

  // Minimum position uptime for concentrated gauges: how long a position
  // must be in range before it qualifies (anti just-in-time liquidity).
  // Options come from the CL module's authorized-uptimes param; 1 hour is
  // the promoted default, 24 hours suits stable pairs.
  const authorizedUptimes =
    queriesStore.get(chainId).osmosis?.queryConcentratedLiquidityParams
      .authorizedUptimes;
  const [uptimeSeconds, setUptimeSeconds] = useState(3600);
  useEffect(() => {
    // Snap to an authorized value if the param set doesn't include ours.
    if (
      authorizedUptimes &&
      authorizedUptimes.length > 0 &&
      !authorizedUptimes.includes(uptimeSeconds)
    ) {
      setUptimeSeconds(
        authorizedUptimes.includes(3600)
          ? 3600
          : authorizedUptimes[authorizedUptimes.length - 1]
      );
    }
  }, [authorizedUptimes, uptimeSeconds]);

  const [epochsInput, setEpochsInput] = useState(DEFAULT_NUM_EPOCHS);
  const numEpochs = Number(epochsInput);
  const epochsValid = Number.isInteger(numEpochs) && numEpochs >= 1;

  // Start: next epoch by default, or a deliberate future time.
  const [customStartEnabled, setCustomStartEnabled] = useState(false);
  const [customStartInput, setCustomStartInput] = useState("");
  const customStartDate = useMemo(
    () => (customStartInput ? new Date(customStartInput) : undefined),
    [customStartInput]
  );
  const customStartValid =
    !customStartEnabled ||
    (customStartDate !== undefined &&
      !isNaN(customStartDate.getTime()) &&
      customStartDate.getTime() > Date.now());

  const epochCountdown = useDailyEpochCountdown();

  const perEpochEmission = useMemo(() => {
    if (!config.amount || !epochsValid) return undefined;
    try {
      return config.amount.quo(new Dec(numEpochs));
    } catch {
      return undefined;
    }
  }, [config.amount, epochsValid, numEpochs]);

  // Fiat stats for the configured emission: total value, value per day
  // (one epoch per day), and an annualized APR against the pool's current
  // liquidity. All best-effort — undefined when the asset can't be priced.
  const totalValue = config.amount
    ? priceStore.calculatePrice(config.amount)
    : undefined;
  const perDayValue =
    totalValue && epochsValid ? totalValue.quo(new Dec(numEpochs)) : undefined;
  const poolTvl = pool?.totalFiatValueLocked;
  const estApr = useMemo(() => {
    if (!perDayValue || !poolTvl || !poolTvl.toDec().isPositive())
      return undefined;
    return new RatePretty(
      perDayValue.toDec().mul(new Dec(365)).quo(poolTvl.toDec())
    );
  }, [perDayValue, poolTvl]);

  const isTopUp = topUpGaugeId !== null;
  const needsDuration = !isConcentrated && !isTopUp;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled:
        Boolean(config.error) ||
        !config.amount ||
        // An unpriceable reward asset is rejected at creation (the chain
        // requires an OSMO pool route to value it). The frontend price
        // lookup is an imperfect proxy for that protorev check, but
        // blocking beats letting the user sign a doomed tx.
        (Boolean(config.amount) && totalValue === undefined) ||
        (!isTopUp && !epochsValid) ||
        (!isTopUp && !customStartValid) ||
        (needsDuration && fixedDuration === undefined) ||
        // Concentrated gauges must carry an authorized uptime: hold the
        // button until the param set has loaded and contains the selection,
        // else the chain rejects the create.
        (isConcentrated &&
          !isTopUp &&
          (!authorizedUptimes || !authorizedUptimes.includes(uptimeSeconds))) ||
        Boolean(account?.txTypeInProgress),
      onClick: () => {
        const send = isTopUp
          ? addToGauge(topUpGaugeId)
          : createGauge({
              distributeTo: isConcentrated
                ? { type: "noLock", poolId, uptimeSeconds }
                : {
                    type: "byDuration",
                    denom: `gamm/pool/${poolId}`,
                    durationSeconds: fixedDuration!.asSeconds(),
                  },
              numEpochs,
              startTime:
                customStartEnabled && customStartDate
                  ? customStartDate
                  : undefined,
            });
        send
          .then(() => {
            queriesExternalStore.queryActiveGauges.waitFreshResponse();
            props.onRequestClose();
          })
          .catch(console.error);
      },
      children:
        (config.error ? t(...tError(config.error)) : false) ||
        (!isTopUp && !customStartValid
          ? t("incentivizePool.startInPast")
          : isTopUp
          ? t("incentivizePool.ctaTopUp", { gaugeId: topUpGaugeId ?? "" })
          : t("incentivizePool.ctaCreate")),
    },
    props.onRequestClose
  );

  return (
    <ModalBase
      title={t("incentivizePool.title", { poolId })}
      {...props}
      isOpen={props.isOpen && showModalBase}
    >
      <div className="flex flex-col gap-6 pt-4 md:gap-4">
        {externalGauges.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="subtitle1">
              {t("incentivizePool.existingGauges")}
            </span>
            <div className="flex flex-col gap-1">
              <GaugeChoiceRow
                label={t("incentivizePool.newGauge")}
                selected={!isTopUp}
                onSelect={() => setTopUpGaugeId(null)}
              />
              {externalGauges.map((gaugeQuery) => {
                const gaugeId = gaugeQuery.gauge?.id;
                if (gaugeId === undefined) return null;
                const remaining = gaugeQuery.coins
                  .map(({ remaining }) => formatPretty(remaining))
                  .join(", ");
                return (
                  <GaugeChoiceRow
                    key={gaugeId}
                    label={`#${gaugeId} · ${remaining} · ${t(
                      "incentivizePool.epochsLeft",
                      { epochs: gaugeQuery.remainingEpoch.toString() }
                    )}`}
                    selected={topUpGaugeId === gaugeId}
                    onSelect={() => setTopUpGaugeId(gaugeId)}
                  />
                );
              })}
            </div>
          </div>
        )}
        {!isTopUp && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex place-content-between items-center">
                <span className="subtitle1">
                  {t("incentivizePool.distributesToLabel")}
                </span>
                <span className="body2 text-osmoverse-200">
                  {isConcentrated
                    ? t("incentivizePool.distributesToNoLock")
                    : t("incentivizePool.distributesToLocked", {
                        duration: fixedDuration?.humanize() ?? "",
                      })}
                </span>
              </div>
              <span className="caption text-osmoverse-400">
                {isConcentrated
                  ? t("incentivizePool.noLockNote")
                  : t("incentivizePool.durationFixed", {
                      duration: fixedDuration?.humanize() ?? "",
                    })}
              </span>
            </div>
            {isConcentrated && (
              <div className="flex flex-col gap-2">
                <div className="flex place-content-between items-center gap-2">
                  <span className="subtitle1">
                    {t("incentivizePool.uptimeLabel")}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {(authorizedUptimes ?? [3600]).map((seconds) => (
                      <button
                        key={seconds}
                        type="button"
                        className={classNames(
                          "caption rounded-full px-3 py-1 transition-colors",
                          uptimeSeconds === seconds
                            ? "bg-wosmongton-500 text-white-full"
                            : "bg-osmoverse-700 text-osmoverse-300 hover:bg-osmoverse-600"
                        )}
                        onClick={() => setUptimeSeconds(seconds)}
                      >
                        {seconds < 1
                          ? t("incentivizePool.uptimeNone")
                          : dayjs.duration(seconds, "seconds").humanize()}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="caption text-osmoverse-400">
                  {t("incentivizePool.uptimeHelp")}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex place-content-between items-center">
                <span className="subtitle1">
                  {t("incentivizePool.startLabel")}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={classNames(
                      "caption rounded-full px-3 py-1 transition-colors",
                      !customStartEnabled
                        ? "bg-wosmongton-500 text-white-full"
                        : "bg-osmoverse-700 text-osmoverse-300 hover:bg-osmoverse-600"
                    )}
                    onClick={() => setCustomStartEnabled(false)}
                  >
                    {t("incentivizePool.startNextEpoch")}
                  </button>
                  <button
                    type="button"
                    className={classNames(
                      "caption rounded-full px-3 py-1 transition-colors",
                      customStartEnabled
                        ? "bg-wosmongton-500 text-white-full"
                        : "bg-osmoverse-700 text-osmoverse-300 hover:bg-osmoverse-600"
                    )}
                    onClick={() => setCustomStartEnabled(true)}
                  >
                    {t("incentivizePool.startCustom")}
                  </button>
                </div>
              </div>
              {customStartEnabled && (
                <input
                  type="datetime-local"
                  className="w-full rounded-lg bg-osmoverse-900 px-3 py-2 text-sm text-osmoverse-100 outline-none"
                  value={customStartInput}
                  onChange={(e) => setCustomStartInput(e.target.value)}
                />
              )}
              <span className="caption text-osmoverse-400">
                {customStartEnabled
                  ? t("incentivizePool.startCustomCaption")
                  : epochCountdown
                  ? t("incentivizePool.epochsCaption", {
                      countdown: epochCountdown,
                    })
                  : t("incentivizePool.epochsCaptionNoCountdown")}
              </span>
            </div>
            <div className="flex place-content-between items-center">
              <span className="subtitle1">
                {t("incentivizePool.epochsLabel")}
              </span>
              <InputBox
                className="w-24"
                type="number"
                currentValue={epochsInput}
                onInput={(value) => setEpochsInput(value)}
                placeholder=""
                rightEntry
              />
            </div>
          </>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex place-content-between items-center">
            <span className="subtitle1">
              {t("incentivizePool.rewardAmount")}
            </span>
            {config.balance && (
              <div className="caption flex gap-1 text-osmoverse-300">
                <span>{t("lockToken.availableToken")}</span>
                <span
                  className="cursor-pointer text-wosmongton-300"
                  onClick={() => config.setFraction(1)}
                >
                  {formatPretty(config.balance)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TokenSelect
              selectedTokenDenom={selectedCurrency?.coinDenom ?? ""}
              tokens={selectableTokens}
              onSelect={(tokenDenom) => {
                const match = selectableTokens.find(
                  (coin) => coin.currency.coinDenom === tokenDenom
                );
                if (match) setSelectedCurrency(match.currency);
              }}
              sortByBalances
            />
            <InputBox
              className="grow"
              type="number"
              currentValue={config.inputAmount}
              onInput={(value) => config.setAmount(value)}
              placeholder=""
              rightEntry
            />
          </div>
        </div>
        {!isTopUp && (
          <div className="flex flex-col gap-1 rounded-xl bg-osmoverse-900 p-3">
            <div className="flex place-content-between items-center">
              <span className="caption text-osmoverse-400">
                {t("incentivizePool.statsTotalValue")}
              </span>
              <span className="caption text-osmoverse-200">
                {totalValue ? formatPretty(totalValue) : "–"}
              </span>
            </div>
            <div className="flex place-content-between items-center">
              <span className="caption text-osmoverse-400">
                {t("incentivizePool.statsPerDay")}
              </span>
              <span className="caption text-osmoverse-200">
                {perDayValue
                  ? `${formatPretty(perDayValue)}${
                      perEpochEmission
                        ? ` · ${formatPretty(perEpochEmission)}`
                        : ""
                    }`
                  : "–"}
              </span>
            </div>
            <div className="flex place-content-between items-center">
              <span className="caption text-osmoverse-400">
                {t("incentivizePool.statsEstApr")}
              </span>
              <span className="caption text-osmoverse-200">
                {estApr ? formatPretty(estApr, { maxDecimals: 1 }) : "–"}
              </span>
            </div>
            <span className="caption text-osmoverse-500">
              {t("incentivizePool.statsAprCaption")}
            </span>
          </div>
        )}
        {!isTopUp && config.amount && totalValue === undefined && (
          <span className="caption text-rust-300">
            {t("incentivizePool.dustUnpriceable")}
          </span>
        )}
        {!isTopUp && perDayValue && perDayValue.toDec().lt(new Dec(1)) && (
          <span className="caption text-rust-300">
            {t("incentivizePool.dustBelowMin", {
              minValue: MIN_DISTR_VALUE_LABEL,
            })}
          </span>
        )}
        <span className="caption text-osmoverse-400">
          {!isTopUp
            ? `${t("incentivizePool.dustRule", {
                minValue: MIN_DISTR_VALUE_LABEL,
              })} ${t("incentivizePool.visibilityWarning")}`
            : t("incentivizePool.visibilityWarning")}
        </span>
        {accountActionButton}
      </div>
    </ModalBase>
  );
});

const GaugeChoiceRow: FunctionComponent<{
  label: string;
  selected: boolean;
  onSelect: () => void;
}> = ({ label, selected, onSelect }) => (
  <button
    type="button"
    className={classNames(
      "caption w-full rounded-xl border px-3 py-2 text-left transition-colors",
      selected
        ? "border-wosmongton-400 bg-osmoverse-700 text-osmoverse-100"
        : "border-osmoverse-600 text-osmoverse-300 hover:border-osmoverse-400"
    )}
    onClick={onSelect}
  >
    {label}
  </button>
);
