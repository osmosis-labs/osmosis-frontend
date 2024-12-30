import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { Colors } from "~/constants/theme-colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  buttonStyle,
  textStyle,
  disabled,
  icon,
}) => {
  let variantStyles = {};

  if (variant === "outline") {
    variantStyles = styles.outline;
  } else if (variant === "secondary") {
    variantStyles = styles.secondary;
  } else {
    variantStyles = styles.primary;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles,
        buttonStyle,
        disabled && styles.disabled,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 255,
    alignItems: "center",
  },
  primary: {
    backgroundColor: Colors["wosmongton"][500],
  },
  secondary: {
    backgroundColor: Colors["osmoverse"][825],
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors["osmoverse"][500],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
