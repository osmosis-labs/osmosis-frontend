import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Dec } from "@osmosis-labs/unit";
import { formatFiatPrice } from "@osmosis-labs/utils";
import { formatPretty } from "@osmosis-labs/utils";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";

import { CheckIcon } from "~/components/icons/check";
import { CopyIcon } from "~/components/icons/copy";
import { SwapIcon } from "~/components/icons/swap";
import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useClipboard } from "~/hooks/use-clipboard";
import { HistorySwapTransaction } from "~/hooks/use-transaction-history";

interface TransactionDetailsBottomSheetProps {
  transaction: HistorySwapTransaction | null;
}

interface TransactionDetailsContentProps {
  transaction: HistorySwapTransaction;
}

const TransactionDetailsContent: React.FC<TransactionDetailsContentProps> = ({
  transaction,
}) => {
  const { onCopy: copyHash, hasCopied: hashCopied } = useClipboard(
    transaction?.hash || ""
  );

  const status = transaction.code === 0 ? "success" : "failed";

  const tokenIn = transaction.metadata[0].value[0].txInfo.tokenIn;
  const tokenOut = transaction.metadata[0].value[0].txInfo.tokenOut;
  const txFee = transaction.metadata[0].value[0].txFee[0];

  // Format date
  const date = new Date(transaction.blockTimestamp);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format transaction hash for display (truncated)
  const displayHash = transaction.hash
    ? `${transaction.hash.substring(0, 4)}...${transaction.hash.substring(
        transaction.hash.length - 5
      )}`
    : "";

  // Conversion state management
  const [conversion, setConversion] = useState({
    numerator: tokenIn.token,
    denominator: tokenOut.token,
  });

  // Reset conversion when transaction changes
  useEffect(() => {
    setConversion({
      numerator: tokenIn.token,
      denominator: tokenOut.token,
    });
  }, [tokenIn.token, tokenOut.token, transaction.hash]);

  // Toggle conversion direction
  const toggleConversion = () => {
    setConversion({
      numerator: conversion.denominator,
      denominator: conversion.numerator,
    });
  };

  // Calculate conversion rate
  const conversionRate = useMemo(() => {
    if (!conversion.numerator || !conversion.denominator) return "0.00";

    return formatPretty(
      conversion.numerator.toDec().quo(conversion.denominator.toDec()),
      { maxDecimals: 2 }
    );
  }, [conversion.numerator, conversion.denominator]);

  // Format conversion text
  const conversionText = `1 ${
    conversion.denominator?.currency.coinDenom || ""
  } = ${conversionRate} ${conversion.numerator?.currency.coinDenom || ""}`;

  const { onCopy: copyExecutionPrice, hasCopied: executionPriceCopied } =
    useClipboard(conversionText);

  const handleViewInExplorer = () => {
    const explorerUrl = `https://www.mintscan.io/osmosis/tx/${transaction.hash}`;
    Linking.openURL(explorerUrl);
  };

  const handleCopyHash = () => {
    if (transaction.hash) {
      copyHash();
    }
  };

  const handleCopyExecutionPrice = () => {
    copyExecutionPrice();
  };

  return (
    <BottomSheetView style={styles.contentContainer}>
      <View style={styles.swapIconContainer}>
        <SwapIcon width={24} height={24} style={styles.swapIcon} />
      </View>
      <Text style={styles.title}>
        {status === "success" ? "Swapped" : "Swap Failed"}
      </Text>
      <Text style={styles.date}>{formattedDate}</Text>

      <View style={styles.swapContainer}>
        {/* Sold Token */}
        <View style={styles.tokenRow}>
          <View style={styles.tokenInfo}>
            <AssetImage
              uri={tokenIn.token?.currency.coinImageUrl || ""}
              style={styles.tokenImage}
            />
            <View>
              <Text style={styles.tokenAction}>Sold</Text>
              <Text style={styles.tokenSymbol}>
                {tokenIn.token?.currency.coinDenom || ""}
              </Text>
            </View>
          </View>
          <View style={styles.tokenValueContainer}>
            <Text style={styles.tokenAmount}>
              {tokenIn.token &&
                formatPretty(tokenIn.token, { maxDecimals: 10 })}
            </Text>
            <Text style={styles.fiatValue}>
              {tokenIn.usd
                ? `${
                    tokenIn.usd.toDec().lt(new Dec("0.01"))
                      ? "<$0.01"
                      : formatFiatPrice(tokenIn.usd, 2)
                  }`
                : ""}
            </Text>
          </View>
        </View>

        {/* Down Arrow */}
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>↓</Text>
        </View>

        {/* Bought Token */}
        <View style={styles.tokenRow}>
          <View style={styles.tokenInfo}>
            <AssetImage
              uri={tokenOut.token?.currency.coinImageUrl || ""}
              style={styles.tokenImage}
            />
            <View>
              <Text style={styles.tokenAction}>Bought</Text>
              <Text style={styles.tokenSymbol}>
                {tokenOut.token?.currency.coinDenom || ""}
              </Text>
            </View>
          </View>
          <View style={styles.tokenValueContainer}>
            <Text style={styles.tokenAmount}>
              {tokenOut.token &&
                formatPretty(tokenOut.token, { maxDecimals: 10 })}
            </Text>
            <Text style={styles.fiatValue}>
              {tokenOut.usd
                ? `${
                    tokenOut.usd.toDec().lt(new Dec("0.01"))
                      ? "<$0.01"
                      : formatFiatPrice(tokenOut.usd, 2)
                  }`
                : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        {/* Execution Price */}
        <View style={styles.detailRow}>
          <TouchableOpacity
            style={styles.detailLabelContainer}
            onPress={toggleConversion}
          >
            <Text style={styles.detailLabel}>Execution Price</Text>
            <Text style={styles.swapIconText}>↔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyExecutionPrice}
          >
            <Text style={styles.detailCopyValue}>{conversionText}</Text>
            {executionPriceCopied ? (
              <CheckIcon
                width={16}
                height={16}
                stroke={Colors.wosmongton[300]}
              />
            ) : (
              <CopyIcon
                width={16}
                height={16}
                stroke={Colors.wosmongton[300]}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Total Fees */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Fees</Text>
          <Text style={styles.detailValue}>
            {formatPretty(txFee.token, {
              maxDecimals: 2,
            })?.toString()}
          </Text>
        </View>

        {/* Transaction Hash */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction Hash</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyHash}>
            <Text style={styles.detailCopyValue}>{displayHash}</Text>
            {hashCopied ? (
              <CheckIcon
                width={16}
                height={16}
                stroke={Colors.wosmongton[300]}
              />
            ) : (
              <CopyIcon
                width={16}
                height={16}
                stroke={Colors.wosmongton[300]}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="View in Explorer"
          onPress={handleViewInExplorer}
          variant="secondary"
          buttonStyle={styles.button}
        />
      </View>
    </BottomSheetView>
  );
};

export const TransactionDetailsBottomSheet = forwardRef<
  BottomSheetModal,
  TransactionDetailsBottomSheetProps
>(({ transaction }, ref) => {
  return (
    <BottomSheetModal
      ref={ref}
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
      {transaction && <TransactionDetailsContent transaction={transaction} />}
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bottomSheetBackground: {
    backgroundColor: Colors.osmoverse[900],
  },
  indicator: {
    backgroundColor: Colors.osmoverse[400],
    width: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  closeIconPlaceholder: {
    width: 24,
    height: 24,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 24,
    color: Colors.white.full,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white.full,
    textAlign: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: Colors.osmoverse[300],
    textAlign: "center",
    marginBottom: 24,
  },
  swapContainer: {
    marginBottom: 24,
  },
  tokenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  tokenAction: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.white.full,
  },
  tokenSymbol: {
    fontSize: 14,
    color: Colors.osmoverse[300],
  },
  tokenValueContainer: {
    alignItems: "flex-end",
  },
  tokenAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.white.full,
  },
  fiatValue: {
    fontSize: 12,
    color: Colors.osmoverse[300],
  },
  arrowContainer: {
    paddingVertical: 4,
    paddingLeft: 9,
  },
  arrow: {
    fontSize: 16,
    color: Colors.osmoverse[200],
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.white.full,
  },
  swapIconText: {
    fontSize: 14,
    color: Colors.osmoverse[300],
    marginLeft: 8,
  },
  swapIconContainer: {
    alignSelf: "center",
    padding: 12,
    marginVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.osmoverse[800],
    borderRadius: 500,
  },
  swapIcon: {},
  detailValue: {
    fontSize: 14,
    color: Colors.text,
  },
  detailCopyValue: {
    fontSize: 14,
    color: Colors.wosmongton[300],
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buttonContainer: {
    marginTop: 12,
  },
  button: {
    marginBottom: 12,
  },
});
