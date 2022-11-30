import { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { AmountConfig } from "@keplr-wallet/hooks";
import { Duration } from "dayjs/plugin/duration";
import { useStore } from "../stores";
import { InputBox } from "../components/input";
import { CheckBox } from "../components/control";
import { tError } from "../components/localization";
import { ModalBase, ModalBaseProps } from "./base";
import {
  useConnectWalletModalRedirect,
  useBondLiquidityConfig,
  usePoolDetailConfig,
  useSuperfluidPoolConfig,
  useCurrentLanguage,
} from "../hooks";
import { ExternalIncentiveGaugeAllowList } from "../config";
import { useTranslation } from "react-multi-lang";

export const LockTokensModal: FunctionComponent<
  {
    poolId: string;
    amountConfig: AmountConfig;
    /** `electSuperfluid` is left undefined if it is irrelevant- if the user has already opted into superfluid in the past. */
    onLockToken: (duration: Duration, electSuperfluid?: boolean) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId, amountConfig: config, onLockToken } = props;
  const t = useTranslation();
  const locale = useCurrentLanguage();

  const { chainStore, accountStore, queriesStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainId);
  const { bech32Address } = account;

  // initialize pool data stores once root pool store is loaded
  const { poolDetailConfig } = usePoolDetailConfig(poolId);
  const { superfluidPoolConfig } = useSuperfluidPoolConfig(poolDetailConfig);
  const bondLiquidityConfig = useBondLiquidityConfig(bech32Address, poolId);

  const bondDurations =
    bondLiquidityConfig?.getAllowedBondDurations(
      (denom) => chainStore.getChain(chainId).forceFindCurrency(denom),
      ExternalIncentiveGaugeAllowList[poolId]
    ) ?? [];
  const availableToken = queryOsmosis.queryGammPoolShare.getAvailableGammShare(
    bech32Address,
    poolId
  );
  const isSendingMsg = account.txTypeInProgress !== "";
  /** If they have a superfluid validator already, they will automatically SFS stake if they select the highest gauge. (Cant be undone)
   *  TODO: perhaps we should display this in the view somehow
   */
  const hasSuperfluidValidator =
    superfluidPoolConfig?.superfluid?.delegations &&
    superfluidPoolConfig.superfluid.delegations.length > 0;
  const superfluidApr =
    bondDurations[bondDurations.length - 1]?.superfluid?.apr;

  // component state
  const [selectedDurationIndex, setSelectedDurationIndex] = useState<
    number | null
  >(null);

  /** Superfluid duration assumed to be longest duration in lockableDurations
   *  chain parameter.
   */
  const longestDuration = poolDetailConfig?.longestDuration;
  const superfluidDurationSelected =
    selectedDurationIndex !== null &&
    bondDurations.length > selectedDurationIndex &&
    bondDurations[selectedDurationIndex].duration.asMilliseconds() ===
      longestDuration?.asMilliseconds();

  const [electSuperfluid, setElectSuperfluid] = useState(false);
  useEffect(() => {
    if (superfluidPoolConfig?.isSuperfluid) {
      setElectSuperfluid(true);
    }
  }, [superfluidPoolConfig?.isSuperfluid]);

  let selectedApr =
    selectedDurationIndex !== null
      ? bondDurations[selectedDurationIndex]?.aggregateApr
      : undefined;
  const superfluidInEffect = electSuperfluid && superfluidDurationSelected;

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
        config.error !== undefined ||
        selectedDurationIndex === null ||
        isSendingMsg,
      onClick: () => {
        const bondableDuration = bondDurations.find(
          (_, index) => index === selectedDurationIndex
        );
        if (bondableDuration) {
          onLockToken(
            bondableDuration.duration,
            // Allow superfluid only for the highest gauge index.
            // On the mainnet, this standard works well
            // Logically it could be a problem if it's not the mainnet
            hasSuperfluidValidator ||
              !superfluidPoolConfig?.isSuperfluid ||
              !superfluidDurationSelected
              ? undefined
              : electSuperfluid
          );
        }
      },
      children:
        (config.error ? t(...tError(config.error)) : false) ||
        (electSuperfluid &&
        !hasSuperfluidValidator &&
        superfluidDurationSelected
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
        <h2 className="text-center md:font-h3 md:text-h3">
          <span
            className={classNames({ "text-superfluid": superfluidInEffect })}
          >
            {selectedApr?.maxDecimals(2).toString() ?? "0%"}
          </span>{" "}
          {t("pool.APR")}
        </h2>
        <div className="flex gap-4 md:gap-1 overflow-x-auto p-[3px]">
          {bondDurations.map(({ duration, aggregateApr }, index) => (
            <LockupItem
              key={index}
              duration={duration.locale(locale).humanize()}
              isSelected={index === selectedDurationIndex}
              onSelect={() => setSelectedDurationIndex(index)}
              apr={aggregateApr?.maxDecimals(2).trim(true).toString()}
            />
          ))}
        </div>
        {superfluidPoolConfig?.isSuperfluid && (
          <CheckBox
            className="after:!bg-transparent after:!border-2 after:!rounded-[10px] -top-0.5 -left-0.5 after:!h-6 after:!w-6 after:!border-superfluid checked:after:bg-superfluid checked:after:border-none transition-all"
            isOn={superfluidDurationSelected && electSuperfluid}
            onToggle={() => setElectSuperfluid(!electSuperfluid)}
            checkMarkIconUrl="/icons/check-mark-dark.svg"
            checkMarkClassName="left-0 h-6 w-6"
            disabled={!superfluidDurationSelected || hasSuperfluidValidator}
          >
            <div
              className={classNames("flex flex-col gap-1", {
                "opacity-30":
                  !superfluidDurationSelected || hasSuperfluidValidator,
              })}
            >
              <h6 className="md:font-subtitle1 md:text-subtitle1">
                {t("lockToken.superfluidStake")}{" "}
                {superfluidApr && `(+${superfluidApr.maxDecimals(0)} APR)`}
              </h6>
              {poolDetailConfig?.longestDuration && (
                <span className="caption text-osmoverse-300">
                  {t("lockToken.bondingRequirement", {
                    numDays: poolDetailConfig.longestDuration
                      .asDays()
                      .toString(),
                  })}
                </span>
              )}
            </div>
          </CheckBox>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex items-center place-content-between">
            <span className="subtitle1">{t("lockToken.amountToBond")}</span>
            {availableToken && (
              <div className="flex gap-1 caption">
                <span>{t("lockToken.availableToken")}</span>
                <span
                  className="text-wosmongton-300 cursor-pointer"
                  onClick={() => config.setIsMax(true)}
                >
                  {t("pool.sharesAmount", {
                    shares: availableToken
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
            currentValue={config.amount}
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
      "rounded-xl w-full md:px-3 px-5 md:py-3.5 py-5 cursor-pointer transition-colors",
      isSelected
        ? "bg-osmoverse-700 -m-px !border-[3px] border-osmoverse-200"
        : "border border-osmoverse-600 hover:border-2 hover:border-osmoverse-200 hover:-m-px"
    )}
  >
    <div className="flex w-full place-content-between flex-col text-center">
      <h5>{duration}</h5>
      {apr && (
        <p className="subtitle1 md:m-0 mt-1 text-wosmongton-200">{apr}</p>
      )}
    </div>
  </button>
);
