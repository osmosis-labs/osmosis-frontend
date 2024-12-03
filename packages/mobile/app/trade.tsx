import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlashList,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { debounce } from "debounce";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ArrowDownIcon } from "~/components/icons/arrow-down";
import { ArrowLeftIcon } from "~/components/icons/arrow-left";
import { PlusIcon } from "~/components/icons/plus-icon";
import { RouteHeader } from "~/components/route-header";
import { SearchInput } from "~/components/search-input";
import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { api, RouterOutputs } from "~/utils/trpc";

type Props = {};

const TradeScreen = (props: Props) => {
  const { toToken } = useLocalSearchParams<{
    toToken: string;
  }>();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <RouteHeader headerStyle={{ marginHorizontal: 24 }}>
        <Text
          type="subtitle"
          style={{
            fontSize: 20,
            fontWeight: "600",
          }}
        >
          Trade
        </Text>
      </RouteHeader>

      <TradeInterface />

      <View style={styles.previewButtonContainer}>
        <Button
          title="Preview Trade"
          onPress={() => {}}
          buttonStyle={styles.previewButton}
        />
      </View>
    </SafeAreaView>
  );
};

const PREVIEW_BUTTON_HEIGHT = 100;

export function TradeInterface() {
  const [amount, setAmount] = useState("0");
  const [error, setError] = useState("");

  const handleNumberClick = (num: string) => {
    if (amount === "0" && num !== ".") {
      setAmount(num);
    } else {
      setAmount((prev) => {
        if (num === "." && prev.includes(".")) return prev;
        return prev + num;
      });
    }
  };

  const handleDelete = () => {
    setAmount((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const inset = useSafeAreaInsets();

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingBottom: PREVIEW_BUTTON_HEIGHT - inset.bottom },
      ]}
    >
      {/* Amount Display */}
      <View>
        <Text type="title" style={styles.amountDisplay}>
          ${amount}
        </Text>
      </View>

      {/* Trade Cards */}
      <View style={styles.tradeCardsContainer}>
        <TradeCard title="Pay" subtitle="Choose Asset" />

        <View style={styles.swapButtonContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.swapButton}>
            <ArrowDownIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        <TradeCard title="Receive" subtitle="Choose Asset" />
      </View>

      {/* Error Message */}
      <Text style={styles.errorMessage}>{error}</Text>

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num, i) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberClick(num.toString())}
          >
            <Text style={styles.numberButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.numberButton, { paddingTop: 8 }]}
          onPress={handleDelete}
        >
          <ArrowLeftIcon width={32} height={32} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const TradeCard = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  const selectAssetBottomSheetRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <TouchableOpacity
        style={styles.tradeCard}
        activeOpacity={0.8}
        onPress={() => {
          selectAssetBottomSheetRef.current?.present();
        }}
      >
        <View style={styles.addButton}>
          <PlusIcon width={24} height={24} />
        </View>
        <View>
          <Text style={styles.tradeCardTitle}>{title}</Text>
          <Text style={styles.tradeCardSubtitle}>{subtitle}</Text>
        </View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={selectAssetBottomSheetRef}
        enablePanDownToClose
        index={0}
        snapPoints={["60%", "93%"]}
        enableDynamicSizing={false}
        backdropComponent={useCallback(
          (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
            />
          ),
          []
        )}
        handleIndicatorStyle={{
          backgroundColor: Colors["osmoverse"][400],
        }}
        backgroundStyle={{
          backgroundColor: Colors["osmoverse"][900],
        }}
      >
        <BottomSheetContent />
      </BottomSheetModal>
    </>
  );
};

