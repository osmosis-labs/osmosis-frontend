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
  variant?: "primary" | "secondary";
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  buttonStyle,
  textStyle,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary" ? styles.primary : styles.secondary,
        buttonStyle,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 255,
    alignItems: "center",
  },
  primary: {
    backgroundColor: Colors["wosmongton"][500],
  },
  secondary: {
    backgroundColor: Colors["osmoverse"][825],
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
