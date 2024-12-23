// components/wallet-bottom-sheet.tsx
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

export const WalletBottomSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const wallets = [
    {
      id: "1",
      name: "Wallet 1",
      address: "0x27ed...Dcdb",
      balance: "$0.00",
      isActive: true,
    },
    {
      id: "2",
      name: "Wallet 2",
      address: "0x607C...4285",
      balance: "$0.00",
      isActive: false,
    },
  ];

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
          {wallets.map((wallet) => (
            <WalletListItem
              key={wallet.id}
              name={wallet.name}
              address={wallet.address}
              balance={wallet.balance}
            />
          ))}
          <AddWalletButton />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

interface WalletListItemProps {
  name: string;
  address: string;
  balance: string;
  onPress?: () => void;
}

const WalletListItem = ({
  name,
  address,
  balance,
  onPress,
}: WalletListItemProps) => {
  return (
    <Pressable onPress={onPress} style={styles.walletItem}>
      <View style={styles.walletInfo}>
        <Text style={styles.walletName}>{name}</Text>
        <Text style={styles.address}>{address}</Text>
      </View>
      <Text style={styles.balance}>{balance}</Text>
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
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: Colors.osmoverse[300],
    marginBottom: 8,
  },
  // WalletListItem styles
  walletItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.osmoverse[800],
    borderRadius: 12,
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
