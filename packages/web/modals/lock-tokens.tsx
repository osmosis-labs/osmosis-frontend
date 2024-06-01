import { CoinPretty } from "@keplr-wallet/unit";
import { BondDuration } from "@osmosis-labs/server";
import classNames from "classnames";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import { InputBox } from "~/components/input";
import { tError } from "~/components/localization";
import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";
import { useConnectWalletModalRedirect } from "~/hooks";
import { useAmountInput } from "~/hooks/input/use-amount-input";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const LockTokensModal: FunctionComponent<
  {
    poolId: string;
    amountConfig: ReturnType<typeof useAmountInput>;
    /** `electSuperfluid` is left undefined if it is irrelevant- if the user has already opted into superfluid in the past. */
    onLockToken: (duration: Duration, electSuperfluid?: boolean) => void;
    bondDurations?: BondDuration[];
    /** Coin to lock, otherwise will be assumed to be shares for given pool id. */
    availableShares?: CoinPretty;
  } & ModalBaseProps
> = observer((props) => {
  const {
    poolId,
    amountConfig: config,
    onLockToken,
    bondDurations: givenBondDurations,
    availableShares: givenAvailableShares,
  } = props;
  const { t } = useTranslation();

  const { accountStore } = useStore();

  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const address = account?.address ?? "";

  const { data: bondDurations_ } =
    api.edge.pools.getSharePoolBondDurations.useQuery(
      {
        poolId: poolId,
        userOsmoAddress: address,
      },
      {
        enabled: !givenBondDurations && Boolean(address),

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );
  const bondDurations = useMemo(
    () =>
      (givenBondDurations ?? bondDurations_ ?? []).filter((bd) => bd.bondable),
    [givenBondDurations, bondDurations_]
  );

  const { data: userSharePool } = api.edge.pools.getUserSharePool.useQuery(
    {
      poolId: poolId,
      userOsmoAddress: address,
    },
    {
      enabled: !givenAvailableShares && Boolean(address),

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  const availableShares =
    givenAvailableShares ?? userSharePool?.availableShares;

  /** If they have a superfluid validator already, they will automatically SFS stake if they select the highest gauge. (Cant be undone)
   *  TODO: perhaps we should display this in the view somehow
   */
  const superfluidBondDuration =
    bondDurations[bondDurations.length - 1]?.superfluid;
  const isSuperfluid = Boolean(superfluidBondDuration);
  const hasSuperfluidValidator = Boolean(
    superfluidBondDuration?.delegated || superfluidBondDuration?.undelegating
  );

  console.log({ hasSuperfluidValidator });

  // component state
  const [selectedDurationIndex, setSelectedDurationIndex] = useState<
    number | null
  >(null);

  /** Superfluid duration assumed to be longest duration in lockableDurations
   *  chain parameter.
   */
  const selectedDuration = bondDurations.find(
    (_, index) => index === selectedDurationIndex
  );
  const superfluidDurationSelected =
    selectedDurationIndex !== null &&
    bondDurations.length > selectedDurationIndex &&
    selectedDuration &&
    selectedDuration.duration.asMilliseconds() ===
      superfluidBondDuration?.duration?.asMilliseconds();

  const [electSuperfluid, setElectSuperfluid] = useState(false);
  useEffect(() => {
    if (isSuperfluid) {
      setElectSuperfluid(true);
    }
  }, [isSuperfluid]);

  const superfluidApr =
    bondDurations[bondDurations.length - 1]?.superfluid?.apr;
  let selectedApr =
    selectedDurationIndex !== null
      ? bondDurations[selectedDurationIndex]?.aggregateApr
      : undefined;
  const superfluidInEffect = electSuperfluid && superfluidDurationSelected;

  console.log({ hasSuperfluidValidator, superfluidInEffect });

  if (
    selectedApr &&
    superfluidApr &&
    superfluidDurationSelected &&
    !electSuperfluid
  ) {
    selectedApr = selectedApr.sub(superfluidApr);
  }

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled:
        Boolean(config.error) ||
        !Boolean(selectedDuration) ||
        Boolean(account?.txTypeInProgress),
      onClick: () => {
        if (selectedDuration) {
          onLockToken(
            selectedDuration.duration,
            !hasSuperfluidValidator && superfluidInEffect
          );
        } else {
          console.warn("No duration selected");
        }
      },
      children:
        (config.error ? t(...tError(config.error)) : false) ||
        (superfluidInEffect && !hasSuperfluidValidator
          ? t("lockToken.buttonNext")
          : superfluidInEffect
          ? t("lockToken.buttonBondStake")
          : t("lockToken.buttonBond") || undefined),
    },
    props.onRequestClose
  );

  // auto select the gauge if there's one
  useEffect(() => {
    if (bondDurations.length === 1) setSelectedDurationIndex(0);
  }, [bondDurations]);

  return (
    <ModalBase
      title={t("lockToken.titleInPool", { poolId })}
      {...props}
      isOpen={props.isOpen && showModalBase}
    >
      <div className="flex flex-col gap-8 md:gap-4">
        <span className="subtitle1 text-center">
          {t("lockToken.selectPeriod")}
        </span>
        <h2 className="text-center md:text-h3 md:font-h3">
          <span
            className={classNames({ "text-superfluid": superfluidInEffect })}
          >
            {selectedApr?.maxDecimals(2).toString() ?? "0%"}
          </span>{" "}
          {t("pool.APR")}
        </h2>
        <div className="flex gap-4 overflow-x-auto p-[3px] md:gap-1">
          {bondDurations.map(({ duration, aggregateApr }, index) => (
            <LockupItem
              key={index}
              duration={duration.humanize()}
              isSelected={index === selectedDurationIndex}
              onSelect={() => setSelectedDurationIndex(index)}
              apr={aggregateApr?.maxDecimals(2).trim(true).toString()}
            />
          ))}
        </div>
        {isSuperfluid && (
          <div className="flex gap-3">
            <Checkbox
              id="superfluid-checkbox"
              variant="secondary"
              checked={superfluidDurationSelected && electSuperfluid}
              onClick={() => setElectSuperfluid(!electSuperfluid)}
              disabled={!superfluidDurationSelected || hasSuperfluidValidator}
            />
            <label
              htmlFor="superfluid-checkbox"
              className={classNames("flex cursor-pointer flex-col gap-1", {
                "opacity-30":
                  !superfluidDurationSelected || hasSuperfluidValidator,
              })}
            >
              <h6 className="md:text-subtitle1 md:font-subtitle1">
                {t("lockToken.superfluidStake")}{" "}
                {superfluidApr && `(+${superfluidApr.maxDecimals(0)} APR)`}
              </h6>
              {superfluidBondDuration && (
                <span className="caption text-osmoverse-300">
                  {t("lockToken.bondingRequirement", {
                    numDays: superfluidBondDuration.duration
                      .asDays()
                      .toString(),
                  })}
                </span>
              )}
            </label>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex place-content-between items-center">
            <span className="subtitle1">{t("lockToken.amountToBond")}</span>
            {availableShares && (
              <div className="caption flex gap-1">
                <span>{t("lockToken.availableToken")}</span>
                <span
                  className="cursor-pointer text-wosmongton-300"
                  onClick={() => config.setFraction(1)}
                >
                  {t("pool.sharesAmount", {
                    shares: availableShares
                      .trim(true)
                      .hideDenom(true)
                      .toString(),
                  })}
                </span>
              </div>
            )}
          </div>
          <InputBox
            type="number"
            currentValue={config.inputAmount}
            onInput={(value) => config.setAmount(value)}
            placeholder=""
            rightEntry
          />
        </div>
        {accountActionButton}
      </div>
    </ModalBase>
  );
});

const LockupItem: FunctionComponent<{
  duration: string;
  isSelected: boolean;
  onSelect: () => void;
  apr?: string;
}> = ({ duration, isSelected, onSelect, apr }) => (
  <button
    onClick={onSelect}
    className={classNames(
      "w-full cursor-pointer rounded-xl px-5 py-5 transition-colors md:px-3 md:py-3.5",
      isSelected
        ? "-m-px !border-[3px] border-osmoverse-200 bg-osmoverse-700"
        : "border border-osmoverse-600 hover:-m-px hover:border-2 hover:border-osmoverse-200"
    )}
  >
    <div className="flex w-full flex-col place-content-between text-center">
      <h5>{duration}</h5>
      {apr && (
        <p className="subtitle1 mt-1 text-wosmongton-200 md:m-0">{apr}</p>
      )}
    </div>
  </button>
);
