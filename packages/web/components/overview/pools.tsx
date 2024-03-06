import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";

import { CustomClasses } from "~/components/types";
import { Button } from "~/components/ui/button";
import { Breakpoint, useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import SkeletonLoader from "../loaders/skeleton-loader";

const REWARD_EPOCH_IDENTIFIER = "day";

export const PoolsOverview: FunctionComponent<
  { setIsCreatingPool: () => void } & CustomClasses
> = observer(({ className, setIsCreatingPool }) => {
  const { chainStore, queriesStore } = useStore();
  const { width } = useWindowSize();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const { t } = useTranslation();

  const { data: osmoPrice, isFetched } = api.edge.assets.getAssetPrice.useQuery(
    {
      coinMinimalDenom: "uosmo",
    }
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
  }, [queryOsmosis.queryEpochs, queryOsmosis.queryEpochs.response]);

  return (
    <div
      className={classNames(
        "relative flex flex-wrap items-center gap-32 rounded-3xl bg-osmoverse-800 px-20 py-8 1.5lg:gap-6 lg:px-10 md:h-fit md:flex-col md:items-start md:gap-3 md:px-4 md:py-5",
        className
      )}
    >
      <div className="flex flex-col gap-5 md:gap-2">
        <h6 className="md:text-subtitle1 md:font-subtitle1">
          {t("pools.priceOsmo")}
        </h6>
        {osmoPrice && (
          <SkeletonLoader
            className={classNames(isFetched ? null : "h-5 w-13")}
            isLoaded={isFetched}
          >
            <h2 className="mt-[3px]">
              {osmoPrice.fiatCurrency.symbol}
              {Number(osmoPrice.toDec().toString()).toFixed(2)}
            </h2>
          </SkeletonLoader>
        )}
      </div>
      <div className="z-40 flex flex-col gap-5 rounded-2xl bg-osmoverse-800/80 pr-2 md:gap-2">
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
          className="h-full"
          height={
            width < Breakpoint.md
              ? 100
              : width < Breakpoint.xlhalf
              ? width < Breakpoint.xl
                ? 190
                : 200
              : 212
          }
          width={
            width < Breakpoint.md
              ? 180
              : width < Breakpoint.xlhalf
              ? width < Breakpoint.xl
                ? 280
                : 380
              : 425
          }
        />
      </div>
      <div className="absolute right-7 bottom-7 1.5lg:relative 1.5lg:bottom-0 1.5lg:right-0">
        <Button
          onClick={setIsCreatingPool}
          // TODO - ideally we shouldn't use overrides, reconsider this one off design
          className="!bg-osmoverse-700 hover:!bg-osmoverse-600"
        >
          <div className="flex items-center gap-3">
            {t("pools.createPool.title")}
            <Image
              alt="right arrow"
              src="/icons/arrow-right-wosmongton-100.svg"
              height={24}
              width={24}
            />
          </div>
        </Button>
      </div>
    </div>
  );
});
