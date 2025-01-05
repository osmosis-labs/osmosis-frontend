// components/wallet-bottom-sheet.tsx
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useWallets } from "~/hooks/use-wallets";

export const ManageWalletBottomSheet = forwardRef<BottomSheetModal>(
  (_props, ref) => {
    const { wallets } = useWallets();

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
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.header}>
            <Text type="title" style={styles.title}>
              Manage wallet
            </Text>
          </View>

          <View style={styles.walletSection}>
            <Text style={styles.sectionTitle}>Your other wallets</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {wallets.map((wallet, index) => (
                <WalletListItem
                  key={index + wallet.name}
                  name={wallet.name}
                  address={wallet.address}
                />
              ))}
            </ScrollView>
            <AddWalletButton />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

interface WalletListItemProps {
  name: string;
  address: string;
  onPress?: () => void;
}

const WalletListItem = ({ name, address, onPress }: WalletListItemProps) => {
  return (
    <Pressable onPress={onPress} style={styles.walletItem}>
      <View style={styles.walletInfo}>
        <Text style={styles.walletName}>{name}</Text>
        <Text style={styles.address}>{address}</Text>
      </View>
    </Pressable>
  );
};

interface AddWalletButtonProps {
  onPress?: () => void;
}

const AddWalletButton = ({ onPress }: AddWalletButtonProps) => {
  return (
    <Pressable onPress={onPress} style={styles.addWalletButton}>
      <Text style={styles.addWalletText}>+ Add wallet</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: 42,
    paddingHorizontal: 24,
  },
  bottomSheetBackground: {
    backgroundColor: Colors.osmoverse[900],
  },
  indicator: {
    backgroundColor: Colors.osmoverse[400],
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    color: Colors.white.full,
    textAlign: "center",
  },
  walletSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    color: Colors.osmoverse[300],
    marginBottom: 8,
  },
  walletItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.osmoverse[800],
    borderRadius: 12,
    marginVertical: 4,
  },
  walletInfo: {
    gap: 4,
  },
  walletName: {
    fontSize: 18,
    color: Colors.white.full,
  },
  address: {
    fontSize: 14,
    color: Colors.osmoverse[300],
  },
  balance: {
    fontSize: 18,
    color: Colors.white.full,
  },
  addWalletButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.osmoverse[600],
    alignItems: "center",
  },
  addWalletText: {
    fontSize: 18,
    color: Colors.osmoverse[300],
  },
});
