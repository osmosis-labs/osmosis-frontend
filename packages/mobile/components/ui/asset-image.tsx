import React from "react";
import { Image, ImageStyle, StyleSheet, ViewStyle } from "react-native";
import { SvgUri } from "react-native-svg";

interface AssetImageProps {
  uri: string;
  style?: ViewStyle;
}

export const AssetImage = ({ uri, style }: AssetImageProps) => {
  return uri.endsWith(".svg") ? (
    <SvgUri
      uri={uri}
      width={40}
      height={40}
      style={[styles.assetIcon, style]}
    />
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
