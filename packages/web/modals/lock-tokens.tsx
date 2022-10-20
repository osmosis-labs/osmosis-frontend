import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { AmountConfig } from "@keplr-wallet/hooks";
import { Duration } from "dayjs/plugin/duration";
import { useStore } from "../stores";
import { InputBox } from "../components/input";
import { Error } from "../components/alert";
import { CheckBox } from "../components/control";
import { ModalBase, ModalBaseProps } from "./base";
import {
  useConnectWalletModalRedirect,
  useBondLiquidityConfig,
  usePoolDetailConfig,
  useSuperfluidPoolConfig,
  useWindowSize,
} from "../hooks";
import { ExternalIncentiveGaugeAllowList } from "../config";

export const LockTokensModal: FunctionComponent<
  {
    poolId: string;
    amountConfig: AmountConfig;
    /** `electSuperfluid` is left undefined if it is irrelevant- if the user has already opted into superfluid in the past. */
    onLockToken: (duration: Duration, electSuperfluid?: boolean) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId, amountConfig: config, onLockToken } = props;

  const { chainStore, accountStore, queriesStore } = useStore();
  const { isMobile } = useWindowSize();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainId);
  const { bech32Address } = account;

  // initialize pool data stores once root pool store is loaded
  const { poolDetailConfig } = usePoolDetailConfig(poolId);
  const { superfluidPoolConfig } = useSuperfluidPoolConfig(poolDetailConfig);
  const bondLiquidityConfig = useBondLiquidityConfig(bech32Address, poolId);

  const bondableDurations =
    bondLiquidityConfig?.getBondableAllowedDurations(
      (denom) => chainStore.getChain(chainId).forceFindCurrency(denom),
      ExternalIncentiveGaugeAllowList[poolId]
    ) ?? [];
  const availableToken = queryOsmosis.queryGammPoolShare.getAvailableGammShare(
    bech32Address,
    poolId
  );
  const isSendingMsg = account.txTypeInProgress !== "";
  const hasSuperfluidValidator =
    superfluidPoolConfig?.superfluid?.delegations &&
    superfluidPoolConfig.superfluid.delegations.length > 0;

  // component state
  const [selectedGaugeIndex, setSelectedGaugeIndex] = useState<number | null>(
    null
  );
  const highestGaugeSelected =
    selectedGaugeIndex === bondableDurations.length - 1;
  const [electSuperfluid, setElectSuperfluid] = useState(true);

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      className: "h-14 md:w-full w-96 mt-3 mx-auto",
      disabled:
        config.error !== undefined ||
        selectedGaugeIndex === null ||
        isSendingMsg,
      onClick: () => {
        const bondableDuration = bondableDurations.find(
          (_, index) => index === selectedGaugeIndex
        );
        if (bondableDuration) {
          onLockToken(
            bondableDuration.duration,
            // Allow superfluid only for the highest gauge index.
            // On the mainnet, this standard works well
            // Logically it could be a problem if it's not the mainnet
            hasSuperfluidValidator ||
              !superfluidPoolConfig?.isSuperfluid ||
              !highestGaugeSelected
              ? undefined
              : electSuperfluid
          );
        }
      },
      children:
        electSuperfluid && !hasSuperfluidValidator && highestGaugeSelected
          ? "Next"
          : "Bond" || undefined,
    },
    props.onRequestClose
  );

  // auto select the gauge if there's one
  useEffect(() => {
    if (bondableDurations.length === 1) setSelectedGaugeIndex(0);
  }, [bondableDurations]);

  return (
    <ModalBase
      title={`Lock Shares in Pool #${poolId}`}
      {...props}
      isOpen={props.isOpen && showModalBase}
    >
      <div className="flex flex-col gap-8 pt-8">
        <div className="flex flex-col gap-2.5">
          <span className="subitle1">
            Unbonding period
            {bondableDurations.length > 3 && !isMobile
              ? ` (${bondableDurations.length})`
              : null}
          </span>
          <div className="flex md:flex-col gap-4 overflow-x-auto">
            {bondableDurations.map(({ duration, aggregateApr }, index) => (
              <LockupItem
                key={index}
                duration={duration.humanize()}
                isSelected={index === selectedGaugeIndex}
                onSelect={() => setSelectedGaugeIndex(index)}
                apr={aggregateApr?.maxDecimals(2).trim(true).toString()}
              />
            ))}
          </div>
        </div>
        {!hasSuperfluidValidator &&
          highestGaugeSelected &&
          superfluidPoolConfig?.isSuperfluid && (
            <div className="flex gap-2 ml-auto">
              <CheckBox
                className="mr-2 after:!bg-transparent after:!border-2 after:!border-white-full"
                isOn={electSuperfluid}
                onToggle={() => setElectSuperfluid(!electSuperfluid)}
              >
                Superfluid Stake
              </CheckBox>
              <Image
                alt=""
                src={"/icons/superfluid-osmo.svg"}
                height={22}
                width={22}
              />
            </div>
          )}
        <div className="flex flex-col gap-2 md:border-0 border border-white-faint md:rounded-0 rounded-2xl md:p-px p-4">
          <span className="subtitle1">Amount To Bond</span>
          {availableToken && (
            <div className="flex gap-1 caption">
              <span>Available LP Token</span>
              <span className="text-wosmongton-100">
                {availableToken.trim(true).toString()}
              </span>
            </div>
          )}
          <InputBox
            type="number"
            currentValue={config.amount}
            onInput={(value) => config.setAmount(value)}
            placeholder=""
            labelButtons={[
              {
                label: "MAX",
                onClick: () => config.toggleIsMax(),
                className: "!my-auto !h-6 !bg-wosmongton-200 !caption",
              },
            ]}
          />
        </div>
        {config.error?.message !== undefined && (
          <Error className="mx-auto" message={config.error?.message ?? ""} />
        )}
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
      "rounded-2xl px-0.25 py-0.25 w-full cursor-pointer min-w-[190px]",
      isSelected
        ? "bg-enabledGold bg-opacity-30"
        : "bg-white-faint hover:opacity-75"
    )}
  >
    <div
      className={classNames(
        "flex items-center rounded-2xlinset bg-surface h-full px-5 md:py-3.5 py-5 md:px-4"
      )}
    >
      <div className="flex w-full place-content-between flex-col text-center">
        <h5>{duration}</h5>
        {apr && (
          <div className="flex items-center md:text-right text-center md:mx-0 mx-auto gap-2">
            <p className="subtitle2 md:m-0 mt-1 text-secondary-200 md:text-sm text-base">
              {apr}
            </p>
          </div>
        )}
      </div>
    </div>
  </button>
);
