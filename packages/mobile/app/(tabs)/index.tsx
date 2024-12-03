import { calculatePortfolioPerformance } from "@osmosis-labs/server";
import { timeToLocal } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileWoz } from "~/components/icons/profile-woz";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useCosmosWallet } from "~/hooks/use-cosmos-wallet";
import { getChangeColor } from "~/utils/price";
import { api, RouterInputs, RouterOutputs } from "~/utils/trpc";

export default function HomeScreen() {
  const { address } = useCosmosWallet();

  const {
    data: allocation,
    isLoading: isLoadingAllocation,
    isFetched: isFetchedAllocation,
  } = api.local.portfolio.getPortfolioAssets.useQuery(
    {
      address: address ?? "",
    },
    {
      enabled: Boolean(address),
    }
  );

  return (
    <SafeAreaView>
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: Colors["osmoverse"][700],
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <ProfileWoz style={{ flexShrink: 0 }} width={48} height={48} />
        </View>

        <Text type="title">Portfolio</Text>
      </View>

      <PortfolioValue
        allocation={allocation}
        isLoadingAllocation={isLoadingAllocation}
      />
    </SafeAreaView>
  );
}

const PortfolioValue = ({
  allocation,
  isLoadingAllocation,
}: {
  allocation:
    | RouterOutputs["local"]["portfolio"]["getPortfolioAssets"]
    | undefined;
  isLoadingAllocation: boolean;
}) => {
  const { address } = useCosmosWallet();
  const [range, setRange] =
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
    error,
  } = api.local.portfolio.getPortfolioOverTime.useQuery(
    {
      address: address!,
      range,
    },
    {
      enabled: Boolean(address),
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
            ? { width: 100, height: 48 }
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
