import Image from "next/image";
import { FunctionComponent, useState, useEffect } from "react";
import classNames from "classnames";
import dayjs from "dayjs";
import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { useWindowSize } from "../../hooks";
import { CustomClasses, Breakpoint } from "../types";

const REWARD_EPOCH_IDENTIFIER = "day";

export const PoolsOverview: FunctionComponent<{} & CustomClasses> = ({
  className,
}) => {
  const { chainStore, priceStore, queriesStore } = useStore();
  const { width } = useWindowSize();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;

  const osmoPrice = priceStore.calculatePrice(
    new CoinPretty(
      chainStore.osmosis.stakeCurrency,
      DecUtils.getTenExponentNInPrecisionRange(
        chainStore.osmosis.stakeCurrency.coinDecimals
      )
    )
  );

  // update time every second
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  useEffect(() => {
    const updateTimeRemaining = () => {
      const queryEpoch = queryOsmosis.queryEpochs.getEpoch(
        REWARD_EPOCH_IDENTIFIER
      );
      const now = new Date();
      const epochRemainingTime = dayjs.duration(
        dayjs(queryEpoch.endTime).diff(dayjs(now), "second"),
        "second"
      );
      const epochRemainingTimeString =
        epochRemainingTime.asSeconds() <= 0
          ? dayjs.duration(0, "seconds").format("HH-mm-ss")
          : epochRemainingTime.format("HH-mm-ss");
      const [epochRemainingHour, epochRemainingMinute, epochRemainingSeconds] =
        epochRemainingTimeString.split("-");
      setTimeRemaining(
        `${epochRemainingHour}:${epochRemainingMinute}:${epochRemainingSeconds}`
      );
    };
    const intervalId = setInterval(updateTimeRemaining, 1000);
    updateTimeRemaining();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className={classNames(
        "relative flex items-center gap-32 h-48 rounded-[32px] bg-osmoverse-800 px-20",
        className
      )}
    >
      <div className="flex flex-col gap-5">
        <h6>OSMO Price</h6>
        <h2 className="text-wosmongton-100">{osmoPrice?.toString()}</h2>
      </div>
      <div className="flex flex-col gap-5">
        <h6>Next payout in</h6>
        <h2 className="text-transparent bg-clip-text bg-superfluid">
          {timeRemaining}
        </h2>
      </div>
      {width > Breakpoint.XLG && (
        <div className="absolute h-[292px] 1.5xl:h-[200px] xl:h-[188px] right-0 -bottom-[0.025rem] overflow-clip rounded-br-[32px]">
          <Image
            alt="lab machine"
            src="/images/lab-machine.svg"
            height={
              width < Breakpoint.XLHALF
                ? width < Breakpoint.XL
                  ? 190
                  : 200
                : 292
            }
            width={
              width < Breakpoint.XLHALF
                ? width < Breakpoint.XL
                  ? 280
                  : 380
                : 480
            }
          />
        </div>
      )}
    </div>
  );
};
