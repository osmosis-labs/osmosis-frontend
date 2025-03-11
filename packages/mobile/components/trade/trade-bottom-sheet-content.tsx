import { BottomSheetView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import React, { memo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { ScrollView as ScrollViewGestureHandler } from "react-native-gesture-handler";
import { useShallow } from "zustand/react/shallow";

import { SearchInput } from "~/components/search-input";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import {
  useSwapAssets,
  UseSwapAssetsReturn,
} from "~/hooks/swap/use-swap-assets";
import { useSwapStore } from "~/stores/swap";

import { TradeBottomSheetAssetItem } from "./trade-bottom-sheet-asset-item";

interface TradeBottomSheetContentProps {
  onSelectAsset: (
    asset: UseSwapAssetsReturn["selectableAssets"][number]
  ) => void;
}

export const TradeBottomSheetContent = memo(
  ({ onSelectAsset }: TradeBottomSheetContentProps) => {
    const { initialFromDenom, initialToDenom } = useSwapStore(
      useShallow((state) => ({
        initialFromDenom: state.initialFromDenom,
        initialToDenom: state.initialToDenom,
      }))
    );
    const {
      selectableAssets,
      recommendedAssets,
      isLoadingSelectAssets,
      fetchNextPageAssets: fetchNextPage,
      hasNextPageAssets: hasNextPage,
      isFetchingNextPageAssets: isFetchingNextPage,
    } = useSwapAssets({
      initialFromDenom: initialFromDenom,
      initialToDenom: initialToDenom,
    });
    const [assetSearchInput, setAssetSearchInput] = useSwapStore(
      useShallow((state) => [state.assetSearchInput, state.setAssetSearchInput])
    );

    return (
      <BottomSheetView style={styles.bottomSheetView}>
        <View style={styles.searchInputContainer}>
          <SearchInput
            onSearch={setAssetSearchInput}
            activeColor={Colors["osmoverse"][500]}
            initialValue={assetSearchInput}
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
              No results {assetSearchInput && `for "${assetSearchInput}"`}
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
