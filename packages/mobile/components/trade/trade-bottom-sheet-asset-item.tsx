import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AssetImage } from "~/components/ui/asset-image";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { RouterOutputs } from "~/utils/trpc";

type AssetType = RouterOutputs["local"]["assets"]["getUserAssets"]["items"][0];

type BottomSheetAssetItemProps = {
  asset: AssetType;
  type?: "recommended" | "selectable";
};

export const TradeBottomSheetAssetItem = ({
  asset,
  type,
}: BottomSheetAssetItemProps) => {
  if (type === "recommended") {
    return (
      <TouchableOpacity style={styles.recommendedAssetItem}>
        <View style={styles.recommendedAssetLeft} key={asset.coinMinimalDenom}>
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
    <TouchableOpacity>
      <View style={styles.assetLeft} key={asset.coinMinimalDenom}>
        {asset.coinImageUrl && (
          <AssetImage uri={asset.coinImageUrl} style={styles.assetImage} />
        )}
        <View>
          <Text style={styles.assetName}>{asset.coinName}</Text>
          <Text type="caption" style={styles.assetDenom}>
            {asset.coinDenom}
          </Text>
        </View>
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
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: "500",
  },
  assetDenom: {
    color: Colors["osmoverse"][400],
  },
});
