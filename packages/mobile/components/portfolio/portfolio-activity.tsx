import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import React, { FunctionComponent, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { TransactionActivityItem } from "~/components/portfolio/transaction-activity-item";
import { TransactionDetailsBottomSheet } from "~/components/portfolio/transaction-details-bottom-sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useTransactionHistory } from "~/hooks/use-transaction-history";
import { HistorySwapTransaction } from "~/hooks/use-transaction-history";

const ITEM_HEIGHT = 114;

export const PortfolioActivity: FunctionComponent = () => {
  const {
    transactions,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useTransactionHistory({
    limit: 20,
  });

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<HistorySwapTransaction | null>(null);

  // Filter out bridge transfers for now
  const swapTransactions = transactions.filter(
    (tx): tx is HistorySwapTransaction => tx.__type === "transaction"
  );

  const handleTransactionPress = (transaction: HistorySwapTransaction) => {
    setSelectedTransaction(transaction);
    bottomSheetRef.current?.present();
  };

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View style={styles.container}>
      <FlashList
        data={swapTransactions}
        keyExtractor={(item) => item.hash}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTransactionPress(item)}>
            <TransactionActivityItem transaction={item} />
          </TouchableOpacity>
        )}
        estimatedItemSize={ITEM_HEIGHT}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListFooterComponent={
          isFetchingNextPage && !isLoading ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              {new Array(5).fill(0).map((_, index) => (
                <Skeleton
                  key={index}
                  style={{
                    width: "100%",
                    height: ITEM_HEIGHT,
                    borderRadius: 10,
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          )
        }
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
    justifyContent: "flex-start",
    gap: 8,
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
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
