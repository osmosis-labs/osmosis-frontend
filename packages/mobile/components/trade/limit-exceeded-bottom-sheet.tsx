import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/utils";
import React, { forwardRef, useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

interface LimitExceededBottomSheetProps {
  wouldSpendTotal?: Dec;
  limit?: Dec;
}

export const LimitExceededBottomSheet = forwardRef<
  BottomSheetModal,
  LimitExceededBottomSheetProps
>(({ wouldSpendTotal, limit }, ref) => {
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const formattedWouldSpend = wouldSpendTotal
    ? new PricePretty(DEFAULT_VS_CURRENCY, wouldSpendTotal).toString()
    : "Unknown amount";

  const formattedLimit = limit
    ? new PricePretty(DEFAULT_VS_CURRENCY, limit).toString()
    : "Unknown limit";

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: Colors["osmoverse"][400],
      }}
      backgroundStyle={{
        backgroundColor: Colors["osmoverse"][900],
      }}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.content}>
          <Text type="title" style={styles.title}>
            Loss Protection Limit Exceeded
          </Text>

          <Text style={styles.description}>
            You've reached your daily loss protection limit. This feature helps
            protect your assets by limiting the amount you can trade in a
            24-hour period.
          </Text>

          <View style={styles.limitInfoContainer}>
            <View style={styles.limitInfoRow}>
              <Text style={styles.limitInfoLabel}>Trade value with fees:</Text>
              <Text style={styles.limitInfoValue}>{formattedWouldSpend}</Text>
            </View>
            <View style={styles.limitInfoRow}>
              <Text style={styles.limitInfoLabel}>Your daily limit:</Text>
              <Text style={styles.limitInfoValue}>{formattedLimit}</Text>
            </View>
          </View>

          <Text style={styles.waitMessage}>
            Your limit will reset in 24 hours from when you first started
            trading today.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="I understand"
              variant="primary"
              onPress={() => {
                if (ref && "current" in ref && ref.current) {
                  ref.current.dismiss();
                }
              }}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 24,
    color: Colors.white.full,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.osmoverse[100],
    textAlign: "center",
    lineHeight: 22,
  },
  limitInfoContainer: {
    backgroundColor: Colors.osmoverse[800],
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  limitInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  limitInfoLabel: {
    fontSize: 16,
    color: Colors.osmoverse[300],
  },
  limitInfoValue: {
    fontSize: 16,
    color: Colors.white.full,
    fontWeight: "600",
  },
  waitMessage: {
    fontSize: 16,
    color: Colors.osmoverse[100],
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonContainer: {
    marginTop: 12,
  },
});
