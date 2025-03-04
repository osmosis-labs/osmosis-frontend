import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { FunctionComponent, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { TransactionActivityItem } from "~/components/portfolio/transaction-activity-item";
import { TransactionDetailsBottomSheet } from "~/components/portfolio/transaction-details-bottom-sheet";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useTransactionHistory } from "~/hooks/use-transaction-history";
import { HistorySwapTransaction } from "~/hooks/use-transaction-history";

export const PortfolioActivity: FunctionComponent = () => {
  const { transactions, isLoading } = useTransactionHistory();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<HistorySwapTransaction | null>(null);

  // Filter out bridge transfers for now
  const swapTransactions = transactions.filter(
    (tx: any): tx is HistorySwapTransaction => tx.__type === "transaction"
  );

  const handleTransactionPress = (transaction: HistorySwapTransaction) => {
    setSelectedTransaction(transaction);
    bottomSheetRef.current?.present();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.wosmongton[500]} size="large" />
      </View>
    );
  }

  if (swapTransactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={swapTransactions}
        keyExtractor={(item) => item.hash}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTransactionPress(item)}>
            <TransactionActivityItem transaction={item} />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <TransactionDetailsBottomSheet
        ref={bottomSheetRef}
        transaction={selectedTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.osmoverse[300],
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
