import { Dec } from "@osmosis-labs/unit";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { debounce } from "debounce";
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
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ChevronDownIcon } from "~/components/icons/chevron-down";
import { SearchInput } from "~/components/search-input";
import { SubscriptDecimal } from "~/components/subscript-decimal";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown";
import { SvgUri } from "~/components/ui/svg-uri";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { mmkvStorage } from "~/utils/mmkv";
import { getChangeColor } from "~/utils/price";
import { api, RouterOutputs } from "~/utils/trpc";

const itemSize = 70;

const displayOptions = [
  { key: "price-1h", title: "Price (1h)" },
  { key: "price-24h", title: "Price (24h)" },
  { key: "price-7d", title: "Price (7d)" },
  { key: "volume", title: "Volume" },
  { key: "market-cap", title: "Market Cap" },
] as const;

type DisplayOptionStore = {
  displayOption: (typeof displayOptions)[number]["key"];
  setDisplayOption: (option: (typeof displayOptions)[number]["key"]) => void;
};

const useDisplayOptionStore = create<DisplayOptionStore>()(
  persist(
    (set) => ({
      displayOption: displayOptions[1].key,
      setDisplayOption: (option: (typeof displayOptions)[number]["key"]) =>
        set({ displayOption: option }),
    }),
    {
      name: "display-option",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export default function TabTwoScreen() {
  const [search, setSearch] = useState("");
  const { displayOption, setDisplayOption } = useDisplayOptionStore();
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

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  );
  const selectedDisplayOption = useMemo(() => {
    return displayOptions.find((item) => item.key === displayOption);
  }, [displayOption]);

  const handleEndReached = () => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  };

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

          {/* <TouchableOpacity style={styles.filterButton}>
            <FilterIcon />
          </TouchableOpacity> */}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.subheaderContainer}>
          <Text style={styles.subheader}>All Assets</Text>

          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              <TouchableOpacity style={styles.volumeButton}>
                <Text style={styles.volumeText}>
                  {selectedDisplayOption?.title}
                </Text>
                <ChevronDownIcon />
              </TouchableOpacity>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {displayOptions.map((item) => (
                <DropdownMenuCheckboxItem
                  value={displayOption === item.key ? "on" : "off"}
                  key={item.key}
                  onValueChange={() => {
                    setDisplayOption(item.key);
                  }}
                >
                  <DropdownMenuItemTitle>{item.title}</DropdownMenuItemTitle>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </View>

        {isLoading ? (
          <View style={{ paddingHorizontal: 24 }}>
            <ActivityIndicator />
          </View>
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
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const AssetItem = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getMarketAssets"]["items"][number];
}) => {
  const { displayOption } = useDisplayOptionStore();

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
          {displayOption.startsWith("price") && (
            <>
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
              {displayOption === "price-24h" && (
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
              )}

              {displayOption === "price-7d" && (
                <Text
                  style={[
                    styles.percentage,
                    {
                      color: getChangeColor(
                        asset.priceChange7d?.toDec() || new Dec(0)
                      ),
                    },
                  ]}
                >
                  {asset.priceChange7d?.toString()}
                </Text>
              )}

              {displayOption === "price-1h" && (
                <Text
                  style={[
                    styles.percentage,
                    {
                      color: getChangeColor(
                        asset.priceChange1h?.toDec() || new Dec(0)
                      ),
                    },
                  ]}
                >
                  {asset.priceChange1h?.toString()}
                </Text>
              )}
            </>
          )}

          {displayOption === "volume" && (
            <Text style={styles.price}>
              {asset.volume24h?.toString() ?? "-"}
            </Text>
          )}

          {displayOption === "market-cap" && (
            <Text style={styles.price}>
              {asset.marketCap?.toString() ?? "-"}
            </Text>
          )}
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
    height: 45.3,
    width: 42,
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
    paddingVertical: 8,
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
    paddingTop: 12,
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
