import Image from "next/image";
import { FunctionComponent, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import dayjs from "dayjs";
import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { useWindowSize } from "../../hooks";
import { CustomClasses, Breakpoint } from "../types";
import { useTranslation } from "react-multi-lang";

const REWARD_EPOCH_IDENTIFIER = "day";

export const PoolsOverview: FunctionComponent<{} & CustomClasses> = observer(
  ({ className }) => {
    const { chainStore, priceStore, queriesStore } = useStore();
    const { width } = useWindowSize();

    const { chainId } = chainStore.osmosis;
    const queryOsmosis = queriesStore.get(chainId).osmosis!;
    const t = useTranslation();

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
        const [
          epochRemainingHour,
          epochRemainingMinute,
          epochRemainingSeconds,
        ] = epochRemainingTimeString.split("-");
        setTimeRemaining(
          `${epochRemainingHour}:${epochRemainingMinute}:${epochRemainingSeconds}`
        );
      };
      const intervalId = setInterval(updateTimeRemaining, 1000);
      updateTimeRemaining();

      return () => clearInterval(intervalId);
    }, [queryOsmosis.queryEpochs.response]);

    return (
      <div
        className={classNames(
          "relative flex h-48 items-center gap-32 rounded-[32px] bg-osmoverse-800 px-20 lg:gap-8 lg:px-10 md:h-fit md:flex-col md:items-start md:gap-3 md:px-4 md:py-5",
          className
        )}
      >
        <div className="flex flex-col gap-5 md:gap-2">
          <h6 className="md:text-subtitle1 md:font-subtitle1">
            {t("pools.priceOsmo")}
          </h6>
          <h2 className="text-white-full md:text-h4 md:font-h4">
            {osmoPrice?.toString()}
          </h2>
        </div>
        <div className="z-40 flex flex-col gap-5 rounded-2xl bg-osmoverse-800/80 pr-2 shadow-2xl md:gap-2">
          <h6 className="md:text-subtitle1 md:font-subtitle1">
            {t("pools.rewardDistribution")}
          </h6>
          <h2 className="bg-superfluid bg-clip-text text-transparent md:text-h4 md:font-h4">
            {timeRemaining}
          </h2>
        </div>
        <div className="absolute right-0 -bottom-[0.025rem] h-[212px] overflow-clip rounded-br-[32px] 1.5xl:h-[200px] xl:h-[188px] md:h-[100px] xs:hidden">
          <Image
            alt="lab machine"
            src="/images/lab-machine.svg"
            height={
              width < Breakpoint.MD
                ? 100
                : width < Breakpoint.XLHALF
                ? width < Breakpoint.XL
                  ? 190
                  : 200
                : 212
            }
            width={
              width < Breakpoint.MD
                ? 180
                : width < Breakpoint.XLHALF
                ? width < Breakpoint.XL
                  ? 280
                  : 380
                : 425
            }
          />
        </div>
      </div>
    );
  }
);
