import { BottomSheetView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import React, { memo, MutableRefObject } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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
import { RouterOutputs } from "~/utils/trpc";

import { TradeBottomSheetAssetItem } from "./trade-bottom-sheet-asset-item";

interface TradeBottomSheetContentProps {
  onSelectAsset: (
    asset: UseSwapAssetsReturn["selectableAssets"][number]
  ) => void;
  existingAssetsRef: MutableRefObject<
    RouterOutputs["local"]["assets"]["getUserAsset"][]
  >;
}

export const TradeBottomSheetContent = memo(
  ({ onSelectAsset, existingAssetsRef }: TradeBottomSheetContentProps) => {
    const [assetSearchInput, setAssetSearchInput] = useSwapStore(
      useShallow((state) => [state.assetSearchInput, state.setAssetSearchInput])
    );

    const {
      selectableAssets,
      recommendedAssets,
      isLoadingSelectAssets,
      fetchNextPageAssets: fetchNextPage,
      hasNextPageAssets: hasNextPage,
      isFetchingNextPageAssets: isFetchingNextPage,
    } = useSwapAssets({
      existingAssetsRef,
    });

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
            <ScrollViewGestureHandler
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
            </ScrollViewGestureHandler>
          )}
        </View>

        <FlashList
          data={selectableAssets}
          keyExtractor={(asset) => asset.coinMinimalDenom}
          estimatedItemSize={40}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          renderItem={({ item: asset }) => (
            <TradeBottomSheetAssetItem
              asset={asset}
              key={asset.coinMinimalDenom}
              onClick={() => onSelectAsset(asset)}
            />
          )}
          renderScrollComponent={ScrollViewGestureHandler}
          ListEmptyComponent={
            isLoadingSelectAssets ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.centeredView}>
                <Text type="subtitle">
                  No results {assetSearchInput && `for "${assetSearchInput}"`}
                </Text>
                <Text style={styles.adjustSearchText}>
                  Try adjusting your search query
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            isFetchingNextPage && !isLoadingSelectAssets ? (
              <ActivityIndicator />
            ) : null
          }
        />
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
