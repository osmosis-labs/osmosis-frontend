import { formatPretty } from "@osmosis-labs/utils";
import React, { FunctionComponent } from "react";
import { StyleSheet, View } from "react-native";

import { AssetImage } from "~/components/ui/asset-image";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { HistorySwapTransaction } from "~/hooks/use-transaction-history";

interface TransactionActivityItemProps {
  transaction: HistorySwapTransaction;
}

export const TransactionActivityItem: FunctionComponent<
  TransactionActivityItemProps
> = ({ transaction }) => {
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
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.title}>
          {status === "success" ? "Swapped" : "Swap Failed"}
        </Text>
        <Text style={styles.subtitle}>
          {tokenIn.token && formatPretty(tokenIn.token, { maxDecimals: 6 })} →{" "}
          {tokenOut.token && formatPretty(tokenOut.token, { maxDecimals: 6 })}
        </Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <View style={styles.rightContent}>
        <View style={styles.tokenImages}>
          <AssetImage
            uri={tokenIn.token?.currency.coinImageUrl || ""}
            style={styles.tokenImage}
          />
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
          <AssetImage
            uri={tokenOut.token?.currency.coinImageUrl || ""}
            style={styles.tokenImage}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.osmoverse[800],
    marginBottom: 8,
    gap: 12,
  },
  leftContent: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white.full,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.osmoverse[300],
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: Colors.osmoverse[400],
  },
  rightContent: {
    alignItems: "flex-end",
  },
  tokenImages: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.osmoverse[700],
  },
  arrowContainer: {
    marginHorizontal: 4,
  },
  arrow: {
    color: Colors.osmoverse[400],
    fontSize: 14,
  },
});
