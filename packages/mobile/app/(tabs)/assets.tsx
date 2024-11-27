import { Dec } from "@keplr-wallet/unit";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { debounce } from "debounce";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

import { ChevronDownIcon } from "~/components/icons/chevron-down";
import { FilterIcon } from "~/components/icons/filter";
import { SearchInput } from "~/components/search-input";
import { SubscriptDecimal } from "~/components/subscript-decimal";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/colors";
import { getChangeColor } from "~/utils/price";
import { api, RouterOutputs } from "~/utils/trpc";

const itemSize = 70;

export default function TabTwoScreen() {
  const [search, setSearch] = useState("");
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
  } = api.local.assets.getMarketAssets.useInfiniteQuery(
    {
      limit: 50,
      ...(search ? { search: { query: search } } : {}),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      keepPreviousData: true,
    }
  );
  const bottomTabBarHeight = useBottomTabBarHeight();

  const onSearch = debounce((query: string) => {
    setSearch(query);
  }, 200);

  const items = data?.pages.flatMap((page) => page.items) || [];

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeAreaView, { paddingBottom: bottomTabBarHeight }]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Assets</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            gap: 8,
          }}
        >
          <SearchInput
            onSearch={onSearch}
            activeColor={Colors["osmoverse"][500]}
          />

          <TouchableOpacity style={styles.filterButton}>
            <FilterIcon />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.subheaderContainer}>
          <Text style={styles.subheader}>All Assets</Text>
          <TouchableOpacity style={styles.volumeButton}>
            <Text style={styles.volumeText}>Volume</Text>
            <ChevronDownIcon />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <FlashList
            data={items}
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
        {isFetchingNextPage && <ActivityIndicator />}
      </View>
    </SafeAreaView>
  );
}

const AssetItem = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getMarketAssets"]["items"][number];
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/asset/[id]",
          params: {
            id: asset.coinMinimalDenom.replace(/\//g, "-"),
            coinDenom: asset.coinDenom,
            coinImageUrl: asset.coinImageUrl,
          },
        })
      }
      style={styles.assetItem}
    >
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 16,
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
  assetValue: {
    color: "#6B7280",
    fontSize: 14,
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
    paddingHorizontal: 24,
    paddingTop: 32,
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
  },
});
