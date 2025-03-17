import React from "react";
import { Image, ImageStyle, StyleSheet, ViewStyle } from "react-native";

import { SvgUri } from "~/components/ui/svg-uri";

interface AssetImageProps {
  uri: string;
  width?: number;
  height?: number;
  style?: ViewStyle | ViewStyle[];
}

export const AssetImage = ({
  uri,
  width = 40,
  height = 40,
  style,
}: AssetImageProps) => {
  return uri.endsWith(".svg") ? (
    <SvgUri
      uri={uri}
      width={width}
      height={height}
      style={[styles.assetIcon, style]}
    />
  ) : (
    <Image
      source={{ uri }}
      width={width}
      height={height}
      style={[styles.assetIcon, style as ImageStyle]}
    />
  );
};

const styles = StyleSheet.create({
  assetIcon: {
    borderRadius: 20,
  },
});
