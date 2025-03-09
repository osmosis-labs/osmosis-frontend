import React from "react";
import { Image, ImageStyle, StyleSheet, ViewStyle } from "react-native";

import { SvgUri } from "~/components/ui/svg-uri";

interface AssetImageProps {
  uri: string;
  style?: ViewStyle | ViewStyle[];
}

export const AssetImage = ({ uri, style }: AssetImageProps) => {
  return uri.endsWith(".svg") ? (
    <SvgUri uri={uri} style={[styles.assetIcon, style]} />
  ) : (
    <Image source={{ uri }} style={[styles.assetIcon, style as ImageStyle]} />
  );
};

const styles = StyleSheet.create({
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