const BottomSheetContent = () => {
  const [queryInput, setQueryInput] = useState("");

  const {
    data: selectableAssetPages,
    isLoading: isLoadingSelectAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.local.assets.getUserAssets.useInfiniteQuery(
    {
      ...(queryInput ? { search: { query: queryInput } } : {}),
      // userOsmoAddress: account?.address,
      limit: 50,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,

      // avoid blocking
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const onSearch = debounce((query: string) => {
    setQueryInput(query);
  }, 200);

  const { data: recommendedAssets } =
    api.local.assets.getSwapRecommendedAssets.useQuery();

  const selectableAssets = useMemo(
    () => selectableAssetPages?.pages.flatMap(({ items }) => items) ?? [],
    [selectableAssetPages?.pages]
  );

  return (
    <BottomSheetView style={styles.bottomSheetView}>
      <View style={styles.searchInputContainer}>
        <SearchInput
          onSearch={onSearch}
          activeColor={Colors["osmoverse"][500]}
        />
      </View>
      <View>
        {recommendedAssets && (
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={styles.recommendedAssetsScrollView}
            contentContainerStyle={styles.recommendedAssetsContentContainer}
          >
            {recommendedAssets.map((asset) => (
              <BottomSheetAssetItem
                asset={asset}
                type="recommended"
                key={asset.coinMinimalDenom}
              />
            ))}
          </ScrollView>
        )}
      </View>
      {isLoadingSelectAssets ? (
        <ActivityIndicator />
      ) : selectableAssets.length === 0 ? (
        <View style={styles.centeredView}>
          <Text type="subtitle">
            No results {queryInput && `for "${queryInput}"`}
          </Text>
          <Text style={styles.adjustSearchText}>
            Try adjusting your search query
          </Text>
        </View>
      ) : (
        <>
          <BottomSheetFlashList
            data={selectableAssets}
            keyExtractor={(asset) => asset.coinMinimalDenom}
            estimatedItemSize={40}
            onEndReached={() => hasNextPage && fetchNextPage()}
            renderItem={({ item: asset }) => (
              <BottomSheetAssetItem
                asset={asset}
                key={asset.coinMinimalDenom}
              />
            )}
          />
          {isFetchingNextPage && <ActivityIndicator />}
        </>
      )}
    </BottomSheetView>
  );
};

const BottomSheetAssetItem = ({
  asset,
  type,
}: {
  asset: RouterOutputs["local"]["assets"]["getUserAssets"]["items"][0];
  type?: "recommended" | "selectable";
}) => {
  if (type === "recommended") {
    return (
      <TouchableOpacity style={styles.recommendedAssetItem}>
        <View style={styles.recommendedAssetLeft} key={asset.coinMinimalDenom}>
          {asset.coinImageUrl && (
            <AssetImage
              uri={asset.coinImageUrl}
              style={styles.recommendedAssetImage}
            />
          )}
          <View>
            <Text style={styles.assetName}>{asset.coinDenom}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity>
      <View style={styles.assetLeft} key={asset.coinMinimalDenom}>
        {asset.coinImageUrl && <AssetImage uri={asset.coinImageUrl} />}
        <View>
          <Text style={styles.assetName}>{asset.coinName}</Text>
          <Text type="caption" style={styles.assetDenom}>
            {asset.coinDenom}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  amountDisplay: {
    fontWeight: "600",
    alignSelf: "center",
    marginBottom: 32,
  },
  tradeCardsContainer: {
    marginBottom: 16,
    gap: 4,
  },
  tradeCard: {
    backgroundColor: Colors["osmoverse"][825],
    borderRadius: 12,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tradeCardTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 300,
  },
  tradeCardSubtitle: {
    color: Colors["osmoverse"][400],
    fontSize: 16,
    fontWeight: 300,
  },
  addButton: {
    backgroundColor: "#2c2d43",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
  },
  swapButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    transform: [{ translateY: "-50%" }],
  },
  swapButton: {
    backgroundColor: Colors["wosmongton"][700],
    width: 42,
    height: 42,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors["osmoverse"][1000],
    borderWidth: 4,
  },
  errorMessage: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  numberButton: {
    width: "30%",
    aspectRatio: 1.3,
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    color: "white",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 500,
  },
  previewButtonContainer: {
    position: "absolute",
    height: PREVIEW_BUTTON_HEIGHT,
    bottom: 0,
    width: "100%",
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: "center",
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  previewButton: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    width: "80%",
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
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
  bottomSheetView: {
    flex: 1,
    gap: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
  },
  recommendedAssetsScrollView: {
    flexDirection: "row",
    paddingHorizontal: 12,
  },
  recommendedAssetsContentContainer: {
    gap: 5,
  },
  recommendedAssetItem: {
    borderColor: Colors["osmoverse"][700],
    borderWidth: 1,
    borderRadius: 255,
  },
  recommendedAssetLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    paddingRight: 8,
  },
  recommendedAssetImage: {
    width: 24,
    height: 24,
  },
  assetDenom: {
    color: Colors["osmoverse"][400],
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  adjustSearchText: {
    color: Colors["osmoverse"][300],
    fontWeight: "500",
  },
});

export default TradeScreen;
