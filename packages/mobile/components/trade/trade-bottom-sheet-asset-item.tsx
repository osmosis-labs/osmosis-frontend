import { formatPretty } from "@osmosis-labs/utils";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AssetImage } from "~/components/ui/asset-image";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useSwapAsset } from "~/hooks/swap/use-swap-asset";

type BottomSheetAssetItemProps = {
  asset: NonNullable<ReturnType<typeof useSwapAsset>["asset"]>;
  type?: "recommended" | "selectable";
  onClick: () => void;
};

export const TradeBottomSheetAssetItem = ({
  asset,
  type,
  onClick,
}: BottomSheetAssetItemProps) => {
  if (type === "recommended") {
    return (
      <TouchableOpacity
        style={styles.recommendedAssetItem}
        onPress={onClick}
        key={asset.coinMinimalDenom}
      >
        <View style={styles.recommendedAssetLeft}>
          {asset.coinImageUrl && (
            <AssetImage
              uri={asset.coinImageUrl}
              style={[styles.assetImage, styles.recommendedAssetImage]}
            />
          )}
          <View>
            <Text style={styles.assetName}>{asset.coinDenom}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onClick} key={asset.coinMinimalDenom}>
      <View style={styles.assetContainer}>
        <View style={styles.assetLeft}>
          {asset.coinImageUrl && (
            <AssetImage uri={asset.coinImageUrl} style={styles.assetImage} />
          )}
          <View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.assetName, styles.assetNameWidth]}
            >
              {asset.coinName}
            </Text>
            <Text type="caption" style={styles.assetDenom}>
              {asset.coinDenom}
            </Text>
          </View>
        </View>

        {asset.amount && (
          <View style={styles.assetRight}>
            {asset.usdValue && (
              <Text style={styles.assetBalance}>
                {asset.usdValue.toString()}
              </Text>
            )}
            <Text type="caption" style={styles.assetDenom}>
              {formatPretty(asset.amount.toDec())}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recommendedAssetItem: {
    borderColor: Colors["osmoverse"][700],
    borderWidth: 1,
    borderRadius: 255,
  },
  recommendedAssetLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    paddingRight: 8,
  },
  assetImage: {
    marginRight: 8,
  },
  recommendedAssetImage: {
    width: 24,
    height: 24,
  },
  assetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetRight: {
    alignItems: "flex-end",
  },
  assetName: {
    fontSize: 16,
    fontWeight: "500",
  },
  assetNameWidth: {
    width: 160,
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: "500",
  },
  assetDenom: {
    color: Colors["osmoverse"][400],
  },
});
