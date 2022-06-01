import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Duration } from "dayjs/plugin/duration";
import classNames from "classnames";
import { RatePretty, CoinPretty } from "@keplr-wallet/unit";
import { AmountConfig } from "@keplr-wallet/hooks";
import { InputBox } from "../components/input";
import { Error } from "../components/alert";
import { CheckBox } from "../components/control";
import { ModalBase, ModalBaseProps } from "./base";
import { MobileProps } from "../components/types";
import { useConnectWalletModalRedirect } from "../hooks";

export const LockTokensModal: FunctionComponent<
  ModalBaseProps & {
    gauges: {
      id: string;
      duration: Duration;
      apr: RatePretty;
      superfluidApr?: RatePretty;
    }[];
    amountConfig: AmountConfig;
    availableToken?: CoinPretty;
    /** `electSuperfluid` is left undefined if it is irrelevant- if the user has already opted into superfluid in the past. */
    onLockToken: (gaugeId: string, electSuperfluid?: boolean) => void;
    /* Used to label the main button as "Next" to choose validator or "Bond" to reuse chosen sfs validator.
       If `true`, "Superfluid Stake" checkbox will not be shown since user has already opted in. */
    hasSuperfluidValidator?: boolean;
    isSendingMsg?: boolean;
  } & MobileProps
> = observer((props) => {
  const {
    gauges,
    amountConfig: config,
    availableToken,
    onLockToken,
    hasSuperfluidValidator,
    isSendingMsg,
    isMobile = false,
  } = props;

  const isSuperfluid = gauges.some(
    (gauge) => gauge.superfluidApr !== undefined
  );
  const [selectedGaugeIndex, setSelectedGaugeIndex] = useState<number | null>(
    null
  );
  const highestGaugeSelected = selectedGaugeIndex === gauges.length - 1;
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
        const gauge = gauges.find((_, index) => index === selectedGaugeIndex);
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

  return (
    <ModalBase {...props} isOpen={props.isOpen && showModalBase}>
      <div className="flex flex-col gap-8 pt-8">
        <div className="flex flex-col gap-2.5">
          <span className="subitle1">Unbonding period</span>
          <div className="flex md:flex-col gap-4">
            {gauges.map(({ id, duration, apr, superfluidApr }, index) => (
              <LockupItem
                key={id}
                duration={duration.humanize()}
                isSelected={index === selectedGaugeIndex}
                onSelect={() => setSelectedGaugeIndex(index)}
                apr={apr.maxDecimals(2).trim(true).toString()}
                superfluidApr={superfluidApr
                  ?.maxDecimals(0)
                  .trim(true)
                  .toString()}
                isMobile={isMobile}
              />
            ))}
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
    apr: string;
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
      "rounded-2xl px-0.25 py-0.25 w-full cursor-pointer",
      superfluidApr
        ? "bg-superfluid"
        : isSelected
        ? "bg-enabledGold bg-opacity-30"
        : "bg-white-faint hover:opacity-75"
    )}
  >
    <div
      className={classNames(
        "flex items-center rounded-2xlinset bg-surface h-full px-5 md:py-3.5 py-5 px-4",
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
      <div className="flex w-full place-content-between items-center items-left flex-col md:flex-row items-baseline">
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
        <div className="flex items-center md:text-right text-center md:mx-0 mx-auto gap-2">
          <p className="subtitle2 md:m-0 mt-1 text-secondary-200 md:text-sm text-base">
            {`${apr}${superfluidApr ? `+ ${superfluidApr}` : ""}`}
          </p>
        </div>
      </div>
    </div>
  </button>
);
