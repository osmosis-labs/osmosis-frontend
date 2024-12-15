import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { PlusIcon } from "~/components/icons/plus-icon";
import { TradeBottomSheetContent } from "~/components/trade/trade-bottom-sheet-content";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

type TradeCardProps = {
  title: string;
  subtitle: string;
};

export const TradeCard = ({ title, subtitle }: TradeCardProps) => {
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
        <TradeBottomSheetContent />
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  tradeCard: {
    backgroundColor: Colors["osmoverse"][825],
    borderRadius: 12,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  addButton: {
    backgroundColor: "#2c2d43",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tradeCardTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "300",
  },
  tradeCardSubtitle: {
    color: Colors["osmoverse"][400],
    fontSize: 16,
    fontWeight: "300",
  },
});
