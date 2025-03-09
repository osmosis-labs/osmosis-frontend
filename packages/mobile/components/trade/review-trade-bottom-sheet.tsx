import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { CoinPretty } from "@osmosis-labs/unit";
import { PricePretty } from "@osmosis-labs/unit";
import { formatPretty, formatSpendLimit } from "@osmosis-labs/utils";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { toast } from "sonner-native";

import { ArrowDownIcon } from "~/components/icons/arrow-down";
import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useRemainingSpendLimit } from "~/hooks/use-remaining-spend-limit";
import { SendTradeTokenInTx, UseSwapAssetsReturn } from "~/hooks/use-swap";
import { useWallets } from "~/hooks/use-wallets";

interface ReviewTradeBottomSheetProps {
  fromAsset: NonNullable<UseSwapAssetsReturn["fromAsset"]>;
  toAsset: NonNullable<UseSwapAssetsReturn["toAsset"]>;
  inAmount: CoinPretty;
  inAmountFiat: PricePretty;
  expectedOutput: CoinPretty;
  expectedOutputFiat: PricePretty;
  networkFee: PricePretty | undefined;
  sendTradeTokenInTx: SendTradeTokenInTx;
  onSuccess: () => void;
}

/**
 * A bottom sheet that allows the user to review the trade details before proceeding.
 * Example usage:
 * const sheetRef = useRef<BottomSheetModal>(null);
 * ...
 * <ReviewTradeBottomSheet ref={sheetRef} />
 */
export const ReviewTradeBottomSheet = React.forwardRef<
  BottomSheetModal,
  ReviewTradeBottomSheetProps
>(
  (
    {
      fromAsset,
      toAsset,
      inAmount,
      inAmountFiat,
      expectedOutput,
      expectedOutputFiat,
      networkFee,
      sendTradeTokenInTx,
      onSuccess,
    },
    ref
  ) => {
    const [isSendingTrade, setIsSendingTrade] = useState(false);
    const { currentWallet } = useWallets();

    const data = useRemainingSpendLimit({
      authenticatorId:
        currentWallet?.type === "smart-account"
          ? currentWallet.authenticatorId
          : "",
      walletAddress: currentWallet?.address ?? "",
      enabled: currentWallet?.type === "smart-account",
    });

    // Renders the custom backdrop
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      []
    );

    const onSendTrade = useCallback(async () => {
      setIsSendingTrade(true);
      try {
        await sendTradeTokenInTx();
        toast.success(
          `Swapped ${formatPretty(inAmount)} for ~${formatPretty(
            expectedOutput
          )}`
        );
        onSuccess();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to send trade: ${errorMessage}`);
      } finally {
        setIsSendingTrade(false);
      }
    }, [sendTradeTokenInTx, inAmount, expectedOutput, onSuccess]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        backdropComponent={renderBackdrop}
        enableDismissOnClose={!isSendingTrade}
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
              Review trade details
            </Text>

            <View style={styles.section}>
              <View style={styles.timelineContainer}>
                <View style={styles.swapRow}>
                  {fromAsset.coinImageUrl && (
                    <AssetImage
                      uri={fromAsset.coinImageUrl}
                      style={styles.assetIcon}
                    />
                  )}
                  <View>
                    <Text style={styles.swapText}>
                      {formatPretty(inAmount)}
                    </Text>
                    <Text style={styles.swapSubText}>
                      {inAmountFiat.toString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineSection}>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineCircleBg} />
                  <View style={styles.timelineCircle}>
                    <ArrowDownIcon />
                  </View>
                </View>

                <View style={styles.swapRow}>
                  {toAsset.coinImageUrl && (
                    <AssetImage
                      uri={toAsset.coinImageUrl}
                      style={styles.assetIcon}
                    />
                  )}
                  <View>
                    <Text style={styles.swapText}>
                      {formatPretty(expectedOutput.toDec(), {
                        minimumSignificantDigits: 6,
                        maximumSignificantDigits: 6,
                        maxDecimals: 10,
                        notation: "standard",
                      })}{" "}
                      {toAsset?.coinDenom}
                    </Text>
                    <Text style={styles.swapSubText}>
                      {expectedOutputFiat.toString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {currentWallet?.type === "smart-account" && (
              <View style={styles.detailRow}>
                <Text type="subtitle" style={styles.detailLabel}>
                  Loss protection limit
                </Text>
                <Text style={styles.value}>
                  {data.remainingSpendLimit
                    ? `${formatSpendLimit(
                        data.remainingSpendLimit
                      )} / ${formatSpendLimit(data.totalSpendLimit)}`
                    : "Unknown"}
                </Text>
              </View>
            )}

            {/* Section: exchange rate */}
            <View style={styles.detailRow}>
              <Text type="subtitle" style={styles.detailLabel}>
                Exchange Rate
              </Text>
              <View style={styles.detailValue}>
                <Text style={styles.value}>
                  1 {fromAsset.coinDenom} ≈{" "}
                  {formatPretty(expectedOutput.quo(inAmount).toDec(), {
                    minimumSignificantDigits: 6,
                    maximumSignificantDigits: 6,
                    maxDecimals: 8,
                    notation: "standard",
                  })}{" "}
                  {toAsset.coinDenom}
                </Text>
              </View>
            </View>

            {/* Section: fees */}
            <View style={styles.detailRow}>
              <Text type="subtitle" style={styles.detailLabel}>
                Additional Network Fee
              </Text>
              <Text style={styles.value}>
                {networkFee ? networkFee.toString() : "Unknown"}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Confirm"
              loading={isSendingTrade}
              onPress={onSendTrade}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Colors["osmoverse"][900],
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    paddingVertical: 24,
    marginTop: "auto",
  },

  title: {
    color: "#ffffff",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 36,
  },
  label: {
    color: Colors["osmoverse"][300],
    fontSize: 14,
    marginBottom: 2,
  },
  swapText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  swapSubText: {
    color: Colors["osmoverse"][300],
    fontSize: 14,
    fontWeight: "400",
  },
  spaceTop: {
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
    gap: 12,
  },
  value: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  assetIcon: {
    width: 32,
    height: 32,
  },
  timelineContainer: {
    position: "relative",
    gap: 12,
  },
  timelineSection: {
    alignItems: "center",
    height: 60,
    justifyContent: "center",
  },
  timelineLine: {
    position: "absolute",
    width: 1,
    height: "140%",
    backgroundColor: Colors["osmoverse"][600],
    left: 15, // Half of the asset icon width (32/2) - half of line width (2/2)
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors["wosmongton"][800],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    position: "absolute",
    left: 0,
  },
  timelineCircleBg: {
    width: 32,
    height: 45,
    borderRadius: 16,
    zIndex: 1,
    position: "absolute",
    left: 0,
    borderWidth: 12,
    borderColor: Colors["osmoverse"][900],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    color: Colors["osmoverse"][300],
    fontSize: 14,
  },
  detailValue: {
    flexDirection: "row",
    alignItems: "center",
  },
});
