import { calculatePortfolioPerformance } from "@osmosis-labs/server";
import { Dec } from "@osmosis-labs/unit";
import { timeToLocal } from "@osmosis-labs/utils";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

import { ProfileWoz } from "~/components/icons/profile-woz";
import { SubscriptDecimal } from "~/components/subscript-decimal";
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
  const bottomTabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView
      edges={["top"]}
      style={[{ flex: 1 }, { paddingBottom: bottomTabBarHeight }]}
    >
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

      <View style={{ marginBottom: 16 }}>
        <PortfolioValue
          allocation={allocation}
          isLoadingAllocation={isLoadingAllocation}
        />
      </View>
      <PortfolioAssetBalancesTable />
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

const itemSize = 70;

const PortfolioAssetBalancesTable = () => {
  const { address } = useCosmosWallet();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: assetPagesData,
    hasNextPage,
    isLoading,
    isFetching,
    isPreviousData,
    isRefetching,
    refetch,
    isFetchingNextPage,
    fetchNextPage,
  } = api.local.assets.getUserBridgeAssets.useInfiniteQuery(
    {
      userOsmoAddress: address!,
      limit: 50,
      ...(searchQuery && { search: { query: searchQuery } }),
      // onlyVerified: !searchQuery && showUnverifiedAssets === false,
    },
    {
      enabled: Boolean(address),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      keepPreviousData: true,

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const assetsData = useMemo(
    () => assetPagesData?.pages.flatMap((page) => page?.items) ?? [],
    [assetPagesData]
  );

  const noSearchResults = Boolean(searchQuery) && !assetsData.length;

  return (
    <View style={styles.contentContainer}>
      {isLoading ? (
        <View style={{ paddingHorizontal: 24 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlashList
          data={assetsData}
          renderItem={({ item }) => <AssetItem asset={item} />}
          keyExtractor={(item) => item.coinMinimalDenom}
          estimatedItemSize={itemSize}
          refreshing={isRefetching}
          onRefresh={() => {
            refetch();
          }}
          onEndReached={fetchNextPage}
        />
      )}
      {isFetchingNextPage && (
        <View style={{ paddingHorizontal: 24 }}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
};

const AssetItem = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getUserBridgeAssets"]["items"][number];
}) => {
  return (
    <Link
      href={{
        pathname: "/asset/[coinMinimalDenom]",
        params: {
          coinMinimalDenom: asset.coinMinimalDenom,
          coinDenom: asset.coinDenom,
          coinImageUrl: asset.coinImageUrl,
        },
      }}
      asChild
      push
    >
      <TouchableOpacity style={styles.assetItem}>
        <View style={styles.assetLeft}>
          {asset.coinImageUrl?.endsWith(".svg") ? (
            <SvgUri
              uri={asset.coinImageUrl}
              width={40}
              height={40}
              style={styles.assetIcon}
            />
          ) : (
            <Image
              source={{ uri: asset.coinImageUrl }}
              style={styles.assetIcon}
            />
          )}
          <View>
            <Text style={styles.assetName}>{asset.coinDenom}</Text>
          </View>
        </View>
        <View style={styles.assetRight}>
          <Text style={styles.price}>
            {asset.currentPrice ? (
              <>
                {asset.currentPrice.symbol}
                <SubscriptDecimal decimal={asset.currentPrice.toDec()} />
              </>
            ) : (
              ""
            )}
          </Text>
          <Text
            style={[
              styles.percentage,
              {
                color: getChangeColor(
                  asset.priceChange24h?.toDec() || new Dec(0)
                ),
              },
            ]}
          >
            {asset.priceChange24h?.toString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors["osmoverse"][825],
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 4,
    flex: 1,
  },
  filterButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors["osmoverse"][825],
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
  },
  subheaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  subheader: {
    fontSize: 16,
    fontWeight: "600",
  },
  volumeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  volumeText: {
    color: Colors["osmoverse"][200],
    marginRight: 4,
  },
  assetList: {
    flex: 1,
  },
  assetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "500",
  },
  assetRight: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "500",
  },
  percentage: {
    fontSize: 14,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  skeletonText: {
    flex: 1,
    height: itemSize,
    backgroundColor: Colors["osmoverse"][800],
    borderRadius: 10,
  },
  safeAreaView: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
  },
  contentContainer: {
    backgroundColor: Colors.osmoverse[900],
    flex: 1,
    paddingTop: 32,
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
  },
});
