import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Duration } from "dayjs/plugin/duration";
import classNames from "classnames";
import { RatePretty, CoinPretty } from "@keplr-wallet/unit";
import { ObservableAmountConfig } from "@osmosis-labs/stores";
import { Button } from "../components/buttons";
import { InputBox } from "../components/input";
import { Error } from "../components/alert";
import { CheckBox } from "../components/control";
import { ModalBase, ModalBaseProps } from "./base";

export const LockTokensModal: FunctionComponent<
  ModalBaseProps & {
    gauges: {
      id: string;
      duration: Duration;
      apr: RatePretty;
      superfluidApr?: RatePretty;
    }[];
    amountConfig: ObservableAmountConfig;
    availableToken?: CoinPretty;
    onLockToken: (gaugeId: string, electSuperfluid: boolean) => void;
    /* Used to label the main button as "Next" to choose validator or "Bond" to reuse chosen sfs validator. */
    hasSuperfluidValidator?: boolean;
  }
> = observer((props) => {
  const {
    gauges,
    amountConfig: config,
    availableToken,
    onLockToken,
    hasSuperfluidValidator,
  } = props;
  const [selectedGaugeIndex, setSelectedGaugeIndex] = useState<number | null>(
    null
  );
  const [electSuperfluid, setElectSuperfluid] = useState(true);

  return (
    <ModalBase {...props}>
      <div className="flex flex-col gap-8 pt-8">
        <div className="flex flex-col gap-2.5">
          <span className="subitle1">Unbonding period</span>
          <div className="flex gap-4">
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
              />
            ))}
          </div>
        </div>
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
        <div className="flex flex-col gap-2 border border-white-faint rounded-2xl p-4">
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
            currentValue={config.amount}
            onInput={(value) => config.setAmount(value)}
            placeholder=""
            labelButtons={[
              {
                label: "MAX",
                onClick: () => config.setFraction(1),
                className: "!my-auto !h-6 !bg-primary-200 !caption",
              },
            ]}
          />
        </div>
        {config.error?.message !== undefined && (
          <Error className="mx-auto" message={config.error?.message ?? ""} />
        )}
        <Button
          className="h-14 w-96 mt-3 mx-auto"
          size="lg"
          disabled={config.error !== undefined || selectedGaugeIndex === null}
          onClick={() => {
            const gauge = gauges.find(
              (_, index) => index === selectedGaugeIndex
            );
            if (gauge) {
              onLockToken(gauge.id, electSuperfluid);
            }
          }}
        >
          {electSuperfluid && !hasSuperfluidValidator ? "Next" : "Bond"}
        </Button>
      </div>
    </ModalBase>
  );
});

const LockupItem: FunctionComponent<{
  duration: string;
  isSelected: boolean;
  onSelect: () => void;
  apr: string;
  superfluidApr?: string;
}> = ({ duration, isSelected, onSelect, apr, superfluidApr }) => {
  return (
    <div
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
          "flex items-center rounded-2xl bg-surface h-full px-5 py-3.5 md:py-5 md:px-4",
          {
            "bg-superfluid-20": superfluidApr && isSelected,
          }
        )}
      >
        <figure
          className={classNames(
            "rounded-full w-4 h-4 mr-5 md:mr-4 flex-shrink-0",
            isSelected
              ? "border-secondary-200 border-4 bg-white-high"
              : "border-iconDefault border"
          )}
        />
        <div className="w-full flex justify-between md:flex-col md:items-baseline">
          <div className="flex gap-1.5 items-center mx-auto">
            <h5>{duration}</h5>
            {superfluidApr && (
              <Image
                alt=""
                src={"/icons/superfluid-osmo.svg"}
                height={22}
                width={22}
              />
            )}
          </div>
          <div className="w-full flex text-center place-content-center gap-2">
            <p className="md:mt-1 text-secondary-200 text-sm md:text-base">
              {`${apr}${superfluidApr ? `+ ${superfluidApr}` : ""}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
