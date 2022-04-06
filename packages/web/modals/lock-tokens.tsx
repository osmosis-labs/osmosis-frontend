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
import { ModalBase, ModalBaseProps } from "./base";

export const LockTokensModal: FunctionComponent<
  ModalBaseProps & {
    gauges: {
      id: string;
      duration: Duration;
      apr: RatePretty;
      isSuperfluid?: boolean;
    }[];
    amountConfig: ObservableAmountConfig;
    availableToken?: CoinPretty;
    onLockToken: (gaugeId: string) => void;
  }
> = observer((props) => {
  const { gauges, amountConfig: config, availableToken, onLockToken } = props;
  const [selectedGaugeIndex, setSelectedGaugeIndex] = useState<number | null>(
    null
  );

  return (
    <ModalBase {...props}>
      <div className="flex flex-col gap-8 pt-8">
        <div className="flex flex-col gap-2.5">
          <span className="subitle1">Unbonding period</span>
          <div className="flex gap-4">
            {gauges.map(({ id, duration, apr, isSuperfluid }, index) => (
              <LockupItem
                key={id}
                duration={duration.humanize()}
                isSelected={index === selectedGaugeIndex}
                onSelect={() => setSelectedGaugeIndex(index)}
                apr={apr.maxDecimals(2).toString()}
                isSuperfluidEnabled={isSuperfluid}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border border-white-faint rounded-2xl p-4">
          <span className="subtitle1">Amount To Bond</span>
          {availableToken && (
            <div className="flex gap-1 caption">
              <span>Available LP Token</span>
              <span className="text-primary-50">
                {availableToken.toString()}
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
          disabled={config.error !== undefined}
          onClick={() => {
            const gauge = gauges.find(
              (_, index) => index === selectedGaugeIndex
            );
            if (gauge) {
              onLockToken(gauge.id);
            }
          }}
        >
          Bond
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
  isSuperfluidEnabled?: boolean;
}> = ({ duration, isSelected, onSelect, apr, isSuperfluidEnabled = false }) => {
  return (
    <div
      onClick={onSelect}
      className={classNames(
        {
          "shadow-elevation-08dp": isSelected,
        },
        "rounded-2xl px-0.25 py-0.25 w-full cursor-pointer border border-white-faint",
        isSuperfluidEnabled
          ? "bg-sfs"
          : isSelected
          ? "bg-enabledGold bg-opacity-30"
          : "bg-white-faint hover:opacity-75"
      )}
    >
      <div
        className={classNames(
          "flex items-center rounded-2xl bg-surface h-full px-5 py-3.5 md:py-5 md:px-4",
          {
            "bg-sfs-20": isSuperfluidEnabled && isSelected,
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
          </div>
          <div className="w-full flex text-center place-content-center gap-2">
            <p className="md:mt-1 text-secondary-200 text-sm md:text-base">
              {apr}
            </p>
            {isSuperfluidEnabled && (
              <Image
                alt=""
                src={"/icons/superfluid-osmo.svg"}
                height={20}
                width={20}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
