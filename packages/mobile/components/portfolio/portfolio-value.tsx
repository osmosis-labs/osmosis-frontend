import { calculatePortfolioPerformance } from "@osmosis-labs/server";
import { timeToLocal } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useState } from "react";
import { View } from "react-native";

import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useWallets } from "~/hooks/use-wallets";
import { getChangeColor } from "~/utils/price";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

export const PortfolioValue = ({
  allocation,
  isLoadingAllocation,
}: {
  allocation:
    | RouterOutputs["local"]["portfolio"]["getPortfolioAssets"]
    | undefined;
  isLoadingAllocation: boolean;
}) => {
  const { currentWallet } = useWallets();
  const [range] =
    useState<
      RouterInputs["local"]["portfolio"]["getPortfolioOverTime"]["range"]
    >("1d");
  const [dataPoint, setDataPoint] = useState<{
    time: number;
    value: number | undefined;
  }>({
    time: dayjs().unix(),
    value: undefined,
  });

  const {
    data: portfolioOverTimeData,
    isFetched: isPortfolioOverTimeDataIsFetched,
  } = api.local.portfolio.getPortfolioOverTime.useQuery(
    {
      address: currentWallet?.address ?? "",
      range,
    },
    {
      enabled: Boolean(currentWallet?.address),
      onSuccess: (data) => {
        if (data && data.length > 0) {
          const lastDataPoint = data[data.length - 1];
          setDataPoint({
            time: timeToLocal(lastDataPoint.time),
            value: lastDataPoint.value,
          });
        }
      },
    }
  );

  const { selectedPercentageRatePretty } = calculatePortfolioPerformance(
    portfolioOverTimeData,
    dataPoint
  );

  return (
    <View
      style={{
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Skeleton
        style={isLoadingAllocation ? { width: 100, height: 48 } : undefined}
        isLoaded={!isLoadingAllocation}
      >
        <Text type="title">{allocation?.totalCap?.toString()}</Text>
      </Skeleton>
      <Skeleton
        style={
          !isPortfolioOverTimeDataIsFetched
            ? { width: 60, height: 24 }
            : undefined
        }
        isLoaded={isPortfolioOverTimeDataIsFetched}
      >
        <Text
          type="subtitle"
          style={{
            color: getChangeColor(selectedPercentageRatePretty.toDec()),
          }}
        >
          {selectedPercentageRatePretty
            .maxDecimals(1)
            .inequalitySymbol(false)
            .toString()}
        </Text>
      </Skeleton>
    </View>
  );
};
