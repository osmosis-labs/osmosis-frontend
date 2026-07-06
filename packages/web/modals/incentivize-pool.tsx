import { Dec } from "@osmosis-labs/unit";
import classNames from "classnames";
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

/** Guided flow for funding external incentives on a pool: create a new
 *  gauge (MsgCreateGauge) or top up an existing one (MsgAddToGauge).
 *  Share pools target a lockable duration; concentrated pools target the
 *  chain's no-lock gauge for in-range liquidity. */
export const IncentivizePoolModal: FunctionComponent<
  { poolId: string } & ModalBaseProps
> = observer((props) => {
  const { poolId } = props;
  const { t } = useTranslation();
  const { chainStore, accountStore, queriesStore, queriesExternalStore } =
    useStore();
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

  // Reward token choices: the connected wallet's positive balances (you can
  // only fund a gauge with coins you hold).
  const balances = queriesStore
    .get(chainId)
    .queryBalances.getQueryBech32Address(address).balances;
  const selectableTokens = useMemo(
    () =>
      balances
        .map((balance) => balance.balance)
        .filter((coin) => coin.toDec().isPositive()),
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
  const lockableDurations = useMemo(
    () => lockableDurationsRaw ?? [],
    [lockableDurationsRaw]
  );
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  useEffect(() => {
    // External incentives conventionally target the longest lockup.
    if (durationSeconds === null && lockableDurations.length > 0)
      setDurationSeconds(
        lockableDurations[lockableDurations.length - 1].asSeconds()
      );
  }, [durationSeconds, lockableDurations]);

  const [epochsInput, setEpochsInput] = useState(DEFAULT_NUM_EPOCHS);
  const numEpochs = Number(epochsInput);
  const epochsValid = Number.isInteger(numEpochs) && numEpochs >= 1;

  const epochCountdown = useDailyEpochCountdown();

  const perEpochEmission = useMemo(() => {
    if (!config.amount || !epochsValid) return undefined;
    try {
      return config.amount.quo(new Dec(numEpochs));
    } catch {
      return undefined;
    }
  }, [config.amount, epochsValid, numEpochs]);

  const isTopUp = topUpGaugeId !== null;
  const needsDuration = !isConcentrated && !isTopUp;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled:
        Boolean(config.error) ||
        !config.amount ||
        (!isTopUp && !epochsValid) ||
        (needsDuration && durationSeconds === null) ||
        Boolean(account?.txTypeInProgress),
      onClick: () => {
        const send = isTopUp
          ? addToGauge(topUpGaugeId)
          : createGauge({
              distributeTo: isConcentrated
                ? { type: "noLock", poolId }
                : {
                    type: "byDuration",
                    denom: `gamm/pool/${poolId}`,
                    durationSeconds: durationSeconds!,
                  },
              numEpochs,
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
        (isTopUp
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
            {isConcentrated ? (
              <span className="caption text-osmoverse-300">
                {t("incentivizePool.noLockNote")}
              </span>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="subtitle1">
                  {t("incentivizePool.selectDuration")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {lockableDurations.map((duration) => (
                    <button
                      key={duration.asSeconds()}
                      type="button"
                      className={classNames(
                        "caption rounded-full px-3 py-1 transition-colors",
                        durationSeconds === duration.asSeconds()
                          ? "bg-wosmongton-500 text-white-full"
                          : "bg-osmoverse-700 text-osmoverse-300 hover:bg-osmoverse-600"
                      )}
                      onClick={() => setDurationSeconds(duration.asSeconds())}
                    >
                      {duration.humanize()}
                    </button>
                  ))}
                </div>
                <span className="caption text-osmoverse-400">
                  {t("incentivizePool.durationHelp")}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2">
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
              <span className="caption text-osmoverse-400">
                {epochCountdown
                  ? t("incentivizePool.epochsCaption", {
                      countdown: epochCountdown,
                    })
                  : t("incentivizePool.epochsCaptionNoCountdown")}
              </span>
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
        {!isTopUp && perEpochEmission && (
          <span className="caption text-osmoverse-300">
            {t("incentivizePool.perEpoch", {
              amount: formatPretty(perEpochEmission),
            })}
          </span>
        )}
        <span className="caption text-osmoverse-400">
          {t("incentivizePool.visibilityWarning")}
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
