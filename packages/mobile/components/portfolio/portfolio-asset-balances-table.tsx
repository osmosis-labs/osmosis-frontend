import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Dec } from "@osmosis-labs/unit";
import { formatPretty } from "@osmosis-labs/utils";
import { FlashList } from "@shopify/flash-list";
import { Link } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";

import { UnverifiedAssetModal } from "~/components/modals/unverified-asset-modal";
import { SubscriptDecimal } from "~/components/subscript-decimal";
import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useWallets } from "~/hooks/use-wallets";
import { useSettingsStore } from "~/stores/settings";
import { getChangeColor } from "~/utils/price";
import { api, RouterOutputs } from "~/utils/trpc";

const itemSize = 70;

export const PortfolioAssetBalancesTable = () => {
  const { currentWallet } = useWallets();
  const [searchQuery] = useState("");

  const {
    data: assetPagesData,
    isLoading,
    isRefetching,
    refetch,
    isFetchingNextPage,
    fetchNextPage,
  } = api.local.assets.getUserBridgeAssets.useInfiniteQuery(
    {
      userOsmoAddress: currentWallet?.address ?? "",
      limit: 50,
      ...(searchQuery && { search: { query: searchQuery } }),
      sort: {
        keyPath: "usdValue",
        direction: "desc",
      },
    },
    {
      enabled: Boolean(currentWallet?.address),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      keepPreviousData: true,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const assetsData = useMemo(
    () => assetPagesData?.pages.flatMap((page) => page?.items) ?? [],
    [assetPagesData]
  );

  if (!currentWallet?.address) {
    return null;
  }

  return (
    <View style={styles.contentContainer}>
      <FlashList
        data={assetsData}
        renderItem={({ item }) => <AssetItem asset={item} />}
        keyExtractor={(item) => item.coinMinimalDenom}
        estimatedItemSize={itemSize}
        refreshing={isRefetching}
        onRefresh={() => {
          refetch();
        }}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          ) : (
            <EmptyState onRefresh={refetch} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage && !isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const AssetItem = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getUserBridgeAssets"]["items"][number];
}) => {
  const unverifiedAssetModalRef = useRef<BottomSheetModal>(null);
  const { showUnverifiedAssets, setShowUnverifiedAssets } = useSettingsStore(
    useShallow((state) => ({
      showUnverifiedAssets: state.showUnverifiedAssets,
      setShowUnverifiedAssets: state.setShowUnverifiedAssets,
    }))
  );

  const isUnverified = !asset.isVerified;

  const CoinName = (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[styles.assetName, styles.assetNameWidth]}
    >
      {asset.coinName}
    </Text>
  );

  if (isUnverified && !showUnverifiedAssets) {
    return (
      <View style={styles.assetItem}>
        <View style={[styles.assetLeft, { opacity: 0.5 }]}>
          {asset.coinImageUrl && (
            <AssetImage
              uri={asset.coinImageUrl}
              style={styles.assetIcon}
              width={40}
              height={40}
            />
          )}
          <View>
            {CoinName}
            {asset.amount && (
              <Text type="caption" style={styles.assetAmount}>
                {formatPretty(asset.amount, { maxDecimals: 8 })}
              </Text>
            )}
          </View>
        </View>
        <Button
          title="Activate"
          variant="primary"
          buttonStyle={{ paddingVertical: 8, paddingHorizontal: 8 }}
          onPress={() => {
            unverifiedAssetModalRef.current?.present();
          }}
        />

        <UnverifiedAssetModal
          ref={unverifiedAssetModalRef}
          onActivate={() => {
            setShowUnverifiedAssets(true);
          }}
          assetSymbol={asset.coinDenom}
          assetImageUrl={asset.coinImageUrl}
        />
      </View>
    );
  }

  return (
    <Link
      href={{
        pathname: "/asset/[coinMinimalDenom]",
        params: {
          coinMinimalDenom: asset.coinMinimalDenom,
          coinDenom: asset.coinDenom,
          coinImageUrl: asset.coinImageUrl,
        },
      }}
      asChild
      push
    >
      <TouchableOpacity style={styles.assetItem}>
        <View style={styles.assetLeft}>
          {asset.coinImageUrl && (
            <AssetImage
              uri={asset.coinImageUrl}
              style={styles.assetIcon}
              width={40}
              height={40}
            />
          )}
          <View>
            {CoinName}
            {asset.amount && (
              <Text type="caption" style={styles.assetAmount}>
                {formatPretty(asset.amount, { maxDecimals: 8 })}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.assetRight}>
          <Text style={styles.price}>
            {asset.usdValue ? (
              <>
                {asset.usdValue.symbol}
                <SubscriptDecimal decimal={asset.usdValue.toDec()} />
              </>
            ) : (
              ""
            )}
          </Text>
          <Text
            style={[
              styles.percentage,
              {
                color: getChangeColor(
                  asset.priceChange24h?.toDec() || new Dec(0)
                ),
              },
            ]}
          >
            {asset.priceChange24h?.toString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>No Assets Found</Text>
      <Text style={styles.emptyStateDescription}>
        You don't have any assets in your portfolio yet.
      </Text>
      <Button
        title="Refresh"
        variant="primary"
        buttonStyle={styles.emptyStateButton}
        onPress={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 6,
  },
  assetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetIcon: {
    borderRadius: 20,
    marginRight: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "500",
  },
  assetRight: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "500",
  },
  percentage: {
    fontSize: 14,
  },
  loadingContainer: {
    paddingHorizontal: 24,
  },
  assetAmount: {
    color: Colors.osmoverse[400],
  },
  assetNameWidth: {
    width: 160,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 16,
    color: Colors.osmoverse[400],
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
