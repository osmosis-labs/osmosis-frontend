import { BottomSheetFlashList, BottomSheetView } from "@gorhom/bottom-sheet";
import { MinimalAsset } from "@osmosis-labs/types";
import { debounce } from "debounce";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { SearchInput } from "~/components/search-input";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { api } from "~/utils/trpc";

import { TradeBottomSheetAssetItem } from "./trade-bottom-sheet-asset-item";

interface TradeBottomSheetContentProps {
  onSelectAsset: (asset: MinimalAsset) => void;
  selectableAssets: MinimalAsset[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoadingSelectAssets: boolean;
}

export const TradeBottomSheetContent = ({
  onSelectAsset,
  selectableAssets,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoadingSelectAssets,
}: TradeBottomSheetContentProps) => {
  const [queryInput, setQueryInput] = useState("");

  const onSearch = debounce((query: string) => {
    setQueryInput(query);
  }, 200);

  const { data: recommendedAssets } =
    api.local.assets.getSwapRecommendedAssets.useQuery();

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
              <TradeBottomSheetAssetItem
                asset={asset}
                type="recommended"
                key={asset.coinMinimalDenom}
                onClick={() => onSelectAsset(asset)}
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
              <TradeBottomSheetAssetItem
                asset={asset}
                key={asset.coinMinimalDenom}
                onClick={() => onSelectAsset(asset)}
              />
            )}
          />
          {isFetchingNextPage && <ActivityIndicator />}
        </>
      )}
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
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
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  adjustSearchText: {
    color: Colors["osmoverse"][300],
    fontWeight: "500",
  },
});
