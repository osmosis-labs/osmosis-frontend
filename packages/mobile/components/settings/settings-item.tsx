import React from "react";
import { TouchableOpacity, View } from "react-native";

import { ChevronRightIcon } from "~/components/icons/chevron-right";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

interface SettingsItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  rightElement,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
      }}
    >
      {icon && <View style={{ marginRight: 12 }}>{icon}</View>}
      <View style={{ flex: 1 }}>
        <Text type="default">{title}</Text>
        {subtitle && (
          <Text
            type="default"
            style={{ color: Colors.osmoverse[400], fontSize: 14, marginTop: 4 }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <Text
          type="default"
          style={{ color: Colors.osmoverse[400], marginRight: 8 }}
        >
          {value}
        </Text>
      )}
      {rightElement ||
        (onPress && (
          <ChevronRightIcon
            width={24}
            height={24}
            fill={Colors.osmoverse[400]}
          />
        ))}
    </Container>
  );
};
