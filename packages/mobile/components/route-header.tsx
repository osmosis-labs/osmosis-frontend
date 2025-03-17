import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

import { ChevronLeftIcon } from "~/components/icons/chevron-left";

interface RouteHeaderProps {
  children: React.ReactNode;
  headerStyle?: ViewStyle;
}

export const RouteHeader: React.FC<RouteHeaderProps> = ({
  children,
  headerStyle,
}: RouteHeaderProps) => {
  const router = useRouter();

  return (
    <View style={[styles.header, headerStyle]}>
      <TouchableOpacity
        style={styles.chevronLeftIcon}
        onPress={() => router.back()}
      >
        <ChevronLeftIcon width={24} height={24} />
      </TouchableOpacity>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  chevronLeftIcon: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 44,
    height: 44,
  },
  assetDenom: {
    fontSize: 20,
    fontWeight: "600",
  },
});
