import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { AmountConfig } from "@keplr-wallet/hooks";
import { useStore } from "../stores";
import { InputBox } from "../components/input";
import { Error } from "../components/alert";
import { CheckBox } from "../components/control";
import { ModalBase, ModalBaseProps } from "./base";
import { MobileProps } from "../components/types";
import {
  useConnectWalletModalRedirect,
  usePoolGauges,
  usePoolDetailStore,
  useSuperfluidPoolStore,
  useWindowSize,
} from "../hooks";

export const LockTokensModal: FunctionComponent<
  {
    poolId: string;
    amountConfig: AmountConfig;
    /** `electSuperfluid` is left undefined if it is irrelevant- if the user has already opted into superfluid in the past. */
    onLockToken: (gaugeId: string, electSuperfluid?: boolean) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId, amountConfig: config, onLockToken } = props;

  const { chainStore, accountStore, queriesStore } = useStore();
  const { isMobile } = useWindowSize();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainId);
  const { bech32Address } = account;

  const { allAggregatedGauges } = usePoolGauges(poolId);

  // initialize pool data stores once root pool store is loaded
  const { poolDetailStore } = usePoolDetailStore(poolId);
  const { superfluidPoolStore } = useSuperfluidPoolStore(poolDetailStore);

  const availableToken = queryOsmosis.queryGammPoolShare.getAvailableGammShare(
    bech32Address,
    poolId
  );
  const isSendingMsg = account.txTypeInProgress !== "";
  const hasSuperfluidValidator =
    superfluidPoolStore?.superfluid?.delegations &&
    superfluidPoolStore.superfluid.delegations.length > 0;

  const isSuperfluid = allAggregatedGauges.some(
    (gauge) => gauge.superfluidApr !== undefined
  );
  const [selectedGaugeIndex, setSelectedGaugeIndex] = useState<number | null>(
    null
  );

  const highestGaugeSelected =
    selectedGaugeIndex === allAggregatedGauges.length - 1;
  const [electSuperfluid, setElectSuperfluid] = useState(true);

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      className: "h-14 md:w-full w-96 mt-3 mx-auto",
      size: "lg",
      disabled:
        config.error !== undefined ||
        selectedGaugeIndex === null ||
        isSendingMsg,
      loading: isSendingMsg,
      onClick: () => {
        const gauge = allAggregatedGauges.find(
          (_, index) => index === selectedGaugeIndex
        );
        if (gauge) {
          onLockToken(
            gauge.id,
            // Allow superfluid only for the highest gauge index.
            // On the mainnet, this standard works well
            // Logically it could be a problem if it's not the mainnet
            hasSuperfluidValidator || !isSuperfluid || !highestGaugeSelected
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
    if (allAggregatedGauges.length === 1) setSelectedGaugeIndex(0);
  }, [allAggregatedGauges]);

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
            {allAggregatedGauges.length > 3 && !isMobile
              ? ` (${allAggregatedGauges.length})`
              : null}
          </span>
          <div className="flex md:flex-col gap-4 overflow-x-auto">
            {allAggregatedGauges.map(
              ({ id, duration, apr, superfluidApr }, index) => (
                <LockupItem
                  key={id}
                  duration={duration.humanize()}
                  isSelected={index === selectedGaugeIndex}
                  onSelect={() => setSelectedGaugeIndex(index)}
                  apr={apr?.maxDecimals(2).trim(true).toString()}
                  superfluidApr={superfluidApr
                    ?.maxDecimals(0)
                    .trim(true)
                    .toString()}
                  isMobile={isMobile}
                />
              )
            )}
          </div>
        </div>
        {!hasSuperfluidValidator && highestGaugeSelected && isSuperfluid && (
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
              <span className="text-primary-50">
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
                className: "!my-auto !h-6 !bg-primary-200 !caption",
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

const LockupItem: FunctionComponent<
  {
    duration: string;
    isSelected: boolean;
    onSelect: () => void;
    apr?: string;
    superfluidApr?: string;
  } & MobileProps
> = ({
  duration,
  isSelected,
  onSelect,
  apr,
  superfluidApr,
  isMobile = false,
}) => (
  <button
    onClick={onSelect}
    className={classNames(
      {
        "shadow-elevation-08dp": isSelected,
      },
      "rounded-2xl px-0.25 py-0.25 w-full cursor-pointer min-w-[190px]",
      superfluidApr
        ? "bg-superfluid"
        : isSelected
        ? "bg-enabledGold bg-opacity-30"
        : "bg-white-faint hover:opacity-75"
    )}
  >
    <div
      className={classNames(
        "flex items-center rounded-2xlinset bg-surface h-full px-5 md:py-3.5 py-5 md:px-4",
        {
          "bg-superfluid-20": superfluidApr && isSelected,
        }
      )}
    >
      <figure
        className={classNames(
          "rounded-full w-4 h-4 mr-2 flex-shrink-0",
          isSelected
            ? "border-secondary-200 border-4 bg-white-high"
            : "border-iconDefault border"
        )}
      />
      <div className="flex w-full place-content-between items-center items-left flex-col md:flex-row md:items-baseline">
        <div className="flex gap-1.5 items-center md:mx-1 mx-auto">
          {isMobile ? (
            <span className="subtitle1">{duration}</span>
          ) : (
            <h5>{duration}</h5>
          )}
          <div className="flex items-center w-[25px]">
            {superfluidApr && (
              <Image
                alt=""
                src={"/icons/superfluid-osmo.svg"}
                height={22}
                width={22}
              />
            )}
          </div>
        </div>
        {apr && (
          <div className="flex items-center md:text-right text-center md:mx-0 mx-auto gap-2">
            <p className="subtitle2 md:m-0 mt-1 text-secondary-200 md:text-sm text-base">
              {`${apr}${superfluidApr ? `+ ${superfluidApr}` : ""}`}
            </p>
          </div>
        )}
      </div>
    </div>
  </button>
);
