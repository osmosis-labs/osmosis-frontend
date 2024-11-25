import { Dec } from "@keplr-wallet/unit";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { FlashList } from "@shopify/flash-list";
import { debounce } from "debounce";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

import { SubscriptDecimal } from "~/components/subscript-decimal";
import { Colors } from "~/constants/colors";
import { api, RouterOutputs } from "~/utils/trpc";

export default function TabTwoScreen() {
  const [search, setSearch] = useState("");
  const { data } = api.local.assets.getMarketAssets.useQuery({
    ...(search ? { search: { query: search } } : {}),
  });
  const bottomTabBarHeight = useBottomTabBarHeight();

  const onSearch = debounce((query: string) => {
    setSearch(query);
  }, 200);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        paddingBottom: bottomTabBarHeight,
        flex: 1,
        paddingHorizontal: 24,
      }}
    >
      <Text style={styles.header}>Assets</Text>

      <View style={styles.searchContainer}>
        {/* <Search size={20} color="#6B7280" style={styles.searchIcon} /> */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search chain..."
          placeholderTextColor="#6B7280"
          onChangeText={onSearch}
        />
      </View>

      <View style={styles.subheaderContainer}>
        <Text style={styles.subheader}>All Assets</Text>
        <TouchableOpacity style={styles.volumeButton}>
          <Text style={styles.volumeText}>Volume</Text>
          {/* <ChevronDown size={20} color="#fff" /> */}
        </TouchableOpacity>
      </View>

      <FlashList
        data={data?.items || []}
        renderItem={({ item }) => <AssetItem asset={item} />}
        keyExtractor={(item) => item.coinMinimalDenom}
        estimatedItemSize={70}
      />
    </SafeAreaView>
  );
}

const AssetItem = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getMarketAssets"]["items"][number];
}) => {
  return (
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
          {/* <Text style={styles.assetValue}>{asset.amount}</Text> */}
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
            asset.priceChange24h && asset.priceChange24h.toDec().gt(new Dec(0))
              ? { color: Colors["bullish"][500] }
              : asset.priceChange24h &&
                asset.priceChange24h.toDec().equals(new Dec(0))
              ? { color: Colors["wosmongton"][200] }
              : { color: Colors["rust"][300] },
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
    color: "#fff",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
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
    color: "#fff",
    fontWeight: "600",
  },
  volumeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  volumeText: {
    color: "#fff",
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
    color: "#fff",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  percentage: {
    color: "#10B981",
    fontSize: 14,
  },
});
