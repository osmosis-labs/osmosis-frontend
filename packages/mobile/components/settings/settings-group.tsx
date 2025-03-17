import React from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text type="subtitle" style={styles.title}>
        {title}
      </Text>
      <View style={{ gap: 5 }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    color: Colors.osmoverse[400],
    marginBottom: 8,
  },
});
