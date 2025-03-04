import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { formatFiatPrice } from "@osmosis-labs/utils";
import { formatPretty } from "@osmosis-labs/utils";
import React, { forwardRef, useCallback } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";

import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { HistorySwapTransaction } from "~/hooks/use-transaction-history";

interface TransactionDetailsBottomSheetProps {
  transaction: HistorySwapTransaction | null;
}

export const TransactionDetailsBottomSheet = forwardRef<
  BottomSheetModal,
  TransactionDetailsBottomSheetProps
>(({ transaction }, ref) => {
  const snapPoints = ["70%"];

  if (!transaction) {
    return null;
  }

  const status = transaction.code === 0 ? "success" : "failed";

  // Extract token information
  const tokenIn = transaction?.metadata?.[0]?.value?.[0]?.txInfo?.tokenIn;
  const tokenOut = transaction?.metadata?.[0]?.value?.[0]?.txInfo?.tokenOut;

  if (!tokenIn || !tokenOut) {
    return null;
  }

  // Format date
  const date = new Date(transaction.blockTimestamp);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleViewInExplorer = () => {
    // Replace with your actual explorer URL
    const explorerUrl = `https://www.mintscan.io/osmosis/tx/${transaction.hash}`;
    Linking.openURL(explorerUrl);
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
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
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>↔️</Text>
            </View>
            <Text style={styles.title}>
              {status === "success" ? "Swapped" : "Swap Failed"}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Details</Text>

            <View style={styles.tokenContainer}>
              <View style={styles.tokenInfo}>
                <AssetImage
                  uri={tokenIn.token?.currency.coinImageUrl || ""}
                  style={styles.tokenImage}
                />
                <View>
                  <Text style={styles.tokenAmount}>
                    {tokenIn.token &&
                      formatPretty(tokenIn.token, { maxDecimals: 6 })}
                  </Text>
                  <Text style={styles.tokenValue}>
                    {tokenIn.usd && formatFiatPrice(tokenIn.usd)}
                  </Text>
                </View>
              </View>

              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>

              <View style={styles.tokenInfo}>
                <AssetImage
                  uri={tokenOut.token?.currency.coinImageUrl || ""}
                  style={styles.tokenImage}
                />
                <View>
                  <Text style={styles.tokenAmount}>
                    {tokenOut.token &&
                      formatPretty(tokenOut.token, { maxDecimals: 6 })}
                  </Text>
                  <Text style={styles.tokenValue}>
                    {tokenOut.usd && formatFiatPrice(tokenOut.usd)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Hash</Text>
            <Text style={styles.hash} numberOfLines={1} ellipsizeMode="middle">
              {transaction.hash}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="View in Explorer"
              onPress={handleViewInExplorer}
              variant="secondary"
              buttonStyle={styles.button}
            />
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  bottomSheetBackground: {
    backgroundColor: Colors.osmoverse[900],
  },
  indicator: {
    backgroundColor: Colors.osmoverse[400],
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.osmoverse[800],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white.full,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white.full,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.osmoverse[300],
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.osmoverse[300],
    marginBottom: 12,
  },
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.osmoverse[800],
    borderRadius: 12,
    padding: 16,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tokenImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: Colors.osmoverse[700],
  },
  tokenAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white.full,
  },
  tokenValue: {
    fontSize: 14,
    color: Colors.osmoverse[300],
  },
  arrowContainer: {
    paddingHorizontal: 12,
  },
  arrow: {
    color: Colors.osmoverse[400],
    fontSize: 20,
  },
  hash: {
    fontSize: 14,
    color: Colors.wosmongton[500],
    backgroundColor: Colors.osmoverse[800],
    borderRadius: 12,
    padding: 12,
  },
  buttonContainer: {
    marginTop: 12,
  },
  button: {
    marginBottom: 12,
  },
});
