import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { shorten } from "@osmosis-labs/utils";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { CopyIcon } from "~/components/icons/copy";
import { ProfileWoz } from "~/components/icons/profile-woz";
import { SettingsIcon } from "~/components/icons/settings";
import { ManageWalletBottomSheet } from "~/components/portfolio/manage-wallet-bottom-sheet";
import { PortfolioAssetBalancesTable } from "~/components/portfolio/portfolio-asset-balances-table";
import { PortfolioValue } from "~/components/portfolio/portfolio-value";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useClipboard } from "~/hooks/use-clipboard";
import { useWallets } from "~/hooks/use-wallets";
import { api } from "~/utils/trpc";

export default function PortfolioScreen() {
  const { currentWallet } = useWallets();
  const router = useRouter();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { onCopy } = useClipboard(currentWallet?.address ?? "");

  const handleCopyPress = async () => {
    await onCopy();
    toast.success("Address copied");
  };

  const handleAvatarPress = () => {
    // TODO: Support multiple wallets
    return;
    bottomSheetModalRef.current?.present();
  };

  const { data: allocation, isLoading: isLoadingAllocation } =
    api.local.portfolio.getPortfolioAssets.useQuery(
      {
        address: currentWallet?.address ?? "",
      },
      {
        enabled: Boolean(currentWallet?.address),
      }
    );
  const bottomTabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { paddingBottom: bottomTabBarHeight }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleAvatarPress}
          style={styles.avatarButton}
          activeOpacity={1}
        >
          <ProfileWoz style={{ flexShrink: 0 }} width={48} height={48} />
        </TouchableOpacity>

        <View>
          <Text type="title">{currentWallet?.name}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addressButton}
            onPress={handleCopyPress}
          >
            <Text type="caption" style={{ color: Colors.osmoverse[400] }}>
              {shorten(currentWallet?.address ?? "")}
            </Text>
            <CopyIcon />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity
            onPress={() => {
              router.push("/settings");
            }}
            style={styles.settingsButton}
          >
            <SettingsIcon width={30} height={30} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.portfolioValueContainer}>
        <PortfolioValue
          allocation={allocation}
          isLoadingAllocation={isLoadingAllocation}
        />
      </View>
      <PortfolioAssetBalancesTable />

      <ManageWalletBottomSheet ref={bottomSheetModalRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarButton: {
    alignSelf: "flex-start",
    backgroundColor: Colors["osmoverse"][700],
    borderRadius: 8,
    overflow: "hidden",
  },
  addressButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingsContainer: {
    marginLeft: "auto",
  },
  settingsButton: {
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  portfolioValueContainer: {
    marginBottom: 16,
  },
});
