import { BottomSheetView } from "@gorhom/bottom-sheet";
import { MinimalAsset } from "@osmosis-labs/types";
import { FlashList } from "@shopify/flash-list";
import { debounce } from "debounce";
import React, { memo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { ScrollView as ScrollViewGestureHandler } from "react-native-gesture-handler";

import { SearchInput } from "~/components/search-input";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { UseSwapAssetsReturn } from "~/hooks/use-swap";

import { TradeBottomSheetAssetItem } from "./trade-bottom-sheet-asset-item";

interface TradeBottomSheetContentProps {
  onSelectAsset: (
    asset: UseSwapAssetsReturn["selectableAssets"][number]
  ) => void;
  selectableAssets: UseSwapAssetsReturn["selectableAssets"];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoadingSelectAssets: boolean;
  recommendedAssets: MinimalAsset[] | undefined;
}

export const TradeBottomSheetContent = memo(
  ({
    onSelectAsset,
    selectableAssets,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoadingSelectAssets,
    recommendedAssets,
  }: TradeBottomSheetContentProps) => {
    const [queryInput, setQueryInput] = useState("");

    const onSearch = debounce((query: string) => {
      setQueryInput(query);
    }, 200);

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
            <FlashList
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
              renderScrollComponent={ScrollViewGestureHandler}
            />
            {isFetchingNextPage && <ActivityIndicator />}
          </>
        )}
      </BottomSheetView>
    );
  }
);

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
